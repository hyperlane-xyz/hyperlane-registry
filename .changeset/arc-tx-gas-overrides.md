---
'@hyperlane-xyz/registry': patch
---

Arc gained transactionOverrides setting maxFeePerGas to 60 gwei and maxPriorityFeePerGas to 2 gwei so transactions are included promptly. Previously txs used a ~0.1 gwei tip and lingered in the mempool for up to an hour or were dropped, causing key funder IGP-claim/top-up timeouts. Gas is paid in USDC so the higher ceiling costs a fraction of a cent per tx.
