---
'@hyperlane-xyz/registry': patch
---

Re-added the original nesa-chain NES deployment as the `NES/legacy` warp route id. The `NES/bsc` id was cut over to the new nesachain deployment in #1673, so the legacy nesa (domain 41443) route was preserved under a dedicated id to keep it referenceable for relayer blacklisting while it remains paused.
