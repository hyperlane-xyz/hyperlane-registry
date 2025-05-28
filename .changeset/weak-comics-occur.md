---
'@hyperlane-xyz/registry': major
---

Update Warp Core Config warp route Id generation logic to accept a specified warpRouteId, use the a synthetic token, or fallback to original chain names algo. Related util functions such as createWarpRouteConfigId no longer contains warpRouteId generation logic and instead only accepts a symbol and label. The logic has been moved to warpRouteConfigToId static method.
