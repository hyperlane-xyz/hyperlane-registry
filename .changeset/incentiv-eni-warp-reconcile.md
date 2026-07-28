---
'@hyperlane-xyz/registry': patch
---

Pinned the Incentiv CENT, SOL, USDT, WBTC, WETH, and USDC warp route deploy configs to their on-chain state. Added the on-chain hook and interchainSecurityModule addresses that were unset in the registry, the second allowedRebalancer and base proxyAdmin owner on the USDC route, so `warp check` reconciles against chain. The ENI PB and evENI routes were verified against chain and required no changes.

Why these changed: the Incentiv team now owns these routes and configured hooks/ISMs on-chain that the registry had left unset; on-chain is source of truth, so no security parameters are being changed here — the live config is just being recorded. All pinned collateral/synthetic hooks are AGGREGATION hooks (hookType 2). All multisig ISMs are 2-of-3 merkle-root multisig (moduleType 4); the Incentiv-side CENT and USDC ISMs are per-origin domain-routing ISMs (moduleType 1) that delegate to 2-of-3 merkle-root multisig sub-modules. Full quorum/validator breakdown is in the PR description.
