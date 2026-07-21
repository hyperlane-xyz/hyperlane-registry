---
'@hyperlane-xyz/registry': patch
---

Pinned the Bonk/JUP/TRUMP starknet routes' `starknet` leg `gas` to the on-chain value (5000000) to clear the check-warp-deploy destinationGas ConfigMismatch. The solanamainnet routers deliberately forward 5000000 gas to the Starknet destination, but the registry never declared an explicit `gas`, so the checker derived the EVM default `gasOverhead(synthetic)` = 64000 and flagged every solanamainnet→starknet leg.
