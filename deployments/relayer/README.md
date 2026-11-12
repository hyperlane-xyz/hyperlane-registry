# Relayer denylist

`mainnet-denylist.json` is the runtime denylist for Hyperlane's mainnet relayers; `testnet-denylist.json` is the separate feed for testnet relayers.

Polling requires an initial relayer deployment with runtime denylist support and `runtimeDenylistUrl` configured for the environment's feed in hyperlane, rc, and fastpath. [hyperlane-monorepo#9957](https://github.com/hyperlane-xyz/hyperlane-monorepo/pull/9957) prepares that rollout; merging a feed or rule change does not deploy agents or enable polling. Once the configured agents are deployed, subsequent merged rule changes apply without a redeploy, within about 6 minutes: `raw.githubusercontent.com` caches files for 5 minutes, and relayers poll every minute.

Each rule needs `reason` and `addedBy`, and optionally `expiresAt` (RFC 3339). It also needs exactly one of:

- `match`: `MatchingList` fields (`messageId`, `originDomain`, `senderAddress`, `destinationDomain`, `recipientAddress`, `bodyRegex`). It must set at least one of `messageId`, `originDomain`, `senderAddress`, `destinationDomain`, or `recipientAddress` to a non-wildcard value. `bodyRegex` alone does not satisfy this requirement.
- `address`: EVM hex, Solana base58, Tron base58 (checksum verified), or bech32. It matches the message sender, the recipient, the warp transfer recipient, or any signer of the origin transaction (catches warp depositors).

Rebalancers configured with the `relayerDenylist` middleware also read this feed. Only `match` rules that set nothing but `messageId` apply to their rebalance messages, which then stop counting as incoming collateral. Deny a rebalance message only after confirming its funds settled another way, e.g. CCTP delivered them; otherwise the rebalancer sends a replacement, possibly into the same failing path.

Origin transaction signer matching, including Tron depositor matching, requires a deployed relayer release containing [hyperlane-monorepo#9952](https://github.com/hyperlane-xyz/hyperlane-monorepo/pull/9952). Adding an address here does not enable signer matching on older relayers.

The seven legacy exploit addresses set `matchBody: true` on their existing `address` rules. This opts a 20-byte EVM hex address into scanning the entire message body at byte boundaries, including nested ICA calldata. Other address rules keep exact field and origin-signer matching. Removal and expiry apply to the whole rule, so there is no separate regex or domain list to maintain. `matchBody` is invalid on `match` rules; `true` is rejected for 32-byte hex, base58 and bech32 addresses.

This option requires the relayer implementation in [hyperlane-monorepo#9957](https://github.com/hyperlane-xyz/hyperlane-monorepo/pull/9957). Older parsers reject the new field and retain their previous policy. Use a compatible image for the initial rollout; upgrade any existing runtime-feed consumers before publishing this field to their feed.

```json
{
  "reason": "Binance hot wallet exploit 2026-10-29",
  "addedBy": "jon",
  "address": "0xA97bF7836F8A08F9Ed91D41453D371493FAE8d10"
}
```

The relayer rejects the whole file if any rule is invalid, and keeps the previous rules. `pnpm run test:unit` runs the same checks.
