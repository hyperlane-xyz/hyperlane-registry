# @hyperlane-xyz/registry

## 4.6.0

### Minor Changes

- 14268ea: Add pzETH between ethereum and zircuit

### Patch Changes

- aac55d5: Remove gasLimit override for rootstock and roostocktestnet

## 4.5.0

### Minor Changes

- 74163f5: Register information of Euphoria Testnet and add testing token
- 69b496b: Add metadata for u2u nebulas testnet
- 8c8cc0d: Add deployments for chains: immutablezkevm, rari, rootstock, alephzeroevm, chiliz, lumia, and superposition
- e7e1f2d: Adding KalyChain mainnet

### Patch Changes

- 181c3bd: Update alfajores logo
- 2d48627: Update xai logo
- a82d5d5: Add Moonbase Testnet

## 4.4.1

### Patch Changes

- 2f4ca2f: Set deployer names for known AW testnets

## 4.4.0

### Minor Changes

- bab634d: Deploy to berabartio hyperliquidevmtestnet citreatestnet camptestnet formtestnet soneiumtestnet suavetoliman

### Patch Changes

- 3df435f: Update plumetestnet logo
- d7dc44d: Add gasCurrencyCoinGeckoId for AW testnets
- d139fd1: Change `displayName` for Aleph Zero EVM
- 234d74c: Update solana explorer to solscan
- a87a555: Update default ISMs on testnet

## 4.3.6

### Patch Changes

- 0d56f2a: Update ethereum / eclipse tETH warp config and addresses

## 4.3.5

### Patch Changes

- be597b0: Update Solana/Eclipse/Ethereum USDC warp route addresses

## 4.3.4

### Patch Changes

- d93560a: Update eclipse logo
- 8a7811d: Update cheesechain type to EvmHypOwnerCollateral
- d057c3b: update sol/eclipse warp route addresses

## 4.3.3

### Patch Changes

- d1ff6d4: Add missing logoURI values to warp configs

## 4.3.2

### Patch Changes

- 0e4d875: Fix logo url in tETH warp config

## 4.3.1

### Patch Changes

- 75cdf82: Fixes missing collateral address from TETH warp route

## 4.3.0

### Minor Changes

- 77a04c0: Add tETH synthetic token metadata
- c700c09: Add WIF warp route artifacts
- b9b8b61: Add Turbo Eth warp route artifacts
- 9b9b07c: Add WIF token metadata

### Patch Changes

- 2e82f99: Fix everclear explorer URLs

## 4.2.0

### Minor Changes

- cee6f8c: Update pulsechain metadata

### Patch Changes

- b4bc397: Transfer ownership on everclear and oortmainnet to ICAs
- 6a324fb: Adds missing collateral addresses to eclipse warp routes
- 6a324fb: Add mailbox addresses to the chain metadata of SVM chains to get the warp UI working

## 4.1.1

### Patch Changes

- ebb3a77: Add eclipse mainnet block explorer

## 4.1.0

### Minor Changes

- b24c14d: Add tangletestnet deployment addresses
- 7ccdd62: Add piccadilly testnet chain
- 8e93ecb: Deploy to oort mainnet
- 9b1bb59: Adds Solanamainnet and Eclipsemainnet core deployment addresses
- 7512eac: Deploy to everclear
- dfd6f66: Enroll new chains and validators to default ISMs
- 912fce6: Add Eclipse warp route artifacts (USDC and SOL)

### Patch Changes

- 4de3ccf: Update Celo chain logo

## 4.0.0

### Major Changes

- d92f8be: Remove chiado and proteustestnet, as they are not currently AW-supported.

### Minor Changes

- 9ab1370: Add proxyUrl and function to generate it
- 66124ea: Add NeoX T4 testnet chain
- d9a46f9: Add Henez testnet config
- 33a13d3: Add Eclipse USDC token metadata

### Patch Changes

- 1d43e33: Update scroll reorg period
- 7fb63da: Change Polygon native token from MATIC to POL
- af9b94b: Update Moonbeam logo
- c4b28b2: Deploy ICAs to all AW mainnets
- 8753a2a: Add index.from for heneztestnet, fixing schema validation

## 3.0.0

### Major Changes

- 93dc4c0: Remove CoreChains enum and metadata maps
- a7ffbaa: Add `mainnet` suffix to solana and eclipse

### Minor Changes

- 88367b3: Add Molten network
- 084db3d: Added stake weighted multisigism factory addresses
- 8b5b0a4: Deploy core contracts to astar astarzkevm bitlayer coredao dogechain flare molten shibarium
- 5502be8: Add new renzo warp deployment config and addresses that include zircuit
- a000b2a: Enroll worldchain, xlayer, cheesechain, zircuit validators to default ISMs
- d1dcf32: Enroll new validators for cyber degenchain kroma lisk lukso merlin metis mint proofofplay real sanko tangle xai taiko
- 17926af: add rootstock mainnet
- 488c6eb: Add new renzo warp config and addresses
- 3f260fa: Rename fhenix to fhenixtestnet, and update some native token names.
- a4076ee: Add metadata for alephzero, arbitrumova, astar, astarzkevm, b3, bitlayer, carbon, clique, confluxespace, coredao, cronos, cronoszkevm, dogechain, ebi, filecoin, flare, fractalconfluence, funki, ham, kava, ngmi, orderly, polynomial, pulsechain, rari, ronin, saakuru, shibarium, tenet
- 262b5d3: Add Berachain bArtio config
- 96c6ed7: Added Stride to Ethereum stTIA warp route
- 06faae6: Update zircuit safe tx url
- dd206c3: Add cheesechain USDC Collateral Vault warp route
- 43866ce: Add Rootstock testnet chain
- b552ee4: Update zircuit explorer metadata
- e356395: Add forma mainnet addresses.
- b661127: Add Eclipse SOL token metadata
- f50d153: Add stride testnet
- 78b26eb: Fix TIA-mantapacific-neutron warp config by removing reference to the TIA arbitrum neutron HypCollateral router

### Patch Changes

- 492b545: Changed Polygon confirmations 200 -> 3
- 59c02da: Reduce Ethereum confirmations wait
- c5402da: Update core testnets to match AW infra
- e005548: Update pulsechain metadata
- 4176768: Replace Molten logo with real SVG
- 7a12c35: Replace broken arbitrum sepolia RPC
- f642dfe: Added an archive node RPC for Neutron

## 2.5.0

### Minor Changes

- a3d5c02: Add missing coingecko ID for Abacus Works chains
- 29f4901: Support xERC20 in getWarpAddressKey, add renzo warp deployment addresses
- bc4b989: Deploy to arbitrumsepolia, basesepolia, ecotestnet, optimismsepolia, polygonamoy
- 531d7c3: Deploy to zircuit
- baba8f1: Add metadata for celodango, cyber, degenchain, immutablezkevm, kinto, kroma, lisk, merlin, metis, mint, opsepolia, plumetestnet, polygonamoy, proofofplay, real, sanko, xai, zircuit
- cf3b629: Deploy to cyber degenchain kroma lisk lukso merlin metis mint proofofplay real sanko tangle xai
- d764fd5: Add Eclipse
- 883d75f: Add testRecipient for merlin

### Patch Changes

- d9fea91: Added the Safe transaction service URL for sepolia
- 7e652ef: New ICA deployments for core EVM chains
- 65ef674: Add backup RPCs for some EVM chains
- d9fea91: Replace a testnet Zetachain URL from the mainnet metadata
- 7233d73: Add Galadriel devnet

## 2.4.0

### Minor Changes

- 9add749: Add Connext Sepolia chain
- 10394fd: Add Endurance chain
- 574d998: Add cheesechain
  Add worldchain
  Add xlayer
- 6e8f406: Add DODOchain Testnet chain
- 07ebc9c: Deploy to connextsepolia + superpositiontestnet
- 0a59848: add Mint Sepolia Testnet
- 884f3ea: Add Superposition Testnet
- 7c6bfef: Deploy to endurance, fusemainnet, zoramainnet
- d1bb3b7: Add Fhenix Testnet chain

### Patch Changes

- 6670f82: Updated Fraxtal Safe transaction service URL
- 0f09484: Fix Redstone Safe transaction service URL
- 6ae344e: Add "updated" Renzo warp route including Fraxtal

## 2.3.0

### Minor Changes

- 860a47f: Add combined chain address and metadata files
- b49e5f8: Add LUKSO and LUKSO testnet chains
- e38ce13: Added core deployment for `arthera` mainnet and LESS warp route between `arthera`-`celo`
- 979cede: Update to @hyperlane/sdk 4.1.0 and add deployer details for each chain

### Patch Changes

- 8f71149: Sort entries in YAML as required by CI

## 2.2.1

### Patch Changes

- fd10d86: Increase `confirmations` on mantle from 1 to 3

## 2.2.0

### Minor Changes

- b6e2136: Add core deployment for Fuse chain
- 145f085: Adding config for Zora chain to registry
- a9403b0: Added core deployment for arthera testnet
- fef0561: Add Base Sepolia chain
- 0f636ee: Add metadata for BOB, Mantle and Taiko

### Patch Changes

- 414fc5b: Mark Aribtrum Sepolia as testnet

## 2.1.1

### Patch Changes

- d712147: Add `gnosisSafeTransactionServiceUrl` for `blast` and `mode` networks
- e03890d: Added core deployment for arbitrum sepolia
- 499ffe7: Fix bug with GithubRegistry file fetching

## 2.1.0

### Minor Changes

- a484456: Add Osmosis metadata

### Patch Changes

- 750c136: Add blast to CoreChain enum
- 594b14e: Fixes for some neutron warp route configs
- e89a6d3: Add metadata and addresses for fraxtal, linea and sei.
  Update addresses after adding support for osmosis remote.

## 2.0.1

### Patch Changes

- 0984dc1: Rename Polygon native token to Matic
- ab47121: Add missing neutron token definitions to warp route configs
- e2c9d3c: Remove broken TIA Stride warp route

## 2.0.0

### Major Changes

- 05815a7: Add support for reading warp route configs from registries
  Add getURI method to registry classes

### Minor Changes

- 296ef58: Add token logos

### Patch Changes

- 725c795: Added Stride chain
- 23138d8: Add more arbitrum rpcUrls
- 23138d8: Added mantapacific gnosisSafeTransactionServiceUrl
- 984dc5d: Add black border to Blast logo.svg

## 1.3.0

### Minor Changes

- 1b7c0f5: Add PartialRegistry class
  Add merge() method to IRegistry
- 4db8e36: Rename LocalRegistry to FileSystemRegistry
- ab3dbb0: Add MergedRegistry class

### Patch Changes

- 2e990b1: Added Zetachain & Redstone addresses & metadata; minor changes to addresses and metadata following a deploy

## 1.2.0

### Minor Changes

- 3d8a8d0: Added holesky chain metadata and core artifacts

## 1.1.2

### Patch Changes

- 46b136f: Add getChainLogoUri method and improve caching

## 1.1.1

### Patch Changes

- 0d3d6ea: Add Holesky AVS deployment addresses

## 1.1.0

### Minor Changes

- fb7bc0c: Update to SDK 3.1.1

## 1.0.7

### Patch Changes

- 0001d30: Improve GithubRegistry parallelization
- 8cbdff9: Warp Route add support
- 166fca4: Added Blast and Mode addresses & metadata

## 1.0.6

### Patch Changes

- 049a67f: Fix chain file regex and add tests

## 1.0.5

### Patch Changes

- 57c5310: Fix regex for identifying chains and mark proteustestnet as a testnet

## 1.0.4

### Patch Changes

- dc688ea: Create LocalRegistry class
- 551ce32: Add ancient8 metadata and USDC warp route
- d9989d5: Implement methods to adding/removing chains to a LocalRegistry

## 1.0.3

### Patch Changes

- 034a9c0: Create Registry utility classes

## 1.0.2

### Patch Changes

- e96c12a: Improve types for chain metadata exports

## 1.0.1

### Patch Changes

- 928bc0b: Initial release
