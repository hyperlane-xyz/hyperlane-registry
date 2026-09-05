---
'@hyperlane-xyz/registry': minor
---

Set evmTarget: paris on chains whose EVM lacks PUSH0 or MCOPY/transient-storage opcodes (coti, electroneum, viction, chilizmainnet, incentiv, metis, prom, pulsechain, taiko, torus). The Hyperlane SDK uses this field to route IGP deployments through the paris-compatible bundle (MinimalInterchainGasPaymaster) on these chains while preserving the cancun-deployed default elsewhere.
