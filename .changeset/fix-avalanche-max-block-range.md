---
'@hyperlane-xyz/registry': patch
---

the avalanche pagination.maxBlockRange is corrected from 100000 to 2048, which is the range the api.avax.network endpoint actually enforces on eth_getLogs
