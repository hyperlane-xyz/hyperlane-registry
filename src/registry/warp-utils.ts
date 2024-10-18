import type { ChainMap, ChainName, TokenStandard, WarpCoreConfig } from '@hyperlane-xyz/sdk';
import { WARP_ROUTE_CONFIG_FILE_REGEX } from '../consts.js';
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

const COLLATERAL_KEY = 'collateral';
const SYNTHETIC_KEY = 'synthetic';
const NATIVE_KEY = 'native';
const XERC20_LOCKBOX_KEY = 'xERC20Lockbox';
const XERC20_KEY = 'xERC20';

function getWarpAddressKey(standard: TokenStandard): string | null {
  const standardValue = standard.toLowerCase();
  
  if (standardValue.includes(COLLATERAL_KEY)) return COLLATERAL_KEY;
  if (standardValue.includes(SYNTHETIC_KEY)) return SYNTHETIC_KEY;
  if (standardValue.includes(NATIVE_KEY)) return NATIVE_KEY;
  if (standardValue.includes(XERC20_LOCKBOX_KEY.toLowerCase())) return XERC20_LOCKBOX_KEY;
  if (standardValue.includes(XERC20_KEY.toLowerCase())) return XERC20_KEY;
  
  return null;
}

/**
 * Gets a warp route ID from a warp route config path.
 * @param configRelativePath A relative path in the deployments dir
 *    (e.g. `warp_routes/USDC/ethereum-arbitrum-config.yaml`)
 */
export function warpRouteConfigPathToId(configRelativePath: string): WarpRouteId {
  const matches = configRelativePath.match(WARP_ROUTE_CONFIG_FILE_REGEX);
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
  return `${tokenSymbol}/${chains.sort().join('-')}`;
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
