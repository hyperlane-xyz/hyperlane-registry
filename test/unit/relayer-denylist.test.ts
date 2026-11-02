import fs from 'fs';

import { expect } from 'chai';
import { z } from 'zod';

import { chainMetadata } from '../../dist/index.js';

// Mirrors the relayer's runtime denylist parser
// (rust/main/agents/relayer/src/msg/runtime_denylist.rs in hyperlane-monorepo),
// which rejects the whole file if any rule is invalid.
const DENYLIST_PATH = './deployments/relayer/mainnet-denylist.json';

const Scalar = z.union([z.string().min(1), z.number().int().nonnegative()]);
const Filter = z.union([Scalar, z.array(Scalar).min(1)]);
const Match = z
  .strictObject({
    messageId: Filter.optional(),
    originDomain: Filter.optional(),
    senderAddress: Filter.optional(),
    destinationDomain: Filter.optional(),
    recipientAddress: Filter.optional(),
    bodyRegex: z.string().min(1).optional(),
  })
  .refine((match) => Object.values(match).some((value) => value !== '*'), {
    message: '`match` must constrain at least one field; it would block every message',
  });

const ADDRESS_REGEX =
  /^(0x([0-9a-fA-F]{40}|[0-9a-fA-F]{64})|[1-9A-HJ-NP-Za-km-z]{32,44}|[a-z0-9]+1[02-9ac-hj-np-z]+)$/;
const Address = z
  .string()
  .regex(ADDRESS_REGEX, 'EVM hex (20 or 32 bytes), base58 or bech32')
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
