---
'@hyperlane-xyz/registry': patch
---

Added a staticAggregationIsm (threshold = all) wrapping a rateLimitedIsm (10M KII/day), a pausableIsm, and a defaultFallbackRoutingIsm to the KII/kiichain warp route on the base, bsc, ethereum, mantle, and polygon legs. The rate-limit and fallback modules are owned by each leg's existing token owner; the pausable module is owned by the dedicated Turnkey pauser key. The kiichain leg is intentionally left unchanged for now while that chain is halted.
