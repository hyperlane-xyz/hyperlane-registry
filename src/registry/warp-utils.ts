import type { ChainMap, TokenStandard, WarpCoreConfig } from '@hyperlane-xyz/sdk';
import { ChainAddresses } from '../types.js';

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
  else return null;
}
