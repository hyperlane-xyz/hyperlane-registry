# Relayer denylist

`mainnet-denylist.json` is the runtime denylist for Hyperlane's mainnet relayers; `testnet-denylist.json` is the separate feed for testnet relayers.

Polling requires an initial relayer deployment with runtime denylist support and `runtimeDenylistUrl` configured for the environment's feed in hyperlane, rc, and fastpath. [hyperlane-monorepo#9957](https://github.com/hyperlane-xyz/hyperlane-monorepo/pull/9957) prepares that rollout; merging a feed or rule change does not deploy agents or enable polling. Once the configured agents are deployed, subsequent merged rule changes apply without a redeploy, within about 6 minutes: `raw.githubusercontent.com` caches files for 5 minutes, and relayers poll every minute.

Each rule needs `reason` and `addedBy`, and optionally `expiresAt` (RFC 3339). It also needs exactly one of:

- `match`: `MatchingList` fields (`messageId`, `originDomain`, `senderAddress`, `destinationDomain`, `recipientAddress`, `bodyRegex`). It must set at least one of `messageId`, `originDomain`, `senderAddress`, `destinationDomain`, or `recipientAddress` to a non-wildcard value. `bodyRegex` alone does not satisfy this requirement.
- `address`: EVM hex, Solana base58, Tron base58 (checksum verified), or bech32. It matches the message sender, the recipient, the warp transfer recipient, or any signer of the origin transaction (catches warp depositors).

Origin transaction signer matching, including Tron depositor matching, requires a deployed relayer release containing [hyperlane-monorepo#9952](https://github.com/hyperlane-xyz/hyperlane-monorepo/pull/9952). Adding an address here does not enable signer matching on older relayers.

The seven legacy exploit addresses also have a shared `match` rule in each feed to preserve the old static blacklist's whole-body scan. Its `bodyRegex` matches those 20-byte addresses at any byte offset, including nested ICA calldata; the `originDomain` list covers every registered origin in that environment. When adding a chain, extend that list. When removing a legacy address, remove both its `address` rule and its regex alternative in the same edit. Tests check the domain scope and that the two representations stay in sync. Other address rules retain exact field and origin-signer matching.

```json
{
  "reason": "Binance hot wallet exploit 2026-10-29",
  "addedBy": "jon",
  "address": "0xA97bF7836F8A08F9Ed91D41453D371493FAE8d10"
}
```

The relayer rejects the whole file if any rule is invalid, and keeps the previous rules. `pnpm run test:unit` runs the same checks.
