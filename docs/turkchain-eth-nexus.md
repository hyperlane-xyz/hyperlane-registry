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
5. UI compatibility PR [#1265](https://github.com/hyperlane-xyz/hyperlane-warp-ui-template/pull/1265) is submitted. Maintainers must confirm/deploy the compatible UI and direct route-engine population; no access to a separate private engine repository is claimed.

## Status boundaries

Registry PRs submitted: yes. Maintainer acceptance/merge: pending. The project portal now reports public, ready/enabled routes in both directions; that is separate from Nexus acceptance. Nexus executable transfers remain blocked until the compatible UI/engine path is reviewed and deployed. Nexus listing/live visibility: not verified. No new live transfer, synthetic mint, test message or funding transaction was created. Two prior deliveries are documented, never repeated.

## Dependency and CLI validation

#1791 is merged and main was synchronized into this branch. The Ethereum global default ISM is0xb05bbc4793D8Db2b87115Bb7E6304F0216a8c6eB, distinct from this route-specific0xF0c446012cB1Eb2F1E6b44aB923377eA24554413. The protected Ethereum address-file fixture hash is updated to current upstream. #1781 supplies the canonical Turkchain Core deployment; it remains a separate open PR.

Hyperlane CLI45.0.1 was actually executed against current artifacts: warp read PASS; warp check FAIL because it reports unverified native/synthetic implementation and synthetic ProxyAdmin surfaces. No check failure is hidden. SDK unsigned population passes. Latest focused ETH suite:11 passing; full Registry suite:8387 passing/1 existing pending, build/lint/TypeScript pass. An earlier unchanged-upstream regex timeout did not recur in this run; no timeout was changed or test skipped. Maintainer-controlled fork CI approval remains pending. UI hosted CI currently cannot dispatch because the organization Depot GitHub App lacks requested token permissions; maintainers were notified, and no workflow was bypassed.

## Operational implementation status — 2026-11-12

The existing one relayer / two validators remain in use. Reciprocal four-field router filters are active. The relayer's only RPC path is a persistent signed-raw broadcast gate: it binds signer, chain, Mailbox, domains, routers, source dispatch/finality and target simulation; durably reserves worst-case cost; reconciles finalized receipts/nonces; and enforces daily/per-message caps. It never treats `gasPaymentEnforcement=none` as a monetary limit by itself.

| Destination | Daily cap  | Message cap | Max fee/gas | Finality  |
| ----------- | ---------- | ----------- | ----------- | --------- |
| Ethereum    | 0.0005 ETH | 0.00025 ETH | 1 gwei      | 64 blocks |
| Turkchain   | 0.03 TURK  | 0.003 TURK  | 5 gwei      | 24 blocks |

A root-owned Ed25519 producer publishes short-lived signed observations at https://bridge.turkscan.com/api/bridge/relayer-evidence. Private observation keys remain outside portal containers and are separate from EVM/KMS keys. Evidence pins container/config identity and verifies signers, checkpoints, budgets, metrics and isolated reserve accounting. Both canonical historical transfers now report completed direct mint/native release, without replay. Actual reboot was not performed; enabled user services, linger, dependency/readiness guards and same-container supervision were checked.

The project portal is public; this Registry notice still intentionally blocks Nexus execution while maintainer compatibility/CI/engine acceptance is outstanding. The final goal is unrestricted public wallet access in both directions. Do not remove this notice solely because the project portal is open.

### Retry-window compatibility

The live relayer uses the pinned agent's supported default `maxMessageRetries=66`. The previous32-attempt threshold was insufficient for a message waiting across a daily budget reset, especially during restart rehydration. The normal66-attempt schedule spans roughly two weeks; monetary daily/per-message caps are unchanged. This was checked against immutable revision `f556e18c9da88ce3d51a24164f22a7f27eb539fd`, `rust/main/agents/relayer/src/msg/pending_message.rs` (default, retry persistence/skip and backoff branches). Mocked ledger tests cover refusal before, and admission after, UTC reset while retaining reservations and finalized-spend history. No live transfer or Rust test execution is claimed.
