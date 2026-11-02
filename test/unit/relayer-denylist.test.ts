import { createHash } from 'crypto';
import fs from 'fs';

import { isValidAddressEvm, isValidAddressSealevel } from '@hyperlane-xyz/utils';
import { expect } from 'chai';
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
// The relayer uses Rust's `regex` crate: no lookaround or backreferences.
const BodyRegex = z
  .string()
  .min(1)
  .refine((pattern) => {
    try {
      new RegExp(pattern);
    } catch {
      return false;
    }
    return !/\(\?<?[=!]|\\[1-9]/.test(pattern);
  }, 'must compile as a Rust regex (no lookaround or backreferences)');

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
function isValidDenylistAddress(address: string): boolean {
  if (address.startsWith('0x')) {
    return /^0x[0-9a-fA-F]{64}$/.test(address) || isValidAddressEvm(address);
  }
  const bytes = base58Decode(address);
  if (bytes?.length === 25) {
    const checksum = sha256(sha256(bytes.subarray(0, 21))).subarray(0, 4);
    return bytes[0] === 0x41 && Buffer.from(bytes.subarray(21)).equals(checksum);
  }
  if (bytes?.length === 32) return isValidAddressSealevel(address);
  return /^[a-z0-9]+1[02-9ac-hj-np-z]+$/.test(address);
}

const Address = z
  .string()
  .refine(isValidDenylistAddress, 'EVM hex (20 or 32 bytes), Tron or Solana base58, or bech32')
  .refine((address) => !/^0x0+$/.test(address), 'must not be the zero address');

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

  it('uses only known domain IDs', () => {
    const domainIds = new Set(Object.values(chainMetadata).map((metadata) => metadata.domainId));
    const unknown = rules
      .flatMap((rule) => [rule.match?.originDomain, rule.match?.destinationDomain])
      .flatMap((filter) => (Array.isArray(filter) ? filter : [filter]))
      .filter((domain) => domain !== undefined && domain !== '*' && !domainIds.has(Number(domain)));
    expect(unknown).to.deep.equal([]);
  });

  it('has no duplicate message IDs or addresses', () => {
    const keys = rules.map((rule) =>
      rule.address !== undefined
        ? rule.address.toLowerCase()
        : JSON.stringify(rule.match).toLowerCase(),
    );
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    expect(duplicates).to.deep.equal([]);
  });
});
