---
'@hyperlane-xyz/registry': patch
---

- Fixed igra's gasCurrencyCoinGeckoId, which pointed at the unrelated IGRA governance token instead of the native iKAS gas token. Repointed to wrapped-ikas-zealous-swap so the IGP gas oracle prices iKAS correctly.
