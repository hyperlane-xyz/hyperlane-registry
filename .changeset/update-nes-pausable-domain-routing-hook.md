---
'@hyperlane-xyz/registry': patch
---

the NES warp route deploy config now sets a fallback routing hook on every EVM leg that routes transfers destined for nesa and solanamainnet through a 2/2 aggregation hook (pausable + default), with the pausable hook initially paused to block those transfers
