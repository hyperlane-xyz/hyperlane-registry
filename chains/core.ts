/**
 * An enumeration of chains managed by the Hyperlane core team.
 * Hyperlane can be deployed permissionlessly to any chain but for
 * convenience the core team maintains some deployments.
 */
export enum CoreChain {
  alfajores = 'alfajores',
  ancient8 = 'ancient8',
  arbitrum = 'arbitrum',
  avalanche = 'avalanche',
  base = 'base',
  bsc = 'bsc',
  bsctestnet = 'bsctestnet',
  celo = 'celo',
  chiado = 'chiado',
  ethereum = 'ethereum',
  fuji = 'fuji',
  gnosis = 'gnosis',
  inevm = 'inevm',
  injective = 'injective',
  mantapacific = 'mantapacific',
  moonbeam = 'moonbeam',
  nautilus = 'nautilus',
  neutron = 'neutron',
  optimism = 'optimism',
  plumetestnet = 'plumetestnet',
  polygon = 'polygon',
  polygonzkevm = 'polygonzkevm',
  proteustestnet = 'proteustestnet',
  scroll = 'scroll',
  scrollsepolia = 'scrollsepolia',
  sepolia = 'sepolia',
  solana = 'solana',
  solanadevnet = 'solanadevnet',
  solanatestnet = 'solanatestnet',
  eclipsetestnet = 'eclipsetestnet',
  viction = 'viction',
}

export type CoreChainName = keyof typeof CoreChain;

export const CoreMainnets: Array<CoreChainName> = [
  CoreChain.arbitrum,
  CoreChain.ancient8,
  CoreChain.avalanche,
  CoreChain.bsc,
  CoreChain.celo,
  CoreChain.ethereum,
  CoreChain.neutron,
  CoreChain.mantapacific,
  CoreChain.moonbeam,
  CoreChain.optimism,
  CoreChain.polygon,
  CoreChain.gnosis,
  CoreChain.base,
  CoreChain.scroll,
  CoreChain.polygonzkevm,
  CoreChain.injective,
  CoreChain.inevm,
  CoreChain.viction,
  // CoreChains.solana,
];

export const CoreTestnets: Array<CoreChainName> = [
  CoreChain.alfajores,
  CoreChain.bsctestnet,
  CoreChain.chiado,
  CoreChain.fuji,
  CoreChain.plumetestnet,
  CoreChain.scrollsepolia,
  CoreChain.sepolia,
  CoreChain.solanadevnet,
  CoreChain.solanatestnet,
  CoreChain.eclipsetestnet,
];

export const CoreChains: Array<CoreChainName> = [
  ...CoreMainnets,
  ...CoreTestnets,
];
