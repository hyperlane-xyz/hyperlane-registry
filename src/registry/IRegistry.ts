import type {
  ChainMap,
  ChainMetadata,
  ChainName,
  WarpCoreConfig,
  WarpRouteDeployConfig,
} from '@hyperlane-xyz/sdk';
import {
  ChainAddresses,
  MaybePromise,
  WarpDeployConfigMap,
  WarpRouteConfigMap,
  WarpRouteId,
  WarpRouteFilterParams,
  UpdateChainParams,
} from '../types.js';

type MethodsOf<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

/**
 * A type listing all method names on IRegistry.
 * It is derived from IRegistry to ensure it's always in sync.
 * Omit is used to avoid a circular reference with the `unimplementedMethods` property.
 */
export type IRegistryMethods = MethodsOf<Omit<IRegistry, 'unimplementedMethods'>>;

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

export enum RegistryType {
  Github = 'github',
  FileSystem = 'filesystem',
  Merged = 'merged',
  Partial = 'partial',
  Http = 'http',
}

export type AddWarpRouteConfigOptions =
  | {
      symbol: string;
    }
  | {
      warpRouteId: WarpRouteId;
    };

export interface IRegistry {
  type: RegistryType;
  uri: string;
  /**
   * An optional set of method names that are not implemented by the registry.
   * If a method is in this set, it should not be called.
   * If this property is undefined, all methods are assumed to be implemented.
   */
  readonly unimplementedMethods?: Set<IRegistryMethods>;

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
  addWarpRoute(config: WarpCoreConfig, options?: AddWarpRouteConfigOptions): MaybePromise<void>;
  addWarpRouteConfig(
    config: WarpRouteDeployConfig,
    options: AddWarpRouteConfigOptions,
  ): MaybePromise<void>;

  getWarpDeployConfig(routeId: string): MaybePromise<WarpRouteDeployConfig | null>;
  getWarpDeployConfigs(filter?: WarpRouteFilterParams): MaybePromise<WarpDeployConfigMap>;

  // TODO define more deployment artifact related methods

  merge(otherRegistry: IRegistry): IRegistry;
}
