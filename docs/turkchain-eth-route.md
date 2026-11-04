# Turkchain ETH observed deployment

This is a draft Registry record, not an enabled bridge. Neither Router is enrolled. The config intentionally has empty `connections`, the deploy snapshot has empty `remoteRouters` and `destinationGas`, and the route is not added to `warpRouteAllowlist.yaml`.

## Provenance

- Ethereum MinimalHypNative: `0xD13d97C537620ed5762343B78534c7581ED3a2fC`.
- Deployment: https://etherscan.io/tx/0x3ae4385dbae691f3ec1208a06bc024c4e1778843032ef61838271e77222b0c55 (successful creation, zero value).
- Ethereum route-specific MessageIdMultisig ISM: `0xF0c446012cB1Eb2F1E6b44aB923377eA24554413`, validator `0xbff48C3Deca205D53384C02409b44d6536e9207a`, threshold 1. This does not replace Ethereum's global default ISM.
- Ethereum Router owner: `0xb3A776BfC1Ba98ec9255E091aAFe3aEB76d48c6b`; direct implementation, no ProxyAdmin.
- Turkchain ERC20/Router proxy: `0xBf9569B06bCb6ccF776302b0697c79B8407d8e3f`. Live `token()` returns this proxy address. It implements the synthetic token and Hyperlane Router interfaces; it is not an unrelated ERC20 attached to an invented Router.
- Turkchain proxy implementation: `0xc7743C0D23A46AdE301E3f0086c08dE55653D36d`; ProxyAdmin `0xDb32dC96F68c5F48aBA4d0decfa489f6EEde1C9b` owned by `0x8b00ecb1e8BF59F5Ab4Ba0F0c528c4F4d850280E`. No ownership transfer is implied.
- Turkchain Core address update is tracked separately in https://github.com/hyperlane-xyz/hyperlane-registry/pull/1781.

## Custom native compatibility

SDK 45.0.1 `EvmWarpRouteReader` recognizes the deployed contracts as `native` and `synthetic`. `EvmHypNativeAdapter` and `EvmHypSyntheticAdapter` read their domains and populate the expected `transferRemote(uint32,bytes32,uint256)` transactions. The native adapter includes the ETH amount in transaction value. These are unsigned calls, not transfers.

`MinimalHypNative` derives from pinned Hyperlane core sources (`f556e18c9da88ce3d51a24164f22a7f27eb539fd`) and additionally enforces a minimum `44000000000000` wei, recipient/domain restrictions, a route reentrancy guard, and disabled rebalancing enrollment. `EvmHypNative` describes its native collateral/transfer interface, not byte-identical standard implementation or SDK deployment reproducibility. Do not use generic CLI deployment or apply operations to replace this custom, non-upgradeable implementation.

The generic SDK does not infer this custom minimum from Registry metadata. Clients must validate the minimum before quoting/submitting; contract enforcement remains authoritative. No unsupported YAML field is added merely to represent the minimum.

The deploy YAML is a live read snapshot, including current hook/ISM settings. It is not a desired enrolled-state template. The Ethereum hook is the existing canonical MerkleTreeHook. The Turkchain hook is the existing aggregation of MerkleTreeHook and IGP; no opposite-domain oracle or gas overhead is invented.

## Pending integration gates

1. Review exact source verification; runtime and creation executable code match locally after excluding compiler metadata, but full metadata reproduction is pending the original Remix compilation artifact.
2. Complete Ethereum-origin checkpoint discovery/announcement and proof tests.
3. Configure separate Relayer signers/funding and an explicit two-way fee/delivery policy. Merkle-only dispatch does not prepay destination gas.
4. Obtain separate owner approval for reciprocal enrollment and any hook/gas changes. Keep the recorded peers empty until transactions are confirmed and re-read.
5. Complete independent application security review and controlled end-to-end testing before allowlisting or advertising live transfers.

A single validator with threshold 1 is a pilot trust assumption, not a multi-party quorum. Registry presence, schema validity, and SDK interface compatibility are not a readiness endorsement. No contract, token, ownership, enrollment, funding or Relayer change is executed by these files.

## Reproduce

- `pnpm run test:unit`: repository tests against the upstream-based ETH branch. Fork-only routes are not included in this PR.
- `pnpm exec mocha --require dotenv/config --config .mocharc.json test/unit/turkchain-eth.test.ts --exit`: focused data/SDK regression tests.
- `pnpm exec tsx scripts/check-turkchain-eth.ts`: public read-only chain/reader audit; artifacts in ignored `.audit/`.
- `pnpm exec tsx scripts/check-turkchain-eth-sdk.ts`: read/populate adapter test; never signs or submits.

The existing TURK route uses its verified legacy Mailboxes. It must not be silently rebound to the new ETH route or canonical Core deployment. No USDT data is changed.
