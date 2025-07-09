import type { Logger } from 'pino';

import type {
  ChainMap,
  ChainMetadata,
  ChainName,
  WarpCoreConfig,
  WarpRouteDeployConfig,
} from '@hyperlane-xyz/sdk';
import { ChainAddresses, DeepPartial, WarpRouteId } from '../types.js';
import {
  AddWarpRouteConfigOptions,
  ChainFiles,
  IRegistry,
  RegistryContent,
  RegistryType,
} from './IRegistry.js';
import { SynchronousRegistry } from './SynchronousRegistry.js';
import { BaseRegistry } from './BaseRegistry.js';
const PARTIAL_URI_PLACEHOLDER = '__partial_registry__';

/**
 * A registry that accepts partial data, such as incomplete chain metadata or addresses.
 * Useful for merging with other registries force overrides of subsets of data.
 */
export interface PartialRegistryOptions {
  chainMetadata?: ChainMap<DeepPartial<ChainMetadata>>;
  chainAddresses?: ChainMap<DeepPartial<ChainAddresses>>;
  warpRoutes?: Array<DeepPartial<WarpCoreConfig>>;
  warpDeployConfigs?: Array<DeepPartial<WarpRouteDeployConfig>>;
  // TODO add more fields here as needed
  logger?: Logger;
}

export class PartialRegistry extends SynchronousRegistry implements IRegistry {
  public readonly type = RegistryType.Partial;
  public chainMetadata: ChainMap<DeepPartial<ChainMetadata>>;
  public chainAddresses: ChainMap<DeepPartial<ChainAddresses>>;
  public warpRoutes: Array<DeepPartial<WarpCoreConfig>>;
  public warpDeployConfigs: Array<DeepPartial<WarpRouteDeployConfig>>;

  constructor({
    chainMetadata,
    chainAddresses,
    warpRoutes,
    warpDeployConfigs,
    logger,
  }: PartialRegistryOptions) {
    super({ uri: PARTIAL_URI_PLACEHOLDER, logger });
    this.chainMetadata = chainMetadata || {};
    this.chainAddresses = chainAddresses || {};
    this.warpRoutes = warpRoutes || [];
    this.warpDeployConfigs = warpDeployConfigs || [];
  }

  listRegistryContent(): RegistryContent {
    const chains: ChainMap<ChainFiles> = {};
    Object.keys(this.chainMetadata).forEach((c) => {
      chains[c] ||= {};
      chains[c].metadata = PARTIAL_URI_PLACEHOLDER;
    });
    Object.keys(this.chainAddresses).forEach((c) => {
      chains[c] ||= {};
      chains[c].addresses = PARTIAL_URI_PLACEHOLDER;
    });

    const warpRoutes = this.warpRoutes.reduce<RegistryContent['deployments']['warpRoutes']>(
      (acc, r) => {
        // Cast is useful because this handles partials and is safe because the fn validates data
        const id = BaseRegistry.warpRouteConfigToId(r as WarpCoreConfig);
        acc[id] = PARTIAL_URI_PLACEHOLDER;
        return acc;
      },
      {},
    );

    return {
      chains,
      deployments: {
        warpRoutes,
        warpDeployConfig: {}, // TODO: This cannot be implemented without deriving the token symbol from config.token
      },
    };
  }

  getMetadata(): ChainMap<ChainMetadata> {
    return this.chainMetadata as ChainMap<ChainMetadata>;
  }

  getAddresses(): ChainMap<ChainAddresses> {
    return this.chainAddresses as ChainMap<ChainAddresses>;
  }

  removeChain(chainName: ChainName): void {
    super.removeChain(chainName);
    if (this.chainMetadata?.[chainName]) delete this.chainMetadata[chainName];
    if (this.chainAddresses?.[chainName]) delete this.chainAddresses[chainName];
  }

  addWarpRoute(_config: WarpCoreConfig): void {
    throw new Error('Method not implemented.');
  }

  addWarpRouteConfig(_config: WarpRouteDeployConfig, _options: AddWarpRouteConfigOptions): void {
    throw new Error('Method not implemented.');
  }

  protected getWarpRoutesForIds(ids: WarpRouteId[]): WarpCoreConfig[] {
    return this.warpRoutes.filter((r) => {
      const id = BaseRegistry.warpRouteConfigToId(r as WarpCoreConfig);
      return ids.includes(id);
    }) as WarpCoreConfig[];
  }

  protected getWarpDeployConfigForIds(_ids: WarpRouteId[]): WarpRouteDeployConfig[] {
    // TODO: Right now this returns an empty array
    // This cannot be implemented without deriving the token symbol from config.token
    // We will revisit once we merge the configs
    return this.warpDeployConfigs as WarpRouteDeployConfig[];
  }

  protected createOrUpdateChain(chain: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): void {
    if (chain.metadata) this.chainMetadata[chain.chainName] = chain.metadata;
    if (chain.addresses) this.chainAddresses[chain.chainName] = chain.addresses;
  }
}
