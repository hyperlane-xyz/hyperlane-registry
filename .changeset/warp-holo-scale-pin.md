---
'@hyperlane-xyz/registry': patch
---

Pinned the HOLO/bsc-solanamainnet SVM synthetic `scale` field to its on-chain value (10^9) to clear check-warp-deploy scale drift. The Solana leg has 9 decimals against the 18-decimal BSC counterpart, so the previously missing scale was being treated as identity.
