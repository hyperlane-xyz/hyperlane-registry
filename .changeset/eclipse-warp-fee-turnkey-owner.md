---
'@hyperlane-xyz/registry': patch
---

Pointed the eclipse USDC and USDT warp route RoutingFee owners to the Turnkey warp-fees key (`0xe95C605096A1AD38BaC3E5210e145952Cbdc6998`) in the deployment manifests, reflecting the on-chain owner rotation. The tron USDT leg's RoutingFee owner is intentionally left with governance (EVM ICA tooling cannot drive tron).
