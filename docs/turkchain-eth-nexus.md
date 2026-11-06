# Turkchain ETH Nexus integration request (draft)

Requested route ID: `ETH/ethereum-turkchain`. This document requests maintainer review of the future listing path; it does not request immediate transfer activation.

## Current official integration path

At Nexus branch commit `59065ce593de4e1957d683a5c1a0134961fb34dd`, the UI pins Registry 26.2.0 and SDK 45.1.0. `CUSTOMIZE.md` states that token discovery, route availability, quotes and executable transactions come from the Universal Router API. The registry's `deployments/warp_routes/warpRouteAllowlist.yaml` lists engine bridge-only route IDs. The historical UI-local `warpRouteWhitelist.ts` workflow must not be assumed current.

Sources:

- https://github.com/hyperlane-xyz/hyperlane-warp-ui-template/blob/59065ce593de4e1957d683a5c1a0134961fb34dd/CUSTOMIZE.md
- https://github.com/hyperlane-xyz/hyperlane-registry/blob/e8246a3c78eb0a1c054ce61076a84986c03c3419/deployments/warp_routes/warpRouteAllowlist.yaml

## Requested maintainer guidance

Please review the observed native/synthetic deployment in this draft PR and confirm the engine/listing review requirements once the application activation gates are complete. We have not added the route to the engine allowlist. Route allowlisting is distinct from a user-wallet allowlist.

Before requesting activation of an allowlist entry, supply:

1. Merged canonical chain/Core metadata and ETH route artifacts.
2. Confirmed reciprocal enrollment and a passing route check, with explorer verification and funded owners/operators.
3. Verified two-way fee/quote/delivery behavior and the route's custom minimum constraints.
4. Successful source/destination mainnet transaction and message-ID evidence for both directions.
5. Operational monitoring, route-specific security review, public RPC availability and incident contacts.

Current statuses: Registry PR submitted (draft); merge pending; Nexus review request prepared in this PR; engine allowlist not requested for immediate activation; approval pending; route visibility not verified; live bidirectional Nexus transfer not run.

The existing TURK route, logo and global Ethereum Core entries are unchanged.
