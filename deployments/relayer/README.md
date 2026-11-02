# Relayer denylist

`mainnet-denylist.json` is polled by Hyperlane's mainnet relayers (one of `runtimeDenylistUrls`). Merged changes apply within about a minute, without a relayer deploy.

Each rule needs `reason` and `addedBy`, and optionally `expiresAt` (RFC 3339). It also needs exactly one of:

- `match`: `MatchingList` fields (`messageId`, `originDomain`, `senderAddress`, `destinationDomain`, `recipientAddress`, `bodyRegex`). It must constrain at least one field.
- `address`: EVM hex, Solana or Tron base58, or bech32. It matches the message sender, the recipient, the warp transfer recipient, or any signer of the origin transaction (catches warp depositors).

```json
{
  "reason": "Binance hot wallet exploit 2026-10-29",
  "addedBy": "jon",
  "address": "0xA97bF7836F8A08F9Ed91D41453D371493FAE8d10"
}
```

The relayer rejects the whole file if any rule is invalid, and keeps the previous rules. `pnpm run test:unit` runs the same checks.
