---
'@hyperlane-xyz/registry': patch
---

Added the `scale` field to the paired warp core configs for the CARR and USDC/eni routes to match their deploy configs and clear the scale-consistency check. CARR's solanamainnet leg (6 decimals against an 18-decimal EVM counterpart) and USDC/eni's arbitrum, base, eni, ethereum, optimism, and polygon legs (6 decimals against an 18-decimal canonical) each had a `scale` of 10^12 in the deploy config that was missing from the core config, so the previously absent scale was being treated as identity.
