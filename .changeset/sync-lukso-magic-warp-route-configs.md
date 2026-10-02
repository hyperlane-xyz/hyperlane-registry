---
'@hyperlane-xyz/registry': patch
---

The LYX/lukso, USDC/lukso, MAGIC/abstract and SOLX/nitro warp route deploy configs were synced to on-chain state by adding the missing token decimals, scale and destination gas, the enrolled LYX base remote router and the still-enrolled MAGIC ronin remote router as temporary explicit mappings, the SOLX solanamainnet routing message-id multisig ISM program, and by removing the redundant MAGIC synthetic token addresses. The SOLX scale was also added to its core config. Comments documenting the base and ronin decisions were added. The `@hyperlane-xyz/sdk` and `@hyperlane-xyz/utils` development dependencies were updated to 45.0.0, so the warp route check runs on the CLI release that can read these routes.
