import type { ChainMap, ChainName, TokenStandard, WarpCoreConfig } from '@hyperlane-xyz/sdk';
import { WARP_ROUTE_CONFIG_FILE_REGEX, WARP_ROUTE_DEPLOY_FILE_REGEX } from '../consts.js';
import { ChainAddresses, WarpRouteId } from '../types.js';
import { WarpRouteFilterParams } from './IRegistry.js';

/**
 * Converts from a full warp config to a map of chain addresses.
 */
export function warpConfigToWarpAddresses(config: WarpCoreConfig): ChainMap<ChainAddresses> {
  return config.tokens.reduce<ChainMap<ChainAddresses>>((acc, token) => {
    const addressKey = getWarpAddressKey(token.standard);
    if (!addressKey || !token.addressOrDenom) return acc;
    acc[token.chainName] = {
      [addressKey]: token.addressOrDenom,
    };
    return acc;
  }, {});
}

function getWarpAddressKey(standard: TokenStandard): string | null {
  const standardValue = standard.toLowerCase();
  if (standardValue.includes('collateral')) return 'collateral';
  if (standardValue.includes('synthetic')) return 'synthetic';
  if (standardValue.includes('native')) return 'native';
  if (standardValue.includes('xerc20lockbox')) return 'xERC20Lockbox';
  if (standardValue.includes('xerc20')) return 'xERC20';
  else return null;
}

/**
 * Gets a warp route ID from a warp route config path.
 * @param configRelativePath A relative path in the deployments dir
 *    (e.g. `warp_routes/USDC/ethereum-arbitrum-config.yaml`)
 */
export function warpRouteConfigPathToId(configRelativePath: string): WarpRouteId {
  return parseWarpRouteConfigPath(configRelativePath, WARP_ROUTE_CONFIG_FILE_REGEX);
}

/**
 * Gets a warp route ID from a warp deploy config path.
 * @param configRelativePath A relative path in the deployments dir
 *    (e.g. `warp_routes/USDC/ethereum-arbitrum-config.yaml`)
 */
export function warpRouteDeployConfigPathToId(configRelativePath: string): WarpRouteId {
  return parseWarpRouteConfigPath(configRelativePath, WARP_ROUTE_DEPLOY_FILE_REGEX);
}

/**
 * Gets a warp route ID from a warp route config path.
 * @param configRelativePath A relative path in the deployments dir
 *    (e.g. `warp_routes/USDC/ethereum-arbitrum-config.yaml`)
 * @param regex regex of the config filename
 */
function parseWarpRouteConfigPath(configRelativePath: string, regex: RegExp) {
  const matches =  configRelativePath.match(regex);
  if (!matches || matches.length < 3)
    throw new Error(`Invalid warp route config path: ${configRelativePath}`);
  const [_, tokenSymbol, chains] = matches;
  return createWarpRouteConfigId(tokenSymbol, chains.split('-'));
}

/**
 * Gets a warp route ID from a warp route config.
 * This uses the first symbol in the lift. Situations where a config contains multiple
 * symbols are not officially supported yet.
 */
export function warpRouteConfigToId(config: WarpCoreConfig): WarpRouteId {
  if (!config?.tokens?.length) throw new Error('Cannot generate ID for empty warp config');
  const tokenSymbol = config.tokens[0].symbol;
  if (!tokenSymbol) throw new Error('Cannot generate warp config ID without a token symbol');
  const chains = new Set(config.tokens.map((token) => token.chainName));
  return createWarpRouteConfigId(tokenSymbol, [...chains.values()]);
}

export function createWarpRouteConfigId(tokenSymbol: string, chains: ChainName[]): WarpRouteId {
  const sortedChains = [...chains].sort();
  return `${tokenSymbol}/${sortedChains.join('-')}`;
}

export function parseWarpRouteConfigId(routeId: WarpRouteId): {
  tokenSymbol: string;
  chainNames: ChainName[];
} {
  const [tokenSymbol, chains] = routeId.split('/');
  return { tokenSymbol, chainNames: chains.split('-') };
}

/**
 * Filters a list of warp route IDs based on the provided filter params.
 */
export function filterWarpRoutesIds<T>(
  idMap: Record<WarpRouteId, T>,
  filter?: WarpRouteFilterParams,
): { ids: WarpRouteId[]; values: T[]; idMap: Record<WarpRouteId, T> } {
  const filterChainName = filter?.chainName?.toLowerCase();
  const filterSymbol = filter?.symbol?.toLowerCase();
  const filtered = Object.entries(idMap).filter(([routeId]) => {
    const { tokenSymbol, chainNames } = parseWarpRouteConfigId(routeId);
    if (filterSymbol && tokenSymbol.toLowerCase() !== filterSymbol) return false;
    if (filterChainName && !chainNames.includes(filterChainName)) return false;
    return true;
  });
  const ids = filtered.map(([routeId]) => routeId);
  const values = filtered.map(([, value]) => value);
  return { ids, values, idMap: Object.fromEntries(filtered) };
}
