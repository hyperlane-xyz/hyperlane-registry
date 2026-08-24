---
'@hyperlane-xyz/registry': patch
---

the 0g drpc endpoint is added ahead of evmrpc.0g.ai in the zerogravity rpcUrls. evmrpc.0g.ai serves no archive state, so eth_getCode at a historical block fails with "missing trie node" and the SDK cannot resolve a contract's deployment block, which makes every log-derived read on this chain throw. the drpc endpoint serves it. the explorer stays marked `other`: chainscan answers eth_getLogs with `status: 1` and an empty result rather than an error, so marking it compatible would make the SDK take that empty answer as authoritative and skip the RPC
