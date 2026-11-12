# Ethereum–Turkchain ETH: deployed and reciprocally enrolled

Read-only revalidation: Ethereum block 26395519 (`0xa1a9d3a3abbbd6e02fa58548a73f19d1b9c8bcafdd0792bdf7aff5ccb92edc5e`), Turkchain block 3103698 (`0x0de565200c8d8817b0fb94098d6f184f434f9900d5507443ec00ff5a703dd68a`). Deployment data and historical delivery evidence are verified; **public execution readiness is not certified**. No new transfer, message, deployment, enrollment, mint, funding, ownership or upgrade transaction was submitted during this update.

## Addresses and standards

| Chain/domain   | Token/router                                 | Standard                                      | Mailbox                                      |
| -------------- | -------------------------------------------- | --------------------------------------------- | -------------------------------------------- |
| ethereum/1     | `0xD13d97C537620ed5762343B78534c7581ED3a2fC` | EvmHypNative / native ETH collateral          | `0xc005dc82818d67AF737725bD4bf75435d065D239` |
| turkchain/1919 | `0xBf9569B06bCb6ccF776302b0697c79B8407d8e3f` | EvmHypSynthetic / combined token-router proxy | `0x5a1a042619AAE32c5282dB94769f78DF93AEeE6d` |

The Turkchain implementation is `0xb747f4645a9bb5d580dd199f8cfa054a3f1b9655`. It is **not** the token/router address. The old implementation `0xc7743c0d23a46ade301e3f0086c08de55653d36d` must not be published as current. Both route legs use 18 decimals and Registry symbol ETH. The native custom contract returns empty name/symbol; Registry labels it Ether/ETH explicitly. The synthetic contract returns Ethereum/ETH. The native router's zero EIP-1967 slot is not an invented proxy relationship.

Both owners read `0xb3A776BfC1Ba98ec9255E091aAFe3aEB76d48c6b`. Both remote router mappings and `domains()` confirm reciprocal enrollment. Both destinationGas values read 0; this is observed deployment state, not a proof of bounded operational sponsorship.

Ethereum hook `0x48e6c30B97748d1e2e03bf3e9FbE3890ca5f8CCA`; Turkchain current hook `0x9e4B06541476b56f6DFC83A20057b11A7940c114` (MerkleTreeHook). The previous aggregation hook is historical. Ethereum route-specific ISM `0xF0c446012cB1Eb2F1E6b44aB923377eA24554413` and Turkchain ISM `0xDE841d6e6Eb20Ce112248e1F1Ead665e491a7231` both read messageIdMultisig type5, threshold1, validator `0xbff48C3Deca205D53384C02409b44d6536e9207a`. Ethereum global Core addresses are unchanged. Two validators observe different origin chains but share one signing identity: this is a single-key trust assumption, not independent multi-party security.

ProxyAdmin, owner and Core deployment addresses remain as separately declared. Canonical Turkchain Core update is #1781; old applications are not automatically migrated.

## Deployment provenance and verification limits

- Ethereum native router creation: https://etherscan.io/tx/0x3ae4385dbae691f3ec1208a06bc024c4e1778843032ef61838271e77222b0c55
- Turkchain synthetic proxy creation: https://turkscan.com/tx/0x1d9dba155e971db814e60f59e827b4d9fa98784dd6f3e29678d912ac18b62b8a
- Turkchain Mailbox creation: https://turkscan.com/tx/0xa18fd0730c137a4bd3362dfb7d650ef35d456f68f7932a0ba46145afb421f950
- Native runtime hash `0x7a07dace1ee9c685e90ad28063ac9430e65da01695dd7531ebb7a7d87130bba2`; synthetic proxy runtime hash `0x42d46c58709ef519d0cb2b1849d6b1584599ce1732728300887780d4ec498643`. Current implementation hash `0x6c7bb3c5a018828821d63b0cfd5a3b8dcd2a31b108d9727715409ec81d3808a5`.
- Locally rebuilt current source matches executable code after immutable/metadata normalization and preserves the original storage prefix. Full metadata byte-for-byte verification and independent custom-code review must not be inferred from that alone. Explorer proxy verification is not blanket verification of all implementations/Core contracts.

## Historical successful deliveries

| Direction          | Message ID                                                           | Source transaction                                                   | Destination transaction                                              |
| ------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Ethereum→Turkchain | `0x34d9c9d2824de7f1ced7b90720a9d1df9f4d923e94296a7277b0af9141eebcee` | `0x33fd69c30f43606e596681ca6a492a4e88281d791f4f0d75b544c392ea23ef22` | `0x363ffd72a933807eb373f1ad7fb5a575ee083835444f1b3cef798a26d09029a7` |
| Turkchain→Ethereum | `0xed594db7af439aa2d31965b5e116bf11933a14ac227d8d2246b7a645e6dc7990` | `0x11428c1c347177e591d011930a25a38bedc75b7ff8761a5ea7800f437e03a34f` | `0xba6ab9245a1a2d55fb0783c66e9c9330b842836010a228c9c4ac6937958109f3` |

Both destination receipts succeeded and current destination Mailboxes report delivered=true. Source Dispatch / destination ProcessId and mint/burn/native release were audited. Return trace paid exactly44,000,000,000,000wei ETH. Delivery signer identities were verified; attribution to one physical relayer instance is not proven solely by sender equality. These messages must never be replayed.

## Custom accounting and fees

Minimum transfer44,000,000,000,000wei (0.000044ETH). The synthetic route isolates legacy supply: current legacySupply500ETH,totalSupply500ETH,totalRedemptionCredit0,isolationActive=true. Native router balance0 matches zero current redemption credit; this does not collateralize the legacy500ETH. That genesis supply must not be treated as newly backed bridge deposits. Universal Router quoting and executable-transaction validation must honor recipient redemption-credit/isolated accounting, reserve/inflight liability and the custom minimum. A standard adapter interface alone does not prove those constraints are integrated safely.

Users pay source gas (ETH or TURK); project-funded destination relayers pay TURK or ETH. A recipient receiving mint need not hold TURK. Returning users need source TURK. This is direct release, with no mandatory claim/recovery adapter and no source-user gas sponsorship. Existing IGP/service fees require separate accurate quotes; this policy does not promise all service fees are zero.

## Outstanding activation blockers

Real relayer broadcast-layer per-message fee cap and daily spend enforcement; nonce/inflight reconciliation; signed fresh operational evidence; finalized checkpoint policy; independent custom contract/accounting/quote compatibility and deployment verification. Current `gasPaymentEnforcement=none` plus a gas-unit limit is not a daily monetary budget. Historical successful deliveries do not prove public readiness.

The Registry route request therefore includes a `blocksTransfer: true` error notice for engine review. It is not a wallet allowlist or pilot restriction: execution is blocked globally until safety requirements are met. Maintainer review, merge, engine deployment and actual Nexus discovery remain separate acceptance steps.

## Reproduce

`pnpm run test:unit`; focused `pnpm exec mocha --require dotenv/config --config .mocharc.json test/unit/turkchain-eth.test.ts --exit`; read-only SDK audit `pnpm exec tsx scripts/check-turkchain-eth-sdk.ts` (read/populate only; no submission). Fixture block numbers are snapshots, not assertions about forever-current state.

Legacy USDT/TURK routes and historical deployment evidence are not repurposed by this ETH PR.

## Upstream dependencies and compatibility

Backward compatibility: **Yes** for existing Registry entries and existing ETH token/router identifiers. This adds/updates the ETH route record and keeps transfer execution blocked; it does not change existing deployed contracts. The separate Core-address replacement in #1781 is explicitly a breaking change for consumers of the old Turkchain Mailbox.

#1791 is merged. Its Ethereum global default ISM is0xb05bbc4793D8Db2b87115Bb7E6304F0216a8c6eB; the route-specific0xF0c446012cB1Eb2F1E6b44aB923377eA24554413 remains separate. Branches were synchronized with current main, and the protected Ethereum-address fixture hash was updated to match upstream. #1781 remains the canonical Turkchain Core-address dependency. No legacy application is silently migrated.

## Testing — actual execution, not inferred validation

Hyperlane CLI executed: **Yes**, version45.0.1, current warp read PASS. Current warp check executed: **Yes**, exit1 for contractVerificationStatus implementation on both legs and proxyAdmin on Turkchain. SDK read/populate and9 focused route tests PASS. New real ETH transfer performed: **No**. Full suite after upstream synchronization:8384passing,1pending,1failing (unchanged upstream relayer-denylist regex test exceeds its explicit10s timeout; reproduced on unmodified main). These results supersede earlier pre-sync passing counts.

Nexus public transfer activation: **No**; the block is temporary while completing the public-route security implementation, not a discovery-only final scope.

### Preservation baseline

The protected hashes cover files that actually exist in upstream main `d36ac66ef726bdce6691d4ce4be8ab3dab39cb29`: the Turkchain SVG and global Ethereum addresses. Missing protected files fail the test through an unconditional read. The two historical `TURK/ethereum-turkchain-*` paths are absent from that baseline and are explicitly recorded as absent, not claimed as preserved active deployments. Both new ETH route Mailboxes have unconditional assertions independent of historical files.
