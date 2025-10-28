# @hyperlane-xyz/registry

## 23.4.0

### Minor Changes

- 2600b94: Deprecate legacy sova network. Update default ISMs.
- 9cbeb15: Add CoinGecko ids for DOG, ES, KLC, OORT, RCADE, SEDA, SOLX, SUPR, TAIKO.
- 5547eb8: Update galactica/GNET coingecko IDs.
- d4984b3: Add ETN configs
- c0a9512: added matchain eurc deployment artifacts

### Patch Changes

- 00c3050: Add SOL/radix

## 23.3.0

### Minor Changes

- 4ca7139: Add Electroneum USDT
- c80c9fc: Add solaxy USDC warp route deployment artifacts
- 490a01d: Deploy to incentiv, monad, carrchain, litchain. Deprecate snaxchain.

### Patch Changes

- b12008a: Update Electroneum USDC owner to ICA

## 23.2.0

### Minor Changes

- 5dc3ab8: Officially deprecate legacy lumia mailbox.
- 5e91a58: Deploy to zerogravity, sova, mantra.
- ed3a0cf: Add TIA warp routes for Abstract, Arbitrum, Base, Eclipse, Solana & Ethereum.
- 70d6bd9: Update solanamainnet ISM.
- 580aa28: Enroll sova, zerogravity, mantra on default isms.
- a52f33b: extended USDC/matchain to Ethereum and Base with rebalancing support
- 0447d9b: Add radix warp routes
- aeec7c2: Extend the UBTC route to ethereum
- 927498c: Fix `HOLO` decimals.
- 98d6450: Deploy to giwasepolia. Deprecate infinityvmmonza testnet.
- 6a6543b: Deploy on plasma, electroneum.
- 902188d: Deployed USDC warp route on pulsechain
- a852bec: Remove neutron connection for TIA/arbitrum-celestia-neutron
- 09fa9df: Add blockExplorers for mitosis and update owners for MITO/mitosis route
- 6d5585b: update luksotestnet config addresses
- e153c1d: Update dependencies and include radixdashboard as an explorer
- 88fea43: Deprecate support for alephzeroevmtestnet, bepolia, flametestnet, formtestnet, inksepolia, sonicblaze, odysseytestnet, superpositiontestnet, unichaintestnet, chronicleyellowstone, weavevmtestnet, abstracttestnet, soneiumtestnet, connextsepolia, ecotestnet, plumetestnet2
- b2f06a3: Add gnet warp route artifacts
- 7e84145: Deprecate alephzeroevmmainnet, game7, infinityvmmainnet.
- afb1a21: Add electroneum USDC config
- 99ad40d: Add ETN token metadata and logo for Solana
- 1a1296e: Extend oUSDT to 0G.
- 0189f5d: Add Tatara and RISE Testnet

### Patch Changes

- f3a3190: Add Celestia to TIA/arbitrum-neutron.
- d459b4e: Add HOLO deploy artifacts.
- e1d5a18: Add TIA/celestia-eclipsemainnet
- 3e38532: Update the logorUrl and coinGeckoId to the correct config for electroneum USDC
- c92df04: Update Pulsechain blockExplorers apiUrl and url
- 0e086e3: Updates the oXAUT bridge limits for avax, celo, ethereum, worldchain and base config
- 3a36de5: Deprecate alfajores, as it's being replaced by celosepolia
- c573015: Update default ISMs after validator rotations.
- 490b292: Update oXAUT base owner to AW safe
- 94d13b5: update zircuit reorg to 10mins
- 90fd4b6: Update default ISMs to enroll plasma, electroneum.
- d3cc03f: Add mito coingecko id
- fc745b9: Add KING Ethereum <> Coti config.
- 2fbe811: Add HOLO metadata.
- 107b66e: update zircuit reorg period

## 23.1.0

### Minor Changes

- 64cbc0e: updated tgt route artifacts to have the correct ownership config
- ba21821: add money sonicsvm deployment
- d238ff7: Add stokenet metadata
- 46ed9a9: Deploy to celosepolia, incentivtestnet.
- ab01078: Add LYX/lukso-ethereum warp route
- 9fd55be: add INVT warp route
- a84d8ac: Redeploy on pulsechain.
- 0cb4553: Enroll radixtestnet to sepolia defaultIsm
- abf5e96: Add radix chain

### Patch Changes

- f32a750: Rename radixstokenet -> radixtestnet
- 0416859: updated decimals in some SOL warp routes to satisfy stricter warp checker rules
- f241bd3: add PROM CoinGecko-id
- 1fb6974: updated decimals in some warp routes to satisfy warp checker rules
- f7bd10d: Set zircuit reorg period to 45.
- 668839e: Add pumpBTC.stk

## 23.0.0

### Major Changes

- a56736e: Bump hyperlane-xyz/sdk hyperlane-xyz/utils versions

### Minor Changes

- 6fb1fef: Update default ISMs on some chains to enroll mitosis.
- a45326c: Deploy MITO/mitosis route.
- 8224f8e: Update metadata of deprecated chains.

### Patch Changes

- 525fd39: Added logo to USDT/matchain warp route
- a56736e: Add velo XERC20 type to oUSDT

## 22.0.0

### Major Changes

- f7cfec3: Deploy new ICA v2 routers: https://github.com/hyperlane-xyz/hyperlane-monorepo/pull/6475

### Minor Changes

- 732cd1c: Add USDT/matchain warp route deploy artifacts
- 5659860: Deploy to mitosis.
- 496eb70: Enable oUSDT on UI for bitlayer, mantle, ronin, sonic.

### Patch Changes

- e7b9fa0: Update default ISMs on ethereum, arbitrum, base, abstract.
- 1d32c2f: Add velo XERC20 type to oUSDT
- 76812e2: Update oXAUT config to include base chain
- 8d57bc5: Remove arbitrum connection for SMOL route, update owners for SMOL and MAGIC

## 21.1.0

### Minor Changes

- 45eca7d: Add MAGIC arbitrum/abstract/ronin route. Add SMOL arbitrum + abstract routes.

### Patch Changes

- cea2b10: Add solana `collateralAddressOrDenom` to SMOL route
- 9a36c26: Replace USD₮ for USDT in ethereum ouSDT/production route

## 21.0.0

### Major Changes

- 7c9f61c: Deprecate chains bouncebit, conflux, conwai, deepbrainchain, duckchain, evmos, flame, nero, rivalz, rootstockmainnet, sanko, telos, unitzero, xpla, zklink

### Minor Changes

- 10e8bce: Migrate oUSDT ownership to timelocks.
- e3eaf21: Add Celestia Mainnet configuration

### Patch Changes

- 85ac73b: Update TGT owners
- e94b324: Transfer USDC-paradex ownership.
- 3d353f7: Add foreignDeployment to Starknet routes.

## 20.1.0

### Minor Changes

- 30443a6: feat: torus warp route
- d585bf6: Add USDC matchain configs
- 0f20cff: add blockscout explorers to oUSDT realted chains

### Patch Changes

- d66da9b: Deploy PUMP/starknet
- 1ad0cf3: Update proxyAdmin config on ancient8 usdc route to sync it with current config

## 20.0.0

### Major Changes

- 9c577a4: Removed subtensor usdc outdated artifacts that were replaced by stable warp ids ones

### Minor Changes

- 71209b5: Add VRA/bsc-ethereum artifacts
- 1207721: Add get warp deploy to fetch from the Server. Also, update get warp core to fetch from the updated route.

### Patch Changes

- f1c0422: Add edgen coingecko-id
- 8116fd7: Update metal safe tx service url.
- a4e2dea: Fix typo for HttpClientRegistry route /warp-route/core

## 19.4.0

### Minor Changes

- 94b5167: Added the PUMP/eclipsemainnet warp route

### Patch Changes

- d9f0d03: Remove botanix tx overrides
- 23336e2: Update oXAUT ownerOverrides.collateralToken to the top-level owners
- f8af54f: Update default ISMs on arbitrum, base, ethereum, mode.
- 06c2b8a: Update celo metadata
- d925022: Update oXAUT owners to AW safes

## 19.3.0

### Minor Changes

- dfa6782: update paradex defaultISM
- dd21180: Remove treasure and trumpchain warp routes.
- 4c95328: Update katana public RPC. Update default ISMs.
- 8948b4a: Added PUMP metadata and logo
- 2f45f38: Update superseed with CCTP rebalancing and add connections

### Patch Changes

- 9359431: Extend oXAUT to Avalanche
- 532664a: Remove SDK code imports

## 19.2.0

### Minor Changes

- d8a2a57: update usdc paradex route to be rebalanceable
- d5a2f9c: Add HttpClientRegistry (IRegistry) implementation
- 968f0f4: extedended subtensor usdc route to unichain, arbitrum and polygon

### Patch Changes

- 55ea7b9: Add SEDA route
- c4e12fd: Fix paradex `chainId` in metadata

## 19.1.1

### Patch Changes

- 5cb131b: Update Celestia Testnet grpc endpoint
- 994cf31: Add TIA testnet.

## 19.1.0

### Minor Changes

- f582af6: update solx route to extend to solaxy

## 19.0.0

### Major Changes

- 6759d87: update eclipse route to extend to solana mainnet and renamed artifacts to use stable warp ids

### Minor Changes

- 1f0f1d3: Remove old lumiaprism route and add `logoURI` to USDC/lumia
- 292dc47: Deprecate guru.
- 53b1614: Added SOL warp route between solana and starknet
- 2633756: Update paradex & starknet default ISMs
- 684a943: Add RCADE/arbitrum-bsc deploy artifacts
- cc22a1e: Add JUP warp route between Solana and Starknet
- 95ed85c: Add USDC paradexsepolia route
- b48f662: Deploy to galactica, remove kroma.
- 5632574: Update block times for arbitrum and optimism
- 512322c: Deploy to xrplevm.
- 3219e7c: Add Bonk starknet.
- dc622e6: Added Paradex USDC route
- 67d47e8: Add metadata for chain celestiatestnet
- 57e6444: Add TRUMP starknet.

### Patch Changes

- ac25cf9: Add CCTP warp routes
- 162799f: Add collateralAddressOrDenom and logoURI to USDC mainnet cctp config
- 6d24338: Extend lumia USDC with CCTP rebalancing
- 30a1387: Remove zan RPC from starknet metadata because it causes issues when getting tx status
- df92d90: Fix botanix logo missing xmlns attribute
- bfdb552: Update and fix coingecko ids for LOGX, AIXBT, MINT, ELIZA, MEW and Pnut
- a8f9610: Update arb/op block times.

## 18.0.0

### Major Changes

- f185f9a: Deprecate arthera, trumpchain, real.

### Minor Changes

- 5d4c567: Extend oUSDT to ink, swell, botanix.
- f12bfab: Deprecate rometestnet1, rometestnet2.
- 209d3c1: Add Humanity configs
- ae339bc: Deploy to TAC.
- e74e238: Add availability metadata for deprecated chains.
- bcc4abb: Deployed warp route for DREAMS between Solana Mainnet and Starknet.
- 8717bb1: Add Solaxy chain
- c8473f3: Deployed warp route for Fartcoin between Solana Mainnet and Starknet.

### Patch Changes

- 65bced3: Add TOBY Coingecko Id
- 28bc40c: Update oXAUT core config name and symbol for ethereum

## 17.8.2

### Patch Changes

- 711b4f3: Update oXAUT deployment configs with new xERC20 deployment due to incorrect name and symbol

## 17.8.1

### Patch Changes

- 2441da0: Add oXAUT logo

## 17.8.0

### Minor Changes

- bb65614: Deprecate rometestnet. Redeploy on rometestnet2.
- 1c2c4bf: Add wpFLT/fluence route
- 959229b: feat: extend ubtc warp route
- 7e961cc: add solaxy warp route deployment
- c93222c: Added ETH warp route between starknetsepolia and sepolia
- c33afad: Add oXAUT configs

### Patch Changes

- fb9acb2: Use correct fluence network coingecko id.
- a6aa495: add coingeckoid to ubtc

## 17.7.0

### Minor Changes

- 04ed384: Add TOSHI

## 17.6.0

### Minor Changes

- 1c2cf5e: Add Matchain configs
- 1de5cb2: Update default ISMs on botanix, katana, arbitrum, avalanche, base, ethereum, linea, mode, optimism, polygon, sonic.
- dbd45f1: Add FLT/fluence route

### Patch Changes

- 6379fde: Paradex NativeToken denom valid 32bytes

## 17.5.0

### Minor Changes

- 0668adf: add Taiko Token https://taiko.xyz
- d059cee: Updates starknet & paradex endpoints to v8
- f000dae: add `noble` metadata and addresses to chains

## 17.4.0

### Minor Changes

- b6dab1b: extended kySOL route to sonicSVM

## 17.3.0

### Minor Changes

- e158598: Added custom YAML sorting rules from @hyperlane-xyz/utils to standardize registry file array ordering.
- c737841: Extend oUSDT to bob, hashkey.

## 17.2.0

### Minor Changes

- ab66e3d: Extend wfragSOL and wfragJTO.
- a157223: Add adraSOL deploy config.

### Patch Changes

- 4fa604e: Add adraSOL metadata.
- c1986af: Update to Hyperlane SDK 13.2.1.

## 17.1.0

### Minor Changes

- 35c8e77: Update GithubRegistry getWarpRoutes to fetch combined warpRouteConfigs.yaml file
- 2b679ca: Added edgenchain config
- bec384b: added ozean poseidon testnet
- ee66a9b: Deploy to botanix, katana. Update arcadia gecko ID.
- e6462f7: Added core deployment to paradex

### Patch Changes

- a7709f7: Remove treasuretopaz testnet.
- 191d00e: Update Renzo EZETH protocol fee values to match onchain
- 22ff449: Add wfragBTC.

## 17.0.0

### Major Changes

- 432c8eb: Update tUSD warp route to Nucleus owners

### Minor Changes

- d485bfe: Remove Arbitrum from SMOL route and update configs

### Patch Changes

- d1d05e5: Rename EZETH prod and stage file names to renzo-prod and renzo-stage respectively
- f7a13c5: Update starknet's coingeckoId to be ethereum
- 4074d49: Updated starknet domainId

## 16.1.0

### Minor Changes

- 07b28b1: Added bbSOL/solanamainnet-soon warp route
- 62851e3: Added chain metadata for starknet

### Patch Changes

- 9ce0b51: Add wfragBTC metadata.
- fed0fdd: Update build.ts to create the correct warpRouteConfigs.yaml (without the shortnames)
- 74adbaa: Switch from STRK to ETH as starknet's native token
- e1d8fc7: Added IGP (zero address - doesn't exist yet)

## 16.0.0

### Major Changes

- d8c5039: Update Warp Core Config warp route Id generation logic to accept a specified warpRouteId, use the a synthetic token, or fallback to original chain names algo. Related util functions such as createWarpRouteConfigId no longer contains warpRouteId generation logic and instead only accepts a symbol and label. The logic has been moved to warpRouteConfigToId static method.

### Minor Changes

- 8a097f3: Add REZ extension config for Unichain
- 5e10fb5: Add logoURI to missing ETH routes

### Patch Changes

- db7d740: Add TGT coingeckoId

## 15.11.0

### Minor Changes

- 4a7a13f: Add test to ensure Starknet chains have reorgPeriod of 1
- e0a0fa5: Added metadata.json and logo for bbSOL
- 397da55: Add USDN warp route deployment on Aurora testnet.
- 1c2ae01: Include combined warp route configs in repository

### Patch Changes

- 4a7a13f: Fixed starknetsepolia BlockTime & adjusted reorgPeriod for Starknet chains

## 15.10.1

### Patch Changes

- 1e37082: Updates the FileSystemRegistry to not throw when adding a warp route configuration. This essentially removes the need for an update function.
- 331ff5f: add coingecko-id for DAI

## 15.10.0

### Minor Changes

- f36b3c4: Add CHILL warp deploy

## 15.9.0

### Minor Changes

- 1e82651: Introduces configuration to support the deployment of the RDO Token across Ethereum and Binance Smart Chain (BSC).
- c5b8e74: rename path to oUSDT route so that the symbol is consistent, USDT -> oUSDT

## 15.8.1

### Patch Changes

- 221f568: The GithubRegistry now bypasses the new archive downloading logic when running in a browser environment
- c5edccc: Add CHILL metadata.

## 15.8.0

### Minor Changes

- 9b5a470: add FUEL warp route

## 15.7.1

### Patch Changes

- 4b31a7f: Connects the solana chain to the rest of subtensor warp route

## 15.7.0

### Minor Changes

- 35bafb8: Update miraclechain logo and default ISMs.
- c9794df: Update default ISMs on solanamainnet, soon, svmbnb.
- 166a9d2: Deploy to neuratestnet, rometestnet. Remove suavetoliman from default testnets.
- d85abc6: update the existing getWarpRouteDeployConfigPath with new algorithm to propose and validate a warp route id
- 6fc272f: Add KYVE warp route deployment.

### Patch Changes

- e5cc51d: The GithubRegistry now downloads a zip archive of the registry files to avoid running into rate limits.

## 15.6.0

### Minor Changes

- 46ce802: Update hyperlane SDK to 13.0.0.

### Patch Changes

- f76d8f7: Add SOL/apechain-solanamainnet.
- f76d8f7: Add Fartcoin, PENGU, UFD.

## 15.5.0

### Minor Changes

- a9ca27a: Add Subtensor USDC configs

### Patch Changes

- 16d1e1e: Update to TGT warp route to Fireblocks owners

## 15.4.0

### Minor Changes

- ea62684: Updated mirai route deploy config to show current ownership setup
- 172087e: Add TGT warp configs

## 15.3.0

### Minor Changes

- d96e1ce: Add chain metadata for starknetsepolia, paradexsepolia.
- 5f22611: Deploy to new chains: ontology, miraclechain, kyve.
- fa91bbd: Added tUSD/eclipsemainnet-ethereum warp route

### Patch Changes

- 0166c65: Adding MIRAI warp route
- 02813bd: Update plumenetwork.xyz -> plume.org.
- 50c45bf: updated warp route deployment config files to match the on chain config

## 15.2.0

### Minor Changes

- 49080f4: added artifacts for the coti wbtc and eth routes

## 15.1.0

### Minor Changes

- d223f2a: Update eclipsemainnet ISM
- 4119b8d: Add Boop, PEPE and GG warp routes artifacts for apechain and arbitrum

## 15.0.0

### Major Changes

- 93f9850: May 6 testnet batch: nobletestnet, megaethtestnet, basecamptestnet, bepolia. Removes metadata for old berabartio + camptestnet. Update weavevm -> load.network branding.

### Minor Changes

- d56aa3f: Add svmbnb

### Patch Changes

- 987992a: Update eclipse block explorer URL

## 14.2.0

### Minor Changes

- 55b9c35: Add miracle chain

### Patch Changes

- a203c16: Remove ink connection for oUSDT

## 14.1.0

### Minor Changes

- e9f844c: Add explorer API keys to some (most popular) chains.

### Patch Changes

- 65b313a: Fix wfragJTO: add correct collateral.

## 14.0.0

### Major Changes

- 16d2a83: Standardized Warp Route configuration API by adding consistent addWarpRouteConfig method to IRegistry interface and removed method overload in FileSystemRegistry.

## 13.16.1

### Patch Changes

- 60cfef3: Adding wfragSOL and wfragJTO deploy artifacts.

## 13.16.0

### Minor Changes

- 9366912: Remove connections for ETH/arbitrum-base-ethereum-lumiaprism-polygon route
- 3206b17: Added the deployment data for the ES token

### Patch Changes

- 08ca361: add PAXG/arbitrum-ethereum
- aad4f25: Re-add oUSDT extension

## 13.15.0

### Minor Changes

- 86c5ee7: Add new chains: hashkey infinityVM ontology game7 fluence peaq

### Patch Changes

- 8669ded: Remove connections to and from sonic, bitlayer, ronin, mantle and linea for oUSDT route

## 13.14.2

### Patch Changes

- b559f9a: Change oUSDT staging symbol to oUSDTSTAGE

## 13.14.1

### Patch Changes

- d35bc84: oUSDT: Remove worldchain connection, add logoURI and coinGeckoId

## 13.14.0

### Minor Changes

- 57a874f: The registry code is restructured by moving filesystem components to a dedicated directory. ESLint restrictions added to prevent Node.js imports in browser components.
- 4c4d2e7: Extend oUSDT to new chains: ethereum, sonic, bitlayer, ronin, mantle, metis, linea, metal.
- 6257c9a: Remove bad or flaky rpcs from the registry and re-enable health checks for healthy chains
- ed210b2: add `nobletestnet` metadata and addresses to chains
- c34f9a0: Added `getWarpRouteDeployConfigPath` function to BaseRegistry
- b8b76d5: Add milkyway coingecko id

### Patch Changes

- 62a99e8: Transfer MILK ownership.
- b3e432c: Add explicit proxyAdmin.owner to USDC/ancient8-ethereum, USDT/eclipsemainnet-ethereum-solanamainnet, WBTC/eclipsemainnet-ethereum
- 0c74ff1: Update remoteRouter names to domainIds for zeronetwork USDC & USDT, and teasure SMOL

## 13.13.0

### Minor Changes

- 3774ce1: Deploy to auroratestnet. Add milkywaytestnet to default ISMs.

### Patch Changes

- cbfbf23: Fix `from` block from milkyway
- 4f572b8: Update to latest worldchain logo.
- 5ca6777: Update EZETH and EZETH stage with worldchain extension

## 13.12.0

### Minor Changes

- 39199c0: Add MILK/bsc-milkyway route.

## 13.11.0

### Minor Changes

- 1599da7: Add milkyway chain metadata and addresses.
- 86a9916: Update to hyperlane SDK 12.3.0.

## 13.10.0

### Minor Changes

- ccbed07: added milkywaytestnet chain deployment

### Patch Changes

- 1227be2: Update ZeroNetwork USDT owners, and remove extraneous ownerOverrides
- 8a88ab6: Updated `remoteRouters` in `-deploy.yaml` to reflect non-fully connected deployments and synchronised the `connections` property in `-config.yaml`.
- c958338: Add lumia Logo
- e080b2d: Update USDC zeronetwork owners
- 3eea825: Default ISM updates.
- f4e41f2: Adding wfragJTO and wfragSOL metadata.

## 13.9.0

### Minor Changes

- 79a90e0: Add ETH/arbitrum-base-ethereum-lumiaprism-optimism-polygon configs

## 13.8.0

### Minor Changes

- f738580: Remove mailbox configs from warp route deployments

### Patch Changes

- a72d34c: Extend LUMIA with arbitrum, avalanche, base, optimism, polygon

## 13.7.1

### Patch Changes

- 23259fd: Add logoURI for COTI USDC

## 13.7.0

### Minor Changes

- 18b9ed8: remove higly rate limited rpcs for arb, base, bsc, op and ethereum

## 13.6.0

### Minor Changes

- 4d2c28d: Added the USDC/coti-ethereum warp route
- 53c4667: Add production and staging warp route config for HYPER and stHYPER
- 17630ed: Add the SUPR configs and logo

### Patch Changes

- 10bb5bd: Revert "chore: fix configs with violations (#765)" due to mailbox removal
- 079da1c: add missing coingecko id to hyper tokens
- 0796402: Reorder BSC rpc urls

## 13.5.0

### Minor Changes

- b09f287: Add USDT/ethereum-lumia for Lumia Prisim
- d9520ae: Add USDC/ethereum-lumiaprism warp route artifacts

## 13.4.0

### Minor Changes

- 5fca08b: Update kyvetestnet protocol from cosmos to cosmosnative.

### Patch Changes

- 58b2338: Update polygon RPCs, removing default ankr one.
- a68c1e1: Update hyperevm configs to include explicit proxyAdmin to resolve check-deploy violations
- 8c18d62: Update modetestnet deployer.

## 13.3.0

### Minor Changes

- 0946efd: Update hyperlane SDK.

### Patch Changes

- cdd6a74: Remove routing between base and ethereum

## 13.2.0

### Minor Changes

- 6dd7494: added second soon wr deployment batch metadata
- f774fd3: Add PZETH deploy and PZETHSTAGE deploy and warp core config
- 4b7aa08: added registry artifacts for soon wr second batch

### Patch Changes

- cd66a33: Update oUSDT config to include ownerOverrides for collateralToken and collateralProxyadmin

## 13.1.0

### Minor Changes

- 5941065: Hot fix GithubRefistry CORS error

### Patch Changes

- aec938e: Rotate default ethereum RPC to llamarpc.

## 13.0.0

### Major Changes

- 5a83d04: Update to Hyperlane SDK 11.0.0, which includes support for the new "cosmosnative" ProtocolType.

### Minor Changes

- 0067c33: Enroll kyvetestnet on default ISMs.
- c15dab3: Update default ISMs for March 31st chain deploy batch.

## 12.2.0

### Minor Changes

- 48ea375: add `kyvetestnet` metadata to chains
- 9357948: add ai16z, WIF, ELIZA, MEW, Pnut soon tokens
- 2251c09: add `kyvetestnet` addresses to chains

### Patch Changes

- 9266157: Update Superseed ownership

## 12.1.0

### Minor Changes

- 4d162ad: Rename staging USDC route with proper symbol

## 12.0.0

### Major Changes

- d11c317: Deploy to cotitestnet. Remove existing deployment and redeploy on plumetestnet2 and modetestnet.

### Minor Changes

- 432e8ba: Deploy to coti, deepbrainchain, nibiru, opbnb, reactive.

## 11.4.0

### Minor Changes

- dd0fd9f: Add SPICE warp route config

## 11.3.1

### Patch Changes

- f1a019c: Remove connection to worldchain in oUSDT deployment

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
