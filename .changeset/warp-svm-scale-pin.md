---
'@hyperlane-xyz/registry': patch
---

Pinned the SVM synthetic `scale` field to on-chain values (10^9) to clear check-warp-deploy scale drift for the APXETH, CDX, ETN, GNET, SMOL, TONY, and weETHs warp routes. Each route's Solana/Eclipse leg has 9 decimals against an 18-decimal EVM counterpart, so the previously missing scale was being treated as identity.
