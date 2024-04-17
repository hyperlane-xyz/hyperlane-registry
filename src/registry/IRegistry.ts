import type { ChainMap, ChainMetadata, ChainName } from '@hyperlane-xyz/sdk';
import { ChainAddresses, MaybePromise } from '../types.js';

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

export enum RegistryType {
  Github = 'github',
  Local = 'local',
}

export interface IRegistry {
  type: RegistryType;
  listRegistryContent(): MaybePromise<RegistryContent>;
  getChains(): MaybePromise<Array<ChainName>>;
  getMetadata(): MaybePromise<ChainMap<ChainMetadata>>;
  getChainMetadata(chainName: ChainName): MaybePromise<ChainMetadata | null>;
  getAddresses(): MaybePromise<ChainMap<ChainAddresses>>;
  getChainAddresses(chainName: ChainName): MaybePromise<ChainAddresses | null>;
  // TODO: Define write-related methods
}
