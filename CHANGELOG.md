# @hyperlane-xyz/registry

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
