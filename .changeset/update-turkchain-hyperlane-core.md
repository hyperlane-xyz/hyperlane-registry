---
"@hyperlane-xyz/registry": patch
---

Update Turkchain Mainnet (Chain ID 1919, Domain ID 1919) Hyperlane Core deployment addresses to the newly deployed contracts.

Register the new Interchain Gas Paymaster (IGP) at `0xe6FD7030A10CDA22eD8Ea7802e5f30e9e0Eb9894`.

This update replaces the previous Turkchain Mailbox address and is a breaking change for integrations referencing the earlier deployment. Existing messages and contract state are not automatically migrated.

Validator, relayer, gas oracle configuration, and end-to-end cross-chain messaging are still being prepared and have not yet been verified.
