---
'@hyperlane-xyz/registry': patch
---

Update Turkchain Mainnet (Chain ID 1919, Domain ID 1919) Hyperlane Core deployment addresses to the newly deployed contracts.

Register the new Interchain Gas Paymaster (IGP) at `0xe6FD7030A10CDA22eD8Ea7802e5f30e9e0Eb9894`.

This update replaces the previous Turkchain Mailbox address and is a breaking change for integrations referencing the earlier deployment. Existing messages and contract state are not automatically migrated.

Current validators and relayer use this deployment; historical ETH message delivery is confirmed in both directions. This does not certify public readiness, gas oracle configuration, or migration of legacy applications.

Deployment provenance:

- Turkchain Mainnet Mailbox creation transaction: https://turkscan.com/tx/0xa18fd0730c137a4bd3362dfb7d650ef35d456f68f7932a0ba46145afb421f950
- Deployed Mailbox: 0x5a1a042619AAE32c5282dB94769f78DF93AEeE6d

Read-only provenance recheck: Mailbox localDomain=1919, deployed bytecode and linked contracts at Turkchain block 3103698 (`0x0de565200c8d8817b0fb94098d6f184f434f9900d5507443ec00ff5a703dd68a`). Ethereum→Turkchain delivery transaction: https://turkscan.com/tx/0x363ffd72a933807eb373f1ad7fb5a575ee083835444f1b3cef798a26d09029a7. The existing quotedCalls utility is retained; no deployment is performed by this Registry change.
