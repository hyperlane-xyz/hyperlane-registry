# Relayer denylist

`mainnet-denylist.json` is polled by Hyperlane's mainnet relayers (`runtimeDenylistUrl`). Merged changes apply without a relayer deploy, within about 6 minutes: `raw.githubusercontent.com` caches files for 5 minutes, and relayers poll every minute.

Each rule needs `reason` and `addedBy`, and optionally `expiresAt` (RFC 3339). It also needs exactly one of:

- `match`: `MatchingList` fields (`messageId`, `originDomain`, `senderAddress`, `destinationDomain`, `recipientAddress`, `bodyRegex`). It must set at least one field other than `bodyRegex`.
- `address`: EVM hex, Solana base58, Tron base58 (checksum verified), or bech32. It matches the message sender, the recipient, the warp transfer recipient, or any signer of the origin transaction (catches warp depositors).

```json
{
  "reason": "Binance hot wallet exploit 2026-10-29",
  "addedBy": "jon",
  "address": "0xA97bF7836F8A08F9Ed91D41453D371493FAE8d10"
}
```

The relayer rejects the whole file if any rule is invalid, and keeps the previous rules. `pnpm run test:unit` runs the same checks.
