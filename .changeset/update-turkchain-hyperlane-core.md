---
"@hyperlane-xyz/registry": patch
---

Update Turkchain Mainnet (Chain ID 1919, Domain ID 1919) Hyperlane Core deployment addresses to the newly deployed contracts.

Register the new Interchain Gas Paymaster (IGP) at `0xe6FD7030A10CDA22eD8Ea7802e5f30e9e0Eb9894`.

This update replaces the previous Turkchain Mailbox address and is a breaking change for integrations referencing the earlier deployment. Existing messages and contract state are not automatically migrated.

Validator, relayer, gas oracle configuration, and end-to-end cross-chain messaging are still being prepared and have not yet been verified.

Deployment provenance:
- Turkchain Mainnet Mailbox creation transaction: https://turkscan.com/tx/0xa18fd0730c137a4bd3362dfb7d650ef35d456f68f7932a0ba46145afb421f950
- Deployed Mailbox: 0x5a1a042619AAE32c5282dB94769f78DF93AEeE6d
