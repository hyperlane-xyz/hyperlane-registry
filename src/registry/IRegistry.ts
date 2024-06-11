import type { ChainMap, ChainMetadata, ChainName, WarpCoreConfig } from '@hyperlane-xyz/sdk';
import type { ChainAddresses, MaybePromise } from '../types.js';

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
  uri: string;

  listRegistryContent(): MaybePromise<RegistryContent>;

  getChains(): MaybePromise<Array<ChainName>>;
  getMetadata(): MaybePromise<ChainMap<ChainMetadata>>;
  getChainMetadata(chainName: ChainName): MaybePromise<ChainMetadata | null>;
  getAddresses(): MaybePromise<ChainMap<ChainAddresses>>;
  getChainAddresses(chainName: ChainName): MaybePromise<ChainAddresses | null>;
  addChain(chain: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): MaybePromise<void>;
  updateChain(chain: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): MaybePromise<void>;
  removeChain(chain: ChainName): MaybePromise<void>;

  addWarpRoute(config: WarpCoreConfig): MaybePromise<void>;
  // TODO define more deployment artifact related methods
  getWarpArtifactsPaths(config: WarpCoreConfig): MaybePromise<{ configPath: string; addressesPath: string }>;
}
