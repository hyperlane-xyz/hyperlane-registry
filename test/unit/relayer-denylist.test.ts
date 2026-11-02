import { createHash } from 'crypto';
import fs from 'fs';

import {
  addressToBytesCosmos,
  isValidAddressCosmos,
  isValidAddressEvm,
  isValidAddressSealevel,
} from '@hyperlane-xyz/utils';
import { expect } from 'chai';
import { RRegex } from 'rregex';
import { z } from 'zod';

import { chainMetadata } from '../../dist/index.js';

// Mirrors the relayer's runtime denylist parser
// (rust/main/agents/relayer/src/msg/runtime_denylist.rs in hyperlane-monorepo),
// which rejects the whole file if any rule is invalid.
const DENYLIST_PATH = './deployments/relayer/mainnet-denylist.json';

const EXACT_MATCH_KEYS = [
  'messageId',
  'originDomain',
  'senderAddress',
  'destinationDomain',
  'recipientAddress',
] as const;

// Per-field rules from the relayer's `Filter` deserializers: a field is `*`
// or specific values; `*` isn't allowed inside a list, and an empty list
// (which matches nothing) is rejected.
const DomainId = z.union([
  z
    .number()
    .int()
    .nonnegative()
    .max(2 ** 32 - 1),
  z.string().regex(/^\d+$/, 'decimal domain ID'),
]);
const DomainFilter = z.union([z.literal('*'), DomainId, z.array(DomainId).min(1)]);
const AddressValue = z.string().refine(isValidDenylistAddress, 'EVM hex, base58 or bech32 address');
const AddressFilter = z.union([z.literal('*'), AddressValue, z.array(AddressValue).min(1)]);
const MessageId = z.string().regex(/^0x[0-9a-fA-F]{64}$/, '0x-prefixed 32-byte message ID');
const MessageIdFilter = z.union([z.literal('*'), MessageId, z.array(MessageId).min(1)]);
// rregex 1.10.12 bundles regex 1.10.5; the relayer's 1.10.6 patch only
// fixes the unstable Pattern trait, without changing regex syntax.
// Compile with Rust's regex engine, as the relayer does. JavaScript's
// RegExp accepts escapes Rust rejects and rejects Rust's inline flags.
const BodyRegex = z.string().refine((pattern) => {
  try {
    const regex = new RRegex(pattern);
    regex.free();
    return true;
  } catch {
    return false;
  }
}, 'must compile as a Rust regex');

const Match = z
  .strictObject({
    messageId: MessageIdFilter.optional(),
    originDomain: DomainFilter.optional(),
    senderAddress: AddressFilter.optional(),
    destinationDomain: DomainFilter.optional(),
    recipientAddress: AddressFilter.optional(),
    bodyRegex: BodyRegex.optional(),
  })
  // Missing fields are wildcards and bodyRegex alone can match anything.
  .refine(
    (match) => EXACT_MATCH_KEYS.some((key) => match[key] !== undefined && match[key] !== '*'),
    {
      message:
        '`match` must set messageId, originDomain, senderAddress, destinationDomain or recipientAddress',
    },
  );

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Decode(value: string): Uint8Array | undefined {
  let n = 0n;
  for (const char of value) {
    const digit = BASE58_ALPHABET.indexOf(char);
    if (digit < 0) return undefined;
    n = n * 58n + BigInt(digit);
  }
  const bytes: number[] = [];
  for (; n > 0n; n /= 256n) bytes.unshift(Number(n % 256n));
  const leadingZeros = value.length - value.replace(/^1+/, '').length;
  return Uint8Array.from([...new Array(leadingZeros).fill(0), ...bytes]);
}

const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest();

// Same formats as the relayer: EVM hex (20 or 32 bytes), Tron base58check
// (0x41 prefix and checksum verified), 32-byte base58 (Solana) or bech32.
function decodeDenylistAddress(address: string): Uint8Array | undefined {
  if (address.startsWith('0x')) {
    if (!/^0x[0-9a-fA-F]{64}$/.test(address) && !isValidAddressEvm(address)) return undefined;
    return Buffer.from(address.slice(2), 'hex');
  }
  const bytes = base58Decode(address);
  if (bytes?.length === 25) {
    const checksum = sha256(sha256(bytes.subarray(0, 21))).subarray(0, 4);
    if (bytes[0] !== 0x41 || !Buffer.from(bytes.subarray(21)).equals(checksum)) return undefined;
    return bytes.subarray(1, 21);
  }
  if (bytes?.length === 32 && isValidAddressSealevel(address)) return bytes;
  // Rule out denoms, then verify the checksum and Rust's maximum payload size.
  if (!/^[a-z0-9]+1[02-9ac-hj-np-z]+$/.test(address) || !isValidAddressCosmos(address))
    return undefined;
  const decoded = addressToBytesCosmos(address);
  return decoded.length <= 32 ? decoded : undefined;
}

function isValidDenylistAddress(address: string): boolean {
  return decodeDenylistAddress(address) !== undefined;
}

// Rust rejects the decoded zero address, excluding Tron framing bytes and
// bech32 encoding. Zero values remain valid in sender/recipient match filters.
const Address = AddressValue.refine(
  (address) => decodeDenylistAddress(address)?.some((byte) => byte !== 0) ?? false,
  'must not be the zero address',
);

const Rule = z
  .strictObject({
    reason: z.string().trim().min(1),
    addedBy: z.string().trim().min(1),
    expiresAt: z.iso.datetime({ offset: true }).optional(),
    match: Match.optional(),
    address: Address.optional(),
  })
  .refine((rule) => (rule.match === undefined) !== (rule.address === undefined), {
    message: 'exactly one of `match` or `address` must be set',
  });

const Denylist = z.strictObject({ rules: z.array(Rule) });

function duplicateRuleKey(rule: z.infer<typeof Rule>): string {
  if (rule.address !== undefined) {
    return rule.address.startsWith('0x') ? rule.address.toLowerCase() : rule.address;
  }
  // Only hex IDs/addresses are case-insensitive. Regex text and base58 are not.
  return JSON.stringify(rule.match, (key: string, value: unknown) =>
    key !== 'bodyRegex' && typeof value === 'string' && value.startsWith('0x')
      ? value.toLowerCase()
      : value,
  );
}

describe('Relayer denylist', () => {
  const raw = JSON.parse(fs.readFileSync(DENYLIST_PATH, 'utf8'));
  const { rules } = Denylist.parse(raw);

  it('rejects rules the relayer would reject', () => {
    const base = { reason: 'r', addedBy: 'a' };
    const invalid = [
      { ...base, match: {} },
      { ...base, match: { originDomain: '*' } },
      { ...base, match: { bodyRegex: '.*' } },
      { ...base, match: { messageId: null } },
      { ...base, match: { messageId: 123 } },
      { ...base, match: { messageId: ['*'] } },
      { ...base, match: { originDomain: ['*', 1] } },
      { ...base, match: { messageId: [] } },
      { ...base, match: { originDomain: 1, bodyRegex: '(' } },
      { ...base, match: { originDomain: 1, bodyRegex: 'ab(?=cd)' } },
      { ...base, match: { originDomain: 1, bodyRegex: '\\k<name>' } },
      { ...base, match: { originDomain: 1, bodyRegex: '\\cA' } },
      { ...base, match: { originDomain: 1, bodyRegex: '\\uD800' } },
      { ...base, match: { originDomain: 1, bodyRegex: 'a{1000000000}' } },
      { ...base, address: 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb' },
      { ...base, address: 'cosmos1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqnrql8a' },
      // Valid bech32 checksum, but a 33-byte payload does not fit Rust's H256.
      { ...base, address: 'cosmos1qyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqsz9w522u' },
      {
        ...base,
        match: {
          originDomain: 1,
          senderAddress: 'cosmos1qyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqsz9w522u',
        },
      },
      // Solana's all-zero pubkey, and a bech32 address with its last character changed.
      { ...base, address: '11111111111111111111111111111111' },
      { ...base, address: 'cosmos18888888888888888888888888888888824y2mq' },
      // One character changed from a valid Tron address.
      { ...base, address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6u' },
      { ...base, match: { messageID: '0x01' } },
      { ...base, address: '0x0000000000000000000000000000000000000000' },
      { ...base, address: 'not an address' },
      {
        ...base,
        address: '0xA97bF7836F8A08F9Ed91D41453D371493FAE8d10',
        match: { originDomain: 1 },
      },
      { reason: 'r', address: '0xA97bF7836F8A08F9Ed91D41453D371493FAE8d10' },
      { ...base, address: '0xA97bF7836F8A08F9Ed91D41453D371493FAE8d10', expiresAt: 'tomorrow' },
    ];
    for (const rule of invalid) {
      expect(Denylist.safeParse({ rules: [rule] }).success, JSON.stringify(rule)).to.be.false;
    }
  });

  it('accepts each address format the relayer accepts', () => {
    const base = { reason: 'r', addedBy: 'a' };
    for (const address of [
      'cosmos18888888888888888888888888888888824y2mu',
      'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      '0xA97bF7836F8A08F9Ed91D41453D371493FAE8d10',
    ]) {
      expect(Denylist.safeParse({ rules: [{ ...base, address }] }).success, address).to.be.true;
    }
  });

  it('allows decoded zero addresses only in match filters', () => {
    for (const address of [
      '0x0000000000000000000000000000000000000000',
      'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
      'cosmos1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqnrql8a',
    ]) {
      const base = { reason: 'r', addedBy: 'a' };
      expect(Denylist.safeParse({ rules: [{ ...base, address }] }).success, address).to.be.false;
      const rule = { ...base, match: { originDomain: 1, senderAddress: address } };
      expect(Denylist.safeParse({ rules: [rule] }).success, address).to.be.true;
    }
  });

  it('accepts Rust regex syntax', () => {
    for (const bodyRegex of ['(?i)^ab[0-9a-f]{2}$', '\\Aab\\z', '']) {
      const rule = { reason: 'r', addedBy: 'a', match: { originDomain: 1, bodyRegex } };
      expect(Denylist.safeParse({ rules: [rule] }).success, bodyRegex).to.be.true;
    }
  });

  it('uses only known domain IDs', () => {
    const domainIds = new Set(Object.values(chainMetadata).map((metadata) => metadata.domainId));
    const unknown = rules
      .flatMap((rule) => [rule.match?.originDomain, rule.match?.destinationDomain])
      .flatMap((filter) => (Array.isArray(filter) ? filter : [filter]))
      .filter((domain) => domain !== undefined && domain !== '*' && !domainIds.has(Number(domain)));
    expect(unknown).to.deep.equal([]);
  });

  it('preserves regex and base58 case when checking duplicates', () => {
    const base = { reason: 'r', addedBy: 'a' };
    const keyForMatch = (bodyRegex: string) =>
      duplicateRuleKey(Rule.parse({ ...base, match: { originDomain: 1, bodyRegex } }));
    expect(keyForMatch('\\D+')).not.to.equal(keyForMatch('\\d+'));
    expect(keyForMatch('0xAB')).not.to.equal(keyForMatch('0xab'));

    const native = 'AffzFDKZbyMiU11zmVBoAqD25ugpr7xoWWyRyGigBEaU';
    const nativeVariant = native.slice(0, 1) + native.slice(1).toLowerCase();
    const keyForAddress = (address: string) => duplicateRuleKey(Rule.parse({ ...base, address }));
    expect(keyForAddress(native)).not.to.equal(keyForAddress(nativeVariant));
    const keyForSender = (senderAddress: string) =>
      duplicateRuleKey(Rule.parse({ ...base, match: { originDomain: 1, senderAddress } }));
    expect(keyForSender(native)).not.to.equal(keyForSender(nativeVariant));

    const hex = '0xA97bF7836F8A08F9Ed91D41453D371493FAE8d10';
    expect(keyForAddress(hex)).to.equal(keyForAddress(hex.toLowerCase()));
    expect(keyForSender(hex)).to.equal(keyForSender(hex.toLowerCase()));
    const keyForMessage = (messageId: string) =>
      duplicateRuleKey(Rule.parse({ ...base, match: { messageId } }));
    expect(keyForMessage('0x' + 'AB'.repeat(32))).to.equal(keyForMessage('0x' + 'ab'.repeat(32)));
  });

  it('has no duplicate message IDs or addresses', () => {
    const keys = rules.map(duplicateRuleKey);
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    expect(duplicates).to.deep.equal([]);
  });
});
