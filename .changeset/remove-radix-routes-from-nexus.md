---
'@hyperlane-xyz/registry': patch
---

The Radix warp routes are removed from the Nexus allowlist (USDC/radix, USDT/ethereum-radix, ETH/ethereum-radix, WBTC/ethereum-radix, SOL/radix, BNB/radix, XRD/radix) so they no longer appear in the Nexus UI following the Aug 31 Radix security incident. Delivery remains blocked at the agent/ISM level; this prevents users from initiating new, undeliverable transfers.
