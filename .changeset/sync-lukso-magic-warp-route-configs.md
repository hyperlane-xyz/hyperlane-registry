---
'@hyperlane-xyz/registry': patch
---

The LYX/lukso, USDC/lukso and MAGIC/abstract warp route deploy configs were synced to on-chain state by adding the missing token decimals and destination gas, the enrolled LYX base remote router and the still-enrolled MAGIC ronin remote router as temporary explicit mappings, and by removing the redundant MAGIC synthetic token addresses. Comments documenting the base and ronin decisions were added.
