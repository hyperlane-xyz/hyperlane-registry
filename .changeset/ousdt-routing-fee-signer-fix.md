---
'@hyperlane-xyz/registry': patch
---

The oUSDT production and staging warp route deploy configs are regenerated so each fee chain (ethereum, celo, tron, bsc, arbitrum, tea) uses a RoutingFee wrapping per-destination OffchainQuotedLinearFee contracts at 5 bps instead of a single bare OffchainQuotedLinearFee. The production quote signer set is corrected to drop the moonpay signer key, leaving the sole production signer.
