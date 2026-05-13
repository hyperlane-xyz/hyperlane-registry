---
'@hyperlane-xyz/registry': patch
---

Avoid importing the SDK root from registry runtime modules so bundled services do not pull unused SDK protocol artifacts.
