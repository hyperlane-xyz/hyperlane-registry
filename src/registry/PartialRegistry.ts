import type { Logger } from 'pino';

import type { ChainMap, ChainMetadata, ChainName, WarpCoreConfig } from '@hyperlane-xyz/sdk';
import { ChainAddresses, DeepPartial, WarpRouteId } from '../types.js';
import { ChainFiles, IRegistry, RegistryContent, RegistryType } from './IRegistry.js';
import { SynchronousRegistry } from './SynchronousRegistry.js';
import { warpRouteConfigToId } from './warp-utils.js';

const PARTIAL_URI_PLACEHOLDER = '__partial_registry__';

/**
 * A registry that accepts partial data, such as incomplete chain metadata or addresses.
 * Useful for merging with other registries force overrides of subsets of data.
 */
export interface PartialRegistryOptions {
  chainMetadata?: ChainMap<DeepPartial<ChainMetadata>>;
  chainAddresses?: ChainMap<DeepPartial<ChainAddresses>>;
  warpRoutes?: Array<DeepPartial<WarpCoreConfig>>;
  // TODO add more fields here as needed
  logger?: Logger;
}

export class PartialRegistry extends SynchronousRegistry implements IRegistry {
  public readonly type = RegistryType.Partial;
  public chainMetadata: ChainMap<DeepPartial<ChainMetadata>>;
  public chainAddresses: ChainMap<DeepPartial<ChainAddresses>>;
  public warpRoutes: Array<DeepPartial<WarpCoreConfig>>;

  constructor({
    chainMetadata = {},
    chainAddresses = {},
    warpRoutes = [],
    logger,
  }: PartialRegistryOptions) {
    super({ uri: PARTIAL_URI_PLACEHOLDER, logger });
    this.chainMetadata = chainMetadata;
    this.chainAddresses = chainAddresses;
    this.warpRoutes = warpRoutes;
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
        const id = warpRouteConfigToId(r as WarpCoreConfig);
        acc[id] = PARTIAL_URI_PLACEHOLDER;
        return acc;
      },
      {},
    );

    return {
      chains,
      deployments: {
        warpRoutes,
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
    try {
      super.removeChain(chainName); 
      delete this.chainMetadata?.[chainName]; 
      delete this.chainAddresses?.[chainName]; 
    } catch (error) {
      this.logger.error(`Failed to remove chain: ${chainName}`, error);
    }
  }

  addWarpRoute(_config: WarpCoreConfig): void {
    throw new Error('Method not implemented.');
  }

  protected getWarpRoutesForIds(ids: WarpRouteId[]): WarpCoreConfig[] {
    return this.warpRoutes.filter((r) => {
      const id = warpRouteConfigToId(r as WarpCoreConfig);
      return ids.includes(id);
    }) as WarpCoreConfig[];
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
