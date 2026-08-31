---
'@hyperlane-xyz/registry': patch
---

the ethereum leg of the USDC/radix warp route was set to a 2-of-2 aggregation ISM combining the default fallback ISM with a pausable ISM owned by the turnkey pauser, enabling the route to be paused in response to the radix incident
