---
'@hyperlane-xyz/registry': patch
---

Pinned WBTC/eclipsemainnet-ethereum ethereum `ownerOverrides.proxyAdmin` to the on-chain ProxyAdmin owner (0x562Dfaac27A84be6C96273F5c9594DA1681C0DA7, a legacy Abacus Works Gnosis Safe) to clear the check-warp-deploy ConfigMismatch. The override previously pointed at the current standard AW Safe (0x3965AC…C5b6) while both the on-chain ProxyAdmin and the record's own `proxyAdmin.owner` field already used the legacy Safe.
