---
'@hyperlane-xyz/registry': patch
---

the 0g explorer is marked as the routescan family. the API is not a routescan deployment but exposes a compatible interface, and it is load-bearing: evmrpc.0g.ai is not an archive node, so eth_getCode at a historical block fails with "missing trie node" and the SDK cannot binary-search a contract's deployment block. without the explorer every log-derived read on this chain throws rather than answering, which makes warp routes with a 0g leg uncheckable
