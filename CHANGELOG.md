# @hyperlane-xyz/registry

## 11.3.0

### Minor Changes

- 3f20f57: Added token metadata for first batch of soon depl
- b7183d4: Adding SPICE metadata.
- 812f349: Change oUSDT tokens standard from XERC20 to VSXERC20 and remove ink connection

## 11.2.0

### Minor Changes

- 263494c: updated the CDX route to add the sophon extension
- ea5247e: Update default ISMs with new validators for infinityvm, plume, fuse.
- bf65725: Extending cbBTC with Base.
- 9bd7090: Add coingeckoIDs for a set of warp route configs
- 37a6493: Updated the ubtc route to include the soneium extension
- 6346eb9: Add Superseed ext to base, arbitrum, optimism, solana, ink for USDC

### Patch Changes

- 1eb8c79: Set forma IGP to 0x0.

## 11.1.0

### Minor Changes

- 6aa6d64: Remove totalSupply from warp route deployments

## 11.0.0

### Major Changes

- 987918c: Update to latest major hyperlane SDK v9.0.0. Includes support for "starknet" ProtocolType.

### Minor Changes

- 243040f: Add authToken parameter to getRegistry function
- 4abd4ec: feat: authenticated github registry
- ae39e7b: Add oUSDT coingeckoId

## 10.15.0

### Minor Changes

- 0ccd510: Deploy to infinityvm, plume.
- 044a7dd: Add Turtle warp routes config

### Patch Changes

- e9427b2: Update GPS to latest deployment to fix totalSupply

## 10.14.0

### Minor Changes

- 14e800b: Add warp deployments artifacts for enzoBTC/bsc-hyperevm and stBTC/bsc-hyperevm

### Patch Changes

- 176ece4: Remove Lorenzo routes default ISM config

## 10.13.0

### Minor Changes

- 0e6f08e: Add GPS configs

### Patch Changes

- 554b99d: oUSDT warp route artifacts

## 10.12.0

### Minor Changes

- 961012e: Update GithubRegistry to be able to parse branch from URI.
- 5234258: Refactor the getRegistry function to use an object parameter

## 10.11.1

### Patch Changes

- 679bff6: Add missing ETH/base-ethereum-lumiaprism deploy config

## 10.11.0

### Minor Changes

- 5cca0bb: Deploy to new testnets: carrchaintestnet, somniatestnet, infinityvmmonza.
- c478f87: Add ETH/base-ethereum-lumiaprism warp route deployment
- 10d02e5: Add file path string validation
- beb15a6: adds taraxa mainnet support

## 10.10.0

### Minor Changes

- c093d06: Add `branch` to getRegistry to allow reading of specific commit/branches. Also up the SDK version

## 10.9.0

### Minor Changes

- 6031ff9: Add getRegistry function

### Patch Changes

- dedd673: Update REZ logo

## 10.8.1

### Patch Changes

- 967fb84: Reverts PR #643 due to not exporting to index-fs.ts

## 10.8.0

### Minor Changes

- b71797b: Add REZ configs
- cfba620: Add getRegistry function

## 10.7.0

### Minor Changes

- 1bb7961: Add oUSDT warp routes config

## 10.6.0

### Minor Changes

- 0ceadb5: Add oUSDT logo

## 10.5.0

### Minor Changes

- 8f7b03a: Fix sSOL/solanamainnet-sonicsvm collateralAddressOrDenom

## 10.4.0

### Minor Changes

- d984e81: Added mint token warp route artifacts
- 4f8a60d: Add sonicSOL and lrtsSOL config, update sonicSOL logo
- fdf4cef: add mint token route metadata
- 7d6ce89: Add sonicSOL and lrtsSOL metadata

## 10.3.0

### Minor Changes

- 6b878f6: Add safe tx service urls for lisk, worldchain, superseed, soneium and unichain
- fd5d055: Add pumpBTC/ethereum-unichain warp route deployment
- a28c0fb: add logoURI to pumpBTCuni/ethereum-unichain deployment

## 10.2.0

### Minor Changes

- 9b1aae1: Update default ISMs for Feb 17 batch enrollment. Update safe tx API URLs for fraxtal and hyperevm. Update default RPCs for subtensor.

### Patch Changes

- 2c1cae3: Deployed CCIP Hook/ISMs

## 10.1.0

### Minor Changes

- d474b7f: Add SOL/hyperevm-solanamainnet

## 10.0.0

### Major Changes

- a1758ee: Remove wanchaintestnet. Add hyperevm.

### Minor Changes

- 61ebec2: Deploy to bouncebit, arcadia, ronin, sophon, story, subtensor.
- be10c5b: Add Ethereum<>HyperEVM warp routes for ETH, WBTC, USDT

### Patch Changes

- 3bac225: Add gnosis safe URL for sophon.

## 9.7.0

### Minor Changes

- f7d238e: Deploy CDX/base-solanamainnet
- 57be335: Add FORM warp route ethereum<>form
- cc87e1e: Add CDX logo and metadata

## 9.6.0

### Minor Changes

- 7682689: Add drpc fallback rpc to ethereum metadata.

### Patch Changes

- fd41924: Revert husky.

## 9.5.0

### Minor Changes

- 04e3605: Add precommit to check for secrets using gitleaks
- 983c3e5: Add Sapphire Testnet

### Patch Changes

- 03d0217: Update EZETSTAGE unichain owner to safe

## 9.4.0

### Minor Changes

- 30ca799: Add EZETH and EZETHSTAGE with unichain and bercachain
- 7718583: Deploy to monadtestnet, weavevmtestnet.

### Patch Changes

- 3f304ec: Update explorers for unichain and worldchain.

## 9.3.0

### Minor Changes

- 0496f9d: added ES token metadata
- 657c7fa: Deploy to subtensortestnet.
- 64eae96: Add EZETHSTAGE config and artifact

### Patch Changes

- 208e223: Update ART coinGeckoId

## 9.2.0

### Minor Changes

- 3141571: Enroll berachain on default ISMs.

## 9.1.0

### Minor Changes

- c4e5717: Enroll new chain validators on default ISMs. Update gnosis safe transaction service urls on treasure, zksync, abstract, and zklink.
- 7dd7ac2: Add EZETHSTAGE config to be used for EZETH staging
- 7889556: Deploy to berachain.

## 9.0.0

### Major Changes

- d9fe44a: Modifies LUMIA warp route, moving to new lumiaprism router instead of old lumia one

## 8.0.0

### Major Changes

- 8b0e4de: Remove separate warp route address yaml files and consolidate addresses into config files
- 5234cde: Remove more addresses-yaml files

### Minor Changes

- 0659f91: Update OP mainnet logo
- 5e76a6b: Add SMOL config and metadata
- 46eadc4: Add SMOL deploy config
- 427974d: Add sSOL, USDStar, USDC, USDT, and SONIC bridged between Solana and Sonic. Rename USD\* -> USDStar.
- 7e3e72f: Deploy to chronicleyellowstone. Add subtensortestnet metadata.
- 63363b7: Add solanamainnet to SMOL warp route config
- 6d23642: Add logo for SMOL

## 7.4.0

### Minor Changes

- 9649368: Add metadata.json and logos for sSOL, USD\*, and SONIC
- c5ca52b: Addng chronicleyellowstone chain metadata

### Patch Changes

- f8903b4: Update configs according to https://github.com/hyperlane-xyz/hyperlane-monorepo/pull/5316, which moves ownerOverride to its own proxyAdmin. Reverts removal of ownerOverride for some routes.

## 7.3.0

### Minor Changes

- 83cd45d: Add gnosisSafeTransactionServiceUrl for zksync-stack mainnets.

### Patch Changes

- b7b0034: Removes ownerOverrides for CBBTC, ETH (viction), PumpBTC (Sei)

## 7.2.2

### Patch Changes

- 2459730: Update TRUMP, CBBTC, LUMIA, USDC (zeronetwork), USDC (zeronetwork) warp configs with the latest changes from Infra Checker

## 7.2.1

### Patch Changes

- 4b5d60f: Update toYamlString to not use aliasDuplicateObjects due to alias errors.

## 7.2.0

### Minor Changes

- 528011e: Deploy Sonic SVM
- a589dad: Add warp deploy configs reader functions `getWarpDeployConfigs()` and `getWarpDeployConfig()` within Partial, Github, Filesystem, Merged Registries. Refactor duplicate logic with existing warpRoute functions
- 944f99c: Deploy to abstract, glue, matchain, unitzero.
- 8d3f1e4: adds LOGX EVM - SVM route

## 7.1.0

### Minor Changes

- d3a6517: Add `addWarpRouteConfig()` to allow writing of warp deploy configs into the existing `deployments/warp_configs` dir
- d3a6517: Add existing warp deploy configs generated by infra Getters

## 7.0.0

### Major Changes

- 2b3f78f: Replace old TONY with the new TONY deploy

## 6.20.0

### Minor Changes

- 4cb64c5: Update Stride fees

## 6.19.1

### Patch Changes

- 80023dd: Add OP extension and Trumpchain warp route

## 6.19.0

### Minor Changes

- 0797d4d: Deploy to flametestnet, sonicblaze.
- 3334558: Deploy to trumpchain.

### Patch Changes

- fb0fcd6: feat: Add more chains to TRUMP

## 6.18.0

### Minor Changes

- b3d0a00: Add param of `AddWarpRouteOptions` to `addWarpRoute` methods

### Patch Changes

- a5145e0: Add TRUMP-base-solanamainnet

## 6.17.0

### Minor Changes

- 28b8d3e: Add ART/artela-base-solanamainnet artifacts

## 6.16.0

### Minor Changes

- e95e1d6: Add TONY metadata and logo
- 1a9cc25: Add TONY artifacts

## 6.15.0

### Minor Changes

- 4da27b6: Add Artela/Base USDC and WETH warp route artifacts
- 9d7868f: Add sonicsvmtestnet, add solanatestnet addresses

### Patch Changes

- 195c073: add missing coingecko id to form usdt and usdc routes
- be18353: Add SuperSeed FiatToken warp route

## 6.14.0

### Minor Changes

- 58e4ea1: Deploy to new chains: artela, guru, hemi, nero, xpla.
- 52f72b3: added the ethereum form usdt warp route
- 9872274: Add Artela metadata and logo

### Patch Changes

- eabe2dc: Enroll new chains: artela, guru, hemi, nero, torus, xpla.
- 53cf28e: Update soneium block explorer.

## 6.13.0

### Minor Changes

- 9491843: Add rstETH/ethereum-zircuit Warp Route
- 08a37ba: Add SOL and Bonk warp routes to Soon, update Solana ISM
- 690e049: add new form warp routes for GAME WBTC aixBT and wstETH

### Patch Changes

- c04a948: Add PNDR/bsc-ethereum-lumiaprism logoURI field"

## 6.12.0

### Minor Changes

- 243f404: add the USDT warp route from ethereum to superseed
- 9a11b8b: Add SOON chain, add Bonk logo and metadata, make warp deploys without a config a warning
- c8234fd: Deploy to torus.
- 68bd1b1: add OP warp route to connect optimism and superseed

### Patch Changes

- 62ccc4d: Add ethereum-ink USDC artifacts
- 25dc7ff: update injective rpc URL
- 33bc5bb: Add JC to Base and Zero
- b5b1276: Add Miggles to Zero Network
- 7c652c3: Add Brett artifacts

## 6.11.0

### Minor Changes

- a7e6702: feat: add solo testnet
- 36b4c5f: Add workflow to validate and optimize SVGs, update SVGs with optimized version
- f9699c4: Deploy PNDR warp route

### Patch Changes

- 23186f9: Warp Routes: add logoURI for tokens that did not have it and rename chain names that were not sorted alphabetically
  Chains: Add missing deployer field
- fac1e34: Improve CI workflow by separating concerns
- 69f3abb: Upgrade yarn to 4.5.1

## 6.10.0

### Minor Changes

- d93024c: add jitoSOL and kySOL warp route configs

### Patch Changes

- 63930a4: Update ink mainnet RPC and more scroll RPCs.

## 6.9.1

### Patch Changes

- 35f11e1: updated usdc appchain base route addresses

## 6.9.0

### Minor Changes

- 7c44de7: Added echos chain and INTERN warp route

### Patch Changes

- a320c1c: Enroll Dec 13 batch of chains on default ISMs.

## 6.8.0

### Minor Changes

- d3e1e71: Deploy to new chains: arthera, aurora, conflux, conwai, corn, evmos, form, ink, rivalz, soneium, sonic, telos.
- 65d30cb: added usdc route appchain->base and ubtc route boba->bsquared->swell

## 6.7.0

### Minor Changes

- bde63f7: Adding MAGIC/arbitrum-treasure warp deployment artefacts
- 0c4f8e0: Add Vana <> Ethereum ETH warp route
- 01f2271: Add VANA warp route between Ethereum and Vana
- b3c93e2: Add RE7LRT deployment

### Patch Changes

- 995e745: add jitoSOL and kySOL metadta and logo
- 9d6a3bb: Enroll appchain, treasure, zklink on default ISMs.
- 3aeee15: Deployed pumpBTC route ethereum<>sei

## 6.6.0

### Minor Changes

- 75e91df: Add Swell to PZETH warp route
- 75e91df: Add Swell to EZETH warp route

## 6.5.1

### Patch Changes

- a852cb9: Full rebuild of metadata.yaml.

## 6.5.0

### Minor Changes

- 61de602: Add Swell to PZETH warp route
- 61de602: Add usdc and usdt swell

## 6.4.0

### Minor Changes

- 826a73e: Adding Argochain Testnet to the Official Hyperlane Github Registry
- 3c7d40a: feat: add mitosis testnet
- 63c6477: add opengradient testnet
- c25ff9a: add Linea Sepolia Testnet and gnosis chiado testnet
- ea15712: Added LINEA mainnet route for DAI, accessible from Arbitrum, BSC, Polygon
- c07c6cf: add prom network routes for PROM, USDT and USDC
- 4c085f6: Add inclusive layer testnet

### Patch Changes

- 538e714: Use correct apxETH logo

## 6.3.0

### Minor Changes

- c7891cd: Deploy to appchain, treasure, zklink. Add `gnosisSafeTransactionServiceUrl` for `swell`.
- 98b8950: feat: add reactive kopli chain
- 7b1601f: Add OORT Warp routes
- 1591e4a: Deploy new core chains: swell, lumiaprism.
- b044eca: feat: add DeepBrainChain testnet

### Patch Changes

- 7fb8d51: Update default ISMs for Nov 21 chain deploy batch.
- e2cc33e: removed the usdc route to zeronetwork that did not include lisk mainnet

## 6.2.0

### Minor Changes

- 773fedb: feat: add aurora testnet
- aa0abe3: add cbBTC,USDC,USDT adn ETH warp routes on zero
- 069afd6: Add USDC Endurance <> Arbitrum <> Base deployment
- d50740e: update the zeronetwork eth warp route to add lisk network and replace usdc route with new one
- 9870896: Add coinGeckoId to a bunch of new warp routes, set Endurance USDC token to EvmHypCollateral
- fa13e99: Deploy to B² Network ("bsquared").
- 3cd1c7d: Deploy new core chains: boba, duckchain, superseed, unichain, vana.
- 385b839: Add apxETH and ezSOL deploys to Eclipse
- b76c898: Added cbBTC between Ethereum and Flowmainnet
- ae7df1b: Add apxETH and ezSOL logos & metadata
- a5e34c8: feat: add Moonriver, Metal L2 Testnet
- f897db2: Add wbtc, bsc, pol, usdb for zeronetwork
- 8201350: Add coinGeckoIds for more warp routes
- 0dbee4c: removed usdt on bsc for usdt route for zeronetwork

## 6.1.0

### Minor Changes

- 14cd80b: Update default ISMs on core Abacus Works chains for Nov 8 batch. Update gnosisSafeTransactionServiceUrl for blast, linea and zeronetwork.
- a797d72: Redeploy to alephzeroevmmainnet, chilizmainnet, flowmainnet, immutablezkevmmainnet, metal, polynomialfi, rarichain, rootstockmainnet, superpositionmainnet. Deploy to flame, prom.
- 10fdae0: Add coinGeckoId to collateralized warp routes deployed by Abacus Works, update to SDK 7.0.0
- f124f9a: Add sepolia to alfajores warp route
- d71eb5f: Deploy to abstracttestnet, treasuretopaz.
- 0a0707c: Add cosmoshub chain definition
  Update mintscan api urls

### Patch Changes

- 3e366ea: Add coinGeckoId for ORCA collateral
- e70f527: Specify coinGeckoId for Solana warp route under collateral

## 6.0.0

### Major Changes

- b4a2bb2: Metadata migration for sept26 abacus works chains. Enforce domainId is within uint32 range.

### Minor Changes

- 4e52093: Deploy to alephzeroevmtestnet and inksepolia, redeploy to arcadiatestnet.

## 5.1.0

### Minor Changes

- 8dfc4c0: Update default ISMs on core Abacus Works chains

### Patch Changes

- 6ce62e9: Add weETHs logo and metadata
- 0921b6d: Add missing domainId for moonbase testnet
- 094e425: Fix misnamed warp routes
- 8ca7431: Add weETHs deploy config and addresses

## 5.0.1

### Patch Changes

- b8850ac: Eclipse warp route fixes
- 01506ea: Fix unit test flake timeout

## 5.0.0

### Major Changes

- cc457fb: Remove previous chain deploy addresses

### Minor Changes

- 716c10f: fix: worldchain RPC fix since its invalid
- e966856: add support for zksync testnet and sophon testnet
- 06f0026: Add token metadatas for ORCA, WBTC, USDT
- f4809d9: Add chain metadata for apechain, gravity, harmony, kaia, morph, snaxchain, zeronetwork, zksync. Update deployer details for chains not being deployed to.
- d6aaeae: feat: add Story Odyssey testnet
- 3af6f03: Add eclipse batch #2 warp artifacts
- 302be48: Deploy to apechain,arbitrumnova,b3,fantom,gravity,harmony,kaia,morph,orderly,snaxchain,zeronetwork,zksync. Add deployer info to morph metadata.

### Patch Changes

- 13ef3e3: Update teth synthetic logo

## 4.11.1

### Patch Changes

- c7d9a40: Add TIA token for IGP support in UI

## 4.11.0

### Minor Changes

- 5b4334a: Update hyperlane SDK version + leverage `finalized` block param for selected chains: astar, bsc, chiliz, moonbeam, polygon, shibarium, and tangle.
- 664ed0a: add Superseed sepolia testnet
- 686065a: add Manta Pacific Sepolia Testnet
- 76e4aab: replace arbitrum-cheesechain usdc route
- 6d61a4a: Add token metadata for TIA and stTIA
- 7645008: - added smartbch chain
- 5e020e7: Add amphrETH warp route
- 38e5c37: feat: add opBNB Testnet
- c94bfc1: feat: add humanity protocol
- c3d00a5: feat: add Canto Testnet, Fraxtal Testnet, Lisk Sepolia Testnet
- bf522c3: add Blast Sepolia Testnet
- d006d5c: feat: add Boba BNB
- 59bb360: add Harmony testnet
- 3888f6d: Update name and information of Euphoria Testnet
- 69e214b: feat: add Boba Eth Mainnet
- 07eaad9: feat: add Boba BNB Testnet

### Patch Changes

- 65b3c54: Revert chiliz reorg period back to 9
- b21b785: chore(deps): bump secp256k1 from 4.0.3 to 4.0.4
- dee5818: Add cosmos chain addresses
- 1866626: Adds the Abacus Works owned IGP for Stride
- c3e81c3: Added TIA and stTIA deployed on Eclipse and Stride
- c2cdaaf: Redeploy amphrETH route

## 4.10.0

### Minor Changes

- e7c13b4: Export createWarpRouteConfigId function
- cc9f11f: Add blockworkstestnet metadata

### Patch Changes

- c04d52f: Fix inevm fallbackRoutingHook address
- 3a534a6: Update default ISMs with newly enrolled chains & validators

## 4.9.0

### Minor Changes

- 2ff303e: feat: add Zora Testnet
  feat: add Canto Mainnet
- 8acf720: add lumia warp route
- 46fd86a: feat: add Story Testnet

## 4.8.1

### Patch Changes

- 4c8a8ea: Update ezEth name for Sei to redEth

## 4.8.0

### Minor Changes

- 7d27647: Add Sei Token information to Renzo Warp Route config
- 8583d08: Update technicalStack and reorgPeriod for core Abacus Works mainnet chains
- 4f390e0: feat: add Mode Testnet
- 44d1e91: add Meter testnet
- 9d22284: feat: add Koi chain Testnet
  feat: add Mantle Sepolia
- cb1b0f3: Add base and op warp routes for USDC, DOG, and TOBY
- 3b9f67a: Deploy to odysseytestnet
- 3cd5d81: Add deployments for mainnets: flow, metall2, polynomial
- e3330d5: Add deployments for testnets: arcadiatestnet, sonictestnet, unichaintestnet

### Patch Changes

- 6a3e1c1: Add deployer names for sonic/arcadia/unichain testnets
- 35ae586: Update Fetascan explorer TLD

## 4.7.0

### Minor Changes

- 16d8ecd: add Wanchain testnet
- 37ffc66: Add deUSD warp route
- 8e9a20a: add opBNB Mainnet
- bbc830c: feat: add Fantom Opera
- a40f086: add Taiko Hekla testnet
- 644321a: Add Renzo deploy artifacts

### Patch Changes

- ac69560: Update connextsepolia metadata
- 8afda06: Update chiliz RPCs
- c2b72b2: Add maxPriorityFeePerGas override for chiliz
- 315e8cf: Updating the hyperliquid testnet explorer URL and ISM addresses after enabling `hyperliquidevmetestnet`.

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
