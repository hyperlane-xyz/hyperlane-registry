---
'@hyperlane-xyz/registry': patch
---

the bsc leg of the oUSDT staging and production warp routes is converted from a synthetic xERC20 to a collateral route backed by BSC-USD (0x55d398326f99059fF775485246999027B3197955), replacing the previous synthetic routers with the newly deployed collateral ones on staging (0x54599E9872AfC75C6bF70825B636F021641fa3a3) and production (0xc283600F0A84162C0a062f7273ABB1F8F111b40C) and relinking every other leg to them. every leg of both routes also carries an explicit scale now: 1/1 on the six-decimal legs and 1/1000000000000 on bsc so its eighteen-decimal collateral matches the six-decimal message encoding. the staging deploy config is pinned to contractVersion 12.1.0
