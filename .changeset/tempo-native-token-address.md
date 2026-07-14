---
'@hyperlane-xyz/registry': patch
---

- Added the `nativeToken.address` field to tempo metadata, pointing at the pathUSD TIP-20 contract (0x20c0000000000000000000000000000000000000). This flags that tempo's gas token is an ERC20 contract rather than a protocol-level native token, so funding/balance tooling should use balanceOf / ERC20 transfers instead of eth_getBalance / native sends.
