import {
  TOKEN_HYP_STANDARDS,
  TokenStandard,
  type ChainMap,
  type WarpCoreConfig,
} from '@hyperlane-xyz/sdk';
import { WARP_ROUTE_CONFIG_FILE_REGEX, WARP_ROUTE_DEPLOY_FILE_REGEX } from '../consts.js';
import { ChainAddresses, WarpRouteFilterParams, WarpRouteId } from '../types.js';

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
function parseWarpRouteConfigPath(configRelativePath: string, regex: RegExp): WarpRouteId {
  const matches = configRelativePath.match(regex);
  if (!matches || matches.length < 3)
    throw new Error(`Invalid warp route config path: ${configRelativePath}`);
  const [_, tokenSymbol, label] = matches;
  return createWarpRouteConfigId(tokenSymbol, label);
}

export function createWarpRouteConfigId(tokenSymbol: string, label: string): WarpRouteId {
  return `${tokenSymbol}/${label}`;
}

export function parseWarpRouteConfigId(routeId: WarpRouteId): {
  tokenSymbol: string;
  label: string;
} {
  const [tokenSymbol, label] = routeId.split('/');
  return { tokenSymbol, label };
}

/**
 * Filters a list of warp route IDs based on the provided filter params.
 */
export function filterWarpRoutesIds<T>(
  idMap: Record<WarpRouteId, T>,
  filter?: WarpRouteFilterParams,
): { ids: WarpRouteId[]; values: T[]; idMap: Record<WarpRouteId, T> } {
  const filterLabel = filter?.label?.toLowerCase();
  const filterSymbol = filter?.symbol?.toLowerCase();
  const filtered = Object.entries(idMap).filter(([routeId]) => {
    const { tokenSymbol, label } = parseWarpRouteConfigId(routeId);
    if (filterSymbol && tokenSymbol.toLowerCase() !== filterSymbol) return false;
    if (filterLabel && !label.includes(filterLabel)) return false;
    return true;
  });
  const ids = filtered.map(([routeId]) => routeId);
  const values = filtered.map(([, value]) => value);
  return { ids, values, idMap: Object.fromEntries(filtered) };
}

// TODO: Move this to the SDK
export const syntheticTokenStandards = TOKEN_HYP_STANDARDS.filter((standard) =>
  new Set([
    TokenStandard.EvmHypSynthetic,
    TokenStandard.EvmHypSyntheticRebase,
    TokenStandard.SealevelHypSynthetic,
    TokenStandard.CwHypSynthetic,
    TokenStandard.CosmNativeHypSynthetic,
    TokenStandard.StarknetHypSynthetic,
  ]).has(standard),
);
