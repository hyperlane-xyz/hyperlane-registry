---
'@hyperlane-xyz/registry': patch
---

Backfilled the missing collateralAddressOrDenom on every non-native collateralized warp token (USDC/mainnet-cctp-v2-fast, USDC/mainnet-cctp-v2-standard, USDT/oft, USDT/oft-legacy, KYVE/base-kyve, MILK/bsc-milkyway) and added a registry test that enforces the invariant going forward, so dedup and route resolution can match tokens sharing the same underlying asset across routes.
