---
'@hyperlane-xyz/registry': patch
---

Added a staticAggregationIsm (threshold = all) wrapping a rateLimitedIsm (1M KII/day), a pausableIsm, and a defaultFallbackRoutingIsm to the KII/kiichain warp route on the kiichain leg.
