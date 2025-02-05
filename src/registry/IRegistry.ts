import type { ChainMap, ChainMetadata, ChainName, WarpCoreConfig, WarpRouteDeployConfig } from '@hyperlane-xyz/sdk';
import { ChainAddresses, MaybePromise, WarpDeployConfigMap, WarpRouteConfigMap, WarpRouteId } from '../types.js';

export interface ChainFiles {
  metadata?: string;
  addresses?: string;
  logo?: string;
}

export interface RegistryContent {
  // Chain name to file type to file URI
  chains: ChainMap<ChainFiles>;
  deployments: {
    // Warp route ID to config URI
    warpRoutes: Record<WarpRouteId, string>;

    // Warp route ID to warp deploy config URI
    warpDeployConfig: Record<WarpRouteId, string>;
  };
}

export interface UpdateChainParams {
  chainName: ChainName;
  metadata?: ChainMetadata;
  addresses?: ChainAddresses;
}

export interface WarpRouteFilterParams {
  symbol?: string;
  chainName?: ChainName;
}

export enum RegistryType {
  Github = 'github',
  FileSystem = 'filesystem',
  Merged = 'merged',
  Partial = 'partial',
}

export interface AddWarpRouteOptions {
  symbol?: string;
}

export interface IRegistry {
  type: RegistryType;
  uri: string;

  getUri(itemPath?: string): string;

  listRegistryContent(): MaybePromise<RegistryContent>;

  getChains(): MaybePromise<Array<ChainName>>;

  getMetadata(): MaybePromise<ChainMap<ChainMetadata>>;
  getChainMetadata(chainName: ChainName): MaybePromise<ChainMetadata | null>;

  getAddresses(): MaybePromise<ChainMap<ChainAddresses>>;
  getChainAddresses(chainName: ChainName): MaybePromise<ChainAddresses | null>;

  getChainLogoUri(chainName: ChainName): Promise<string | null>;

  addChain(chain: UpdateChainParams): MaybePromise<void>;
  updateChain(chain: UpdateChainParams): MaybePromise<void>;
  removeChain(chain: ChainName): MaybePromise<void>;

  getWarpRoute(routeId: string): MaybePromise<WarpCoreConfig | null>;
  getWarpRoutes(filter?: WarpRouteFilterParams): MaybePromise<WarpRouteConfigMap>;
  addWarpRoute(config: WarpCoreConfig, options?: AddWarpRouteOptions): MaybePromise<void>;

  getWarpDeployConfig(routeId: string): MaybePromise<WarpRouteDeployConfig | null>;
  getWarpDeployConfigs(filter?: WarpRouteFilterParams): MaybePromise<WarpDeployConfigMap>;

  // TODO define more deployment artifact related methods

  merge(otherRegistry: IRegistry): IRegistry;
}
