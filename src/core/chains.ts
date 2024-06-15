/**
 * A list of chains managed by the Hyperlane core team.
 * Hyperlane can be deployed permissionlessly to any chain but for
 * convenience the core team maintains some deployments.
 */
export enum CoreChain {
  alfajores = 'alfajores',
  ancient8 = 'ancient8',
  arbitrum = 'arbitrum',
  avalanche = 'avalanche',
  base = 'base',
  blast = 'blast',
  bsc = 'bsc',
  bsctestnet = 'bsctestnet',
  celo = 'celo',
  chiado = 'chiado',
  eclipsetestnet = 'eclipsetestnet',
  ethereum = 'ethereum',
  fraxtal = 'fraxtal',
  fuji = 'fuji',
  gnosis = 'gnosis',
  inevm = 'inevm',
  injective = 'injective',
  linea = 'linea',
  mantapacific = 'mantapacific',
  moonbeam = 'moonbeam',
  nautilus = 'nautilus',
  neutron = 'neutron',
  optimism = 'optimism',
  plumetestnet = 'plumetestnet',
  polygon = 'polygon',
  polygonzkevm = 'polygonzkevm',
  proteustestnet = 'proteustestnet',
  redstone = 'redstone',
  scroll = 'scroll',
  scrollsepolia = 'scrollsepolia',
  sei = 'sei',
  sepolia = 'sepolia',
  solana = 'solana',
  solanadevnet = 'solanadevnet',
  solanatestnet = 'solanatestnet',
  viction = 'viction',
  zetachain = 'zetachain',
}

export type CoreChainName = keyof typeof CoreChain;

export const CoreMainnets: Array<CoreChainName> = [
  CoreChain.arbitrum,
  CoreChain.ancient8,
  CoreChain.avalanche,
  CoreChain.base,
  CoreChain.blast,
  CoreChain.bsc,
  CoreChain.celo,
  CoreChain.ethereum,
  CoreChain.gnosis,
  CoreChain.inevm,
  CoreChain.injective,
  CoreChain.neutron,
  CoreChain.mantapacific,
  CoreChain.moonbeam,
  CoreChain.optimism,
  CoreChain.polygon,
  CoreChain.polygonzkevm,
  CoreChain.scroll,
  CoreChain.viction,
  // CoreChains.solana,
];

export const CoreTestnets: Array<CoreChainName> = [
  CoreChain.alfajores,
  CoreChain.bsctestnet,
  CoreChain.chiado,
  CoreChain.eclipsetestnet,
  CoreChain.fuji,
  CoreChain.plumetestnet,
  CoreChain.scrollsepolia,
  CoreChain.sepolia,
  CoreChain.solanadevnet,
  CoreChain.solanatestnet,
];

export const CoreChains: Array<CoreChainName> = [...CoreMainnets, ...CoreTestnets];
