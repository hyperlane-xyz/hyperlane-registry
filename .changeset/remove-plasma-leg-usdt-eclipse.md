---
'@hyperlane-xyz/registry': patch
---

Removed the plasma leg (domain 9745) from the USDT/eclipsemainnet warp route config and regenerated the deploy artifact, and added a threshold-3 static aggregation ISM (defaultFallbackRoutingIsm + pausableIsm + rateLimitedIsm) to the EVM legs.
