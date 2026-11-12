# Nexus integration review request — ETH/ethereum-turkchain

This updates the existing #1786 request; no duplicate integration issue is needed. The data now records reciprocal enrollment, current synthetic implementation and MerkleTreeHook, and two historical successful deliveries. See [route evidence](turkchain-eth-route.md).

## Current discovery mechanism

The current official UI states in CUSTOMIZE.md that token discovery, route availability, quotes and executable transactions come from the Universal Router API; local UI Registry overrides alone do not list an executable route. The Registry `deployments/warp_routes/warpRouteAllowlist.yaml` supplies bridge-only route IDs to the engine. Route IDs are not user-wallet allowlists.

Official sources:

- https://github.com/hyperlane-xyz/hyperlane-warp-ui-template/blob/5744e7eeee8e3cd1320ca2fd3f7461c1f26999a4/CUSTOMIZE.md
- https://github.com/hyperlane-xyz/hyperlane-registry/blob/d36ac66ef726bdce6691d4ce4be8ab3dab39cb29/deployments/warp_routes/warpRouteAllowlist.yaml
- https://github.com/hyperlane-xyz/hyperlane-registry/blob/main/src/types.ts

## Submitted integration proposal

Add `ETH/ethereum-turkchain` with an error notice and `blocksTransfer: true`. This requests chain/token/route discovery and custom-route integration review while preventing transfer activation. Do not remove the block merely because Registry schemas or historical deliveries pass.

Please confirm:

1. Core metadata #1781 and this native/synthetic route are accepted; TURK symbol, chainId/domain1919,18decimals, explorer/RPC and existing SVG are correct.
2. Engine adapters/quoting enforce0.000044ETH minimum, direct release, isolated genesis/redemption-credit accounting, reserves and source user gas. Display-only ETH metadata must not mask a custom execution incompatibility.
3. Message ISM/checkpoint verification and operational gas-budget/evidence gates pass before removing the transfer block.
4. Explorer source verification/custom-code review, monitoring and incident ownership meet listing requirements.
5. Whether an additional engine repository PR is necessary; no evidence yet establishes that a separate UI code PR or form is required beyond Registry/engine review.

## Status boundaries

Registry PRs submitted: yes. Maintainer acceptance/merge: pending. Conditional engine discovery request: included here. Public transfer readiness: blocked. Nexus listing/live visibility: not verified. No new live transfer, synthetic mint, test message or funding transaction was created. Two prior deliveries are documented, never repeated.
