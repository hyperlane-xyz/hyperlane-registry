import { createHash } from 'crypto';
import fs from 'fs';

import {
  addressToBytesCosmos,
  isValidAddressCosmos,
  isValidAddressEvm,
  isValidAddressSealevel,
} from '@hyperlane-xyz/utils';
import { expect } from 'chai';
import { RE2JS } from 're2js';
import { RRegex } from 'rregex';
import { z } from 'zod';

import { chainMetadata } from '../../dist/index.js';

// Mirrors the relayer's runtime denylist parser
// (rust/main/agents/relayer/src/msg/runtime_denylist.rs in hyperlane-monorepo),
// which rejects the whole file if any rule is invalid.
const DENYLIST_PATHS = [
  './deployments/relayer/mainnet-denylist.json',
  './deployments/relayer/testnet-denylist.json',
];

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
// The rebalancer matches bodyRegex with re2js (RE2), whose syntax differs from
// Rust's regex crate: e.g. `[a-f&&b-f]` is a class intersection in Rust but
// literal `&` characters in RE2. Only allow syntax both engines read the same
// way, so every rule behaves identically in the relayer and the rebalancer.
const COMPATIBLE_REGEX_TOKEN =
  /\(\?i\)|\\[AzdD]|\^|\$|\.|[0-9a-zA-Z]|\[\^?(?:[0-9a-zA-Z](?:-[0-9a-zA-Z])?)+\]|\(\?:|\(|\)|\||[*+?]|\{(0|[1-9]\d{0,3})(,(0|[1-9]\d{0,3})?)?\}/y;
// RE2's per-count repetition limit, checked at the syntax level; compiling
// with RE2JS also enforces it across nested repetitions.
const MAX_REGEX_REPETITION = 1000;
// The rebalancer's group-depth cap, which also counts the `(` of `(?i)`.
const MAX_REGEX_GROUP_DEPTH = 60;
const NON_ATOM_TOKENS = new Set(['^', '$', '\\A', '\\z', '(?i)', '(', '(?:', '|']);
// Rust's compiled-size limit, in units of the cheapest atom.
const MAX_RELAYER_REGEX_SIZE = 10_000;

function tokenizeRegex(pattern: string): RegExpExecArray[] | undefined {
  const tokens: RegExpExecArray[] = [];
  COMPATIBLE_REGEX_TOKEN.lastIndex = 0;
  while (COMPATIBLE_REGEX_TOKEN.lastIndex < pattern.length) {
    const match = COMPATIBLE_REGEX_TOKEN.exec(pattern);
    if (!match) return undefined;
    tokens.push(match);
  }

  return tokens;
}

function usesCompatibleRegexSyntax(pattern: string): boolean {
  const tokens = tokenizeRegex(pattern);
  if (!tokens) return false;

  let afterAtom = false;
  let depth = 0;
  for (const [token, min, , max] of tokens) {
    if (token.startsWith('(')) {
      if (depth + 1 > MAX_REGEX_GROUP_DEPTH) return false;
      if (token !== '(?i)') depth++;
    } else if (token === ')') {
      depth--;
    }

    if (!/^[*+?{]/.test(token)) {
      afterAtom = !NON_ATOM_TOKENS.has(token);
      continue;
    }

    // A quantifier must follow an atom: no stacked or lazy quantifiers.
    if (!afterAtom) return false;
    if (min !== undefined) {
      const counts = [min, max].filter((count) => count !== undefined).map(Number);
      if (counts.some((count) => count > MAX_REGEX_REPETITION)) return false;
    }
    afterAtom = false;
  }

  return true;
}

function atomSize(token: string): number {
  if (token === '|') return 0;
  if (token === '\\D') return 100;
  if (token === '\\d') return 10;
  if (token.startsWith('[')) {
    const negated = token[1] === '^';
    return Math.max(negated ? 100 : 2, token.length - (negated ? 3 : 2));
  }

  return 1;
}

// Mirrors the rebalancer's `exceedsRelayerRegexSize` (same costs and limit),
// since rregex does not enforce Rust's compiled-size limit: a repetition
// multiplies its atom or group by its largest count, and alternatives add up.
function fitsRelayerRegexSize(pattern: string): boolean {
  // Unsupported syntax is rejected by usesCompatibleRegexSyntax.
  const tokens = tokenizeRegex(pattern) ?? [];
  const groupSizes = [0];
  let lastSize = 0;
  for (const [token, min, range, max] of tokens) {
    const top = groupSizes.length - 1;
    if (token === '(?i)') {
      lastSize = 0;
      continue;
    }
    if (token === '(' || token === '(?:') {
      groupSizes.push(0);
      lastSize = 0;
    } else if (token === ')') {
      lastSize = groupSizes.pop() ?? 0;
      groupSizes[groupSizes.length - 1] += lastSize;
    } else if (/^[*+?{]/.test(token)) {
      let copies = token === '+' ? 2 : 1;
      if (min !== undefined) {
        if (range === undefined) copies = Number(min);
        else copies = max === undefined ? Number(min) + 1 : Number(max);
      }
      groupSizes[top] += lastSize * (copies - 1);
      lastSize *= copies;
    } else {
      lastSize = atomSize(token);
      groupSizes[top] += lastSize;
    }

    if (groupSizes.some((size) => size > MAX_RELAYER_REGEX_SIZE)) return false;
  }

  return true;
}

const BodyRegex = z
  .string()
  .refine((pattern) => {
    try {
      const regex = new RRegex(pattern);
      regex.free();
      return true;
    } catch {
      return false;
    }
  }, 'must compile as a Rust regex')
  .refine((pattern) => {
    try {
      RE2JS.compile(pattern);
      return true;
    } catch {
      return false;
    }
  }, "must compile as an RE2 regex (the rebalancer's engine)")
  .refine(
    usesCompatibleRegexSyntax,
    'must only use regex syntax the rebalancer reads like the relayer',
  )
  .refine(fitsRelayerRegexSize, "may exceed the relayer's regex size limit");

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
    matchBody: z.boolean().optional(),
  })
  .refine((rule) => (rule.match === undefined) !== (rule.address === undefined), {
    message: 'exactly one of `match` or `address` must be set',
  })
  .refine((rule) => rule.matchBody === undefined || rule.address !== undefined, {
    message: '`matchBody` is only valid on an `address` rule',
  })
  .refine((rule) => rule.matchBody !== true || /^0x[0-9a-fA-F]{40}$/.test(rule.address ?? ''), {
    message: '`matchBody` requires a 20-byte EVM hex address',
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
  it('accepts explicit body scanning only for 20-byte EVM address rules', () => {
    const base = { reason: 'r', addedBy: 'a' };
    for (const matchBody of [false, true]) {
      const rule = { ...base, address: '0xA97bF7836F8A08F9Ed91D41453D371493FAE8d10', matchBody };
      expect(Denylist.safeParse({ rules: [rule] }).success).to.be.true;
    }
    expect(
      Denylist.safeParse({
        rules: [{ ...base, address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', matchBody: false }],
      }).success,
    ).to.be.true;
  });

  it('rejects rules the relayer would reject', () => {
    const base = { reason: 'r', addedBy: 'a' };
    const invalid = [
      { ...base, match: {} },
      { ...base, match: { originDomain: 1 }, matchBody: false },
      { ...base, address: 'AffzFDKZbyMiU11zmVBoAqD25ugpr7xoWWyRyGigBEaU', matchBody: true },
      { ...base, address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', matchBody: true },
      { ...base, address: '0x' + 'aa'.repeat(32), matchBody: true },
      { ...base, address: '0x' + 'aa'.repeat(20), matchBody: 'true' },
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
    for (const bodyRegex of [
      '(?i)^ab[0-9a-f]{2}$',
      '\\Aab\\z',
      '',
      '(?:a{500}){2}',
      '\\D{100}',
      '[0-9a-f]{1000}',
      '(?:\\D{50})+',
      '\\D{99,}',
      '\\D{50}|\\D{50}',
      '\\d{1000}',
      '('.repeat(60) + 'a' + ')'.repeat(60),
      '(?:'.repeat(60) + 'a' + ')'.repeat(60),
      '(?i)' + '('.repeat(60) + 'a' + ')'.repeat(60),
    ]) {
      const rule = { reason: 'r', addedBy: 'a', match: { originDomain: 1, bodyRegex } };
      expect(Denylist.safeParse({ rules: [rule] }).success, bodyRegex).to.be.true;
    }
  });

  it('rejects Rust regex syntax the rebalancer reads differently or not at all', () => {
    for (const bodyRegex of [
      '[a-f&&b-f]',
      '[a-f--b]',
      '[a[bc]]',
      '(?x)a b',
      '\\<ab\\>',
      '\\b{start}ab',
      '\\u{61}',
      'a**',
      'a*?',
      'a{1001}',
      '(?P<n>a)',
      '(a{1000}){2}',
      '((a{10}){10}){11}',
      '(a{500,1000}){2}',
      '\\D{900}',
      '[^a]{101}',
      '(?:\\D{51})+',
      '\\D{100,}',
      '\\D{50}|\\D{51}',
      '\\d{1000}a',
      '('.repeat(61) + 'a' + ')'.repeat(61),
      '(?:'.repeat(61) + 'a' + ')'.repeat(61),
      '('.repeat(60) + '(?i)a' + ')'.repeat(60),
    ]) {
      const rule = { reason: 'r', addedBy: 'a', match: { originDomain: 1, bodyRegex } };
      expect(Denylist.safeParse({ rules: [rule] }).success, bodyRegex).to.be.false;
    }
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
});

for (const path of DENYLIST_PATHS) {
  describe(`Relayer denylist file: ${path}`, () => {
    const raw = JSON.parse(fs.readFileSync(path, 'utf8'));
    const { rules } = Denylist.parse(raw);
    it('opts legacy exploit addresses into body scanning without duplicating policy', () => {
      const legacyRules = rules.filter((rule) => rule.reason.includes('[from relayer.ts,'));
      expect(legacyRules.length).to.be.greaterThan(0);
      for (const rule of legacyRules) {
        expect(rule.matchBody, rule.address).to.equal(true);
      }
    });

    it('uses only known domain IDs', () => {
      const domainIds = new Set(Object.values(chainMetadata).map((metadata) => metadata.domainId));
      const unknown = rules
        .flatMap((rule) => [rule.match?.originDomain, rule.match?.destinationDomain])
        .flatMap((filter) => (Array.isArray(filter) ? filter : [filter]))
        .filter(
          (domain) => domain !== undefined && domain !== '*' && !domainIds.has(Number(domain)),
        );
      expect(unknown).to.deep.equal([]);
    });

    it('has no duplicate message IDs or addresses', () => {
      const keys = rules.map(duplicateRuleKey);
      const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
      expect(duplicates).to.deep.equal([]);
    });
  });
}
