# Public Ethereum–Turkchain ETH route integration — work in progress

The requested outcome is a public bidirectional ETH route, not discovery-only listing. There is no wallet allowlist, invitation requirement or pilot-user restriction. This updates existing #1786; no duplicate issue is needed. The data now records reciprocal enrollment, current synthetic implementation and MerkleTreeHook, and two historical successful deliveries. See [route evidence](turkchain-eth-route.md).

## Current discovery mechanism

The current official UI states in CUSTOMIZE.md that token discovery, route availability, quotes and executable transactions come from the Universal Router API; local UI Registry overrides alone do not list an executable route. The Registry `deployments/warp_routes/warpRouteAllowlist.yaml` supplies bridge-only route IDs to the engine. Route IDs are not user-wallet allowlists.

Official sources:

- https://github.com/hyperlane-xyz/hyperlane-warp-ui-template/blob/5744e7eeee8e3cd1320ca2fd3f7461c1f26999a4/CUSTOMIZE.md
- https://github.com/hyperlane-xyz/hyperlane-registry/blob/d36ac66ef726bdce6691d4ce4be8ab3dab39cb29/deployments/warp_routes/warpRouteAllowlist.yaml
- https://github.com/hyperlane-xyz/hyperlane-registry/blob/main/src/types.ts

## Submitted integration proposal

Add `ETH/ethereum-turkchain` with an error notice and `blocksTransfer: true`. This is a temporary execution safety block while completing the public-route feature, not its final product scope. Remove it only after the broadcast-layer spend guard, signed evidence, finalized checkpoint selection and custom-accounting/engine compatibility checks pass. Historical transfers and fork/SDK tests are used; no new mainnet transfer will be generated. Do not remove the block merely because Registry schemas or historical deliveries pass.

Please confirm:

1. Core metadata #1781 and this native/synthetic route are accepted; TURK symbol, chainId/domain1919,18decimals, explorer/RPC and existing SVG are correct.
2. Engine adapters/quoting enforce0.000044ETH minimum, direct release, isolated genesis/redemption-credit accounting, reserves and source user gas. Display-only ETH metadata must not mask a custom execution incompatibility.
3. Message ISM/checkpoint verification and operational gas-budget/evidence gates pass before removing the transfer block.
4. Explorer source verification/custom-code review, monitoring and incident ownership meet listing requirements.
5. Whether an additional engine repository PR is necessary; no evidence yet establishes that a separate UI code PR or form is required beyond Registry/engine review.

## Status boundaries

Registry PRs submitted: yes. Maintainer acceptance/merge: pending. Conditional engine discovery request: included here. Public transfer readiness: blocked. Nexus listing/live visibility: not verified. No new live transfer, synthetic mint, test message or funding transaction was created. Two prior deliveries are documented, never repeated.

## Dependency and CLI validation

#1791 is merged and main was synchronized into this branch. The Ethereum global default ISM is0xb05bbc4793D8Db2b87115Bb7E6304F0216a8c6eB, distinct from this route-specific0xF0c446012cB1Eb2F1E6b44aB923377eA24554413. The protected Ethereum address-file fixture hash is updated to current upstream. #1781 supplies the canonical Turkchain Core deployment; it remains a separate open PR.

Hyperlane CLI45.0.1 was actually executed against current artifacts: warp read PASS; warp check FAIL because it reports unverified native/synthetic implementation and synthetic ProxyAdmin surfaces. No check failure is hidden. SDK unsigned population and nine focused ETH tests pass. Full current-main integration runs reproduce a10-second timeout in an unchanged upstream relayer-denylist regex test; no timeout was increased and no test was skipped to claim success. Maintainer-controlled fork CI approval remains pending.
