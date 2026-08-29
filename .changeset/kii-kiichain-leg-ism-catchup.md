---
'@hyperlane-xyz/registry': patch
---

Recorded the on-chain interchainSecurityModule for the KII/kiichain warp route's kiichain leg. The kiichain leg was left out of #1666 while the chain was halted, but the router has the same staticAggregationIsm (threshold = all) wrapping a rateLimitedIsm (1M KII/day), a pausableIsm, and a defaultFallbackRoutingIsm as the EVM legs. The rate-limit and fallback modules are owned by the kiichain token owner; the pausable module is owned by the dedicated Turnkey pauser key. This aligns the registry with on-chain state now that kiichain is live.
