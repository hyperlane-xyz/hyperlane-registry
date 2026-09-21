---
'@hyperlane-xyz/registry': patch
---

The tETH eclipsemainnet↔ethereum warp route was removed from the Nexus universal-router allowlist. Eclipse is sunsetting tETH (redeem-only, no new mints), and the tETH token's before-transfer hook was set to a codeless contract on Sep 11, which reverts every transfer and blocks all bridging. The route is delisted from Nexus until the token becomes transferable again.
