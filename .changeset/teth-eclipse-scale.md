---
'@hyperlane-xyz/registry': patch
---

The tETH eclipsemainnet↔ethereum warp route was missing the `scale: 1000000000` field on its Eclipse SealevelHypSynthetic token (9 decimals bridging to an 18-decimal Ethereum collateral). Without it, consumers reading the message amount with the origin token's 9 decimals displayed transfers inflated by 1e9 (e.g. a 0.0115 tETH transfer shown as ~11.5M). The scale was added to match the sibling eclipsemainnet↔ethereum routes (weETHs, apxETH).
