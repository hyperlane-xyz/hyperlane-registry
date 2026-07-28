---
'@hyperlane-xyz/registry': patch
---

Raised `maxFeeBps` on the USDC/mainnet-cctp-v2-fast route for arbitrum (1.3→1.4), linea (11→13), and unichain (1.5→2) to match Circle's current live CCTP V2 fast-transfer fee minimums. These three chains' configured caps had fallen below Circle's live fee for their most expensive destination lane (all currently `-> ethereum`), causing `depositForBurn` fast-transfer attestations to fail with `insufficient_fee` and fall back to slow standard-finality attestation instead of fast.
