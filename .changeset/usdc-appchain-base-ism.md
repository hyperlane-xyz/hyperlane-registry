---
'@hyperlane-xyz/registry': patch
---

The USDC/appchain-base deploy config was updated to record the appchain-team-operated MESSAGE_ID_MULTISIG ISM (0x049B9DEa8276856812129c7b146E514Dd46B6634) on the base collateral leg, replacing the placeholder mailbox-default zero address, to match the on-chain configuration set during appchain's self-host handover. The handover is tracked in Linear ENG-3932 (H2 2026 Chain Removals — appchain, self-host); appchain now operates its own validator set (2-of-3) behind this ISM rather than the Abacus Works default, confirmed by the warp-config-checker owner.
