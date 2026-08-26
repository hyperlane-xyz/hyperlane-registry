---
'@hyperlane-xyz/registry': patch
---

the four deactivated extra bridges on the oUSDT production warp route, two on base and two on optimism, are removed from the deploy config. their mint and burn limits are zero on chain, which the SDK treats as deactivated and therefore omits when it reads the token, so declaring them could only ever read as drift
