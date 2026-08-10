---
'@hyperlane-xyz/registry': patch
---

Pointed the USDT/eni warp route RoutingFee owners to the Turnkey warp-fees key (`0xe95C605096A1AD38BaC3E5210e145952Cbdc6998`) on the arbitrum, base, bsc, eni, ethereum, optimism, and polygon legs, reflecting the on-chain owner rotation. The tron leg's RoutingFee owner is intentionally left with governance (EVM ICA tooling cannot drive tron), and the inner per-destination fee-contract owners are unchanged.
