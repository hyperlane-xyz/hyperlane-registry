---
'@hyperlane-xyz/registry': patch
---

added rpc.layeredge.foundation as the primary rpc for the edgenchain (Edgen Chain) chain and kept rpc.layeredge.io as a fallback, because rpc.layeredge.io was returning 502 Bad Gateway and agents had no healthy endpoint
