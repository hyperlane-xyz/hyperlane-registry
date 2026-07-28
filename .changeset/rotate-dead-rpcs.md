---
'@hyperlane-xyz/registry': patch
---

Rotated dead public RPC entries for arbitrum, base, blast, bsc, polygon, and viction, and replaced the sole (and dead) public RPC for adichain and robinhood with a live alternative. All removed entries were confirmed dead (DNS no longer resolves, verified directly against 1.1.1.1 to rule out local resolver artifacts, or the endpoint now returns 401/403/5xx) and every remaining/added entry was live-tested immediately before merge, including a 100-block Mailbox-filtered `eth_getLogs` check matching `test/health/rpc-health.test.ts`. bsc's official `bnbchain.org`/`defibit.io`/`ninicoin.io` dataseed nodes and the pre-existing `blockrazor.xyz` entry all reject that query with a block-range limit despite responding to basic calls, so they were dropped in favor of `drpc.org`, `publicnode.com`, and `blxrbdn.com` (bloXroute), which all support it. oortmainnet's sole public RPC is also dead but no alternative could be found anywhere; left unchanged.
