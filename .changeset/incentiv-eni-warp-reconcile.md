---
'@hyperlane-xyz/registry': patch
---

Pinned the Incentiv CENT, SOL, USDT, WBTC, WETH, and USDC warp route deploy configs to their on-chain state. Added the on-chain hook and interchainSecurityModule addresses that were unset in the registry, the second allowedRebalancer and base proxyAdmin owner on the USDC route, so `warp check` reconciles against chain. The ENI PB and evENI routes were verified against chain and required no changes.
