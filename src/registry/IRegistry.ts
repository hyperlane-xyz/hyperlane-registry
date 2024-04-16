import type { Address } from '@hyperlane-xyz/utils';

import type { ChainMap, ChainMetadata, ChainName } from '@hyperlane-xyz/sdk';

export interface ChainFiles {
  metadata?: string;
  addresses?: string;
}

export interface RegistryContent {
  chains: ChainMap<ChainFiles>;
  deployments: {
    // TODO define deployment artifact shape here
  };
}

export type ChainAddresses = Record<string, Address>;

export interface IRegistry {
  listRegistryContent(): Promise<RegistryContent>;
  getChains(): Promise<Array<ChainName>>;
  getMetadata(): Promise<ChainMap<ChainMetadata>>;
  getChainMetadata(chainName: ChainName): Promise<ChainMetadata | null>;
  getAddresses(): Promise<ChainMap<ChainAddresses>>;
  getChainAddresses(chainName: ChainName): Promise<ChainAddresses | null>;
  // TODO: Define write-related methods
}
