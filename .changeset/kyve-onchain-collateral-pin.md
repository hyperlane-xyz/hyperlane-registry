---
'@hyperlane-xyz/registry': patch
---

Pinned the `kyve` leg of the KYVE/base-kyve warp route to its on-chain collateral configuration (`type: collateral`, `token: ukyve`) to clear the check-warp-deploy ConfigMismatch. The record previously declared `type: native`, but the deployed router is a collateral token backed by the `ukyve` denom.
