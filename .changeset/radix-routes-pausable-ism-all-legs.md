---
'@hyperlane-xyz/registry': patch
---

the EVM legs of all Radix warp routes (USDC/radix arbitrum+base, USDT/ethereum-radix ethereum, XRD/radix base+ethereum, WBTC/ethereum-radix ethereum, BNB/radix bsc, ETH/ethereum-radix ethereum) were set to a 2-of-2 aggregation ISM combining the default fallback ISM with a pausable ISM owned by the turnkey pauser, so every EVM leg can be paused in response to the radix incident wherever aggregation/pausing is supported
