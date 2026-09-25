---
'@hyperlane-xyz/registry': patch
---

added paused fallbackRoutingHook on all EVM legs of the USDC/aleo route that routes the aleo destination to a pausableHook (paused: true), so transfers to aleo fail immediately.
