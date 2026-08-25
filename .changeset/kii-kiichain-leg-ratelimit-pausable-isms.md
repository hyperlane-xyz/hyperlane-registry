---
'@hyperlane-xyz/registry': patch
---

Added a staticAggregationIsm (threshold = all) wrapping a rateLimitedIsm (1M KII/day), a pausableIsm, and a defaultFallbackRoutingIsm to the KII/kiichain warp route's kiichain leg. The rate-limit and fallback modules are owned by the kiichain leg's existing token owner; the pausable module is owned by the dedicated Turnkey pauser key. This matches the setup already declared for the EVM legs in the separate AW-752 PR.
