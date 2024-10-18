import type { Logger } from 'pino';

import type { ChainMap, ChainMetadata, ChainName, WarpCoreConfig } from '@hyperlane-xyz/sdk';
import { ChainAddresses, WarpRouteConfigMap, WarpRouteId } from '../types.js';
import { objMerge } from '../utils.js';
import {
  IRegistry,
  RegistryContent,
  RegistryType,
  UpdateChainParams,
  WarpRouteFilterParams,
} from './IRegistry.js';

export interface MergedRegistryOptions {
  registries: Array<IRegistry>;
  logger?: Logger;
}

/**
 * A registry that accepts multiple sub-registries.
 * Read methods are performed on all sub-registries and the results are merged.
 * Write methods are performed on all sub-registries.
 * Can be created manually or by calling `.merge()` on an existing registry.
 */
export class MergedRegistry implements IRegistry {
  public readonly type = RegistryType.Merged;
  public readonly uri = '__merged_registry__';
  public readonly registries: Array<IRegistry>;
  protected readonly logger: Logger;

  constructor({ registries, logger }: MergedRegistryOptions) {
    if (!registries.length) throw new Error('At least one registry URI is required');
    this.registries = registries;
    // @ts-ignore
    this.logger = logger || console;
  }

  getUri(): string {
    throw new Error('getUri method not applicable to MergedRegistry');
  }

  async listRegistryContent(): Promise<RegistryContent> {
    const results = await this.multiRegistryRead((r) => r.listRegistryContent());
    return results.reduce((acc, content) => objMerge(acc, content), {
      chains: {},
      deployments: {
        warpRoutes: {},
      },
    });
  }

  async getChains(): Promise<Array<ChainName>> {
    try {
      const metadata = await this.getMetadata();
      return Object.keys(metadata); 
    } catch (error) {
      this.logger.error('Failed to retrieve chains', error);
      return []; 
    }
  }

  async getMetadata(): Promise<ChainMap<ChainMetadata>> {
    try {
      const results = await this.multiRegistryRead((r) => r.getMetadata());
      return results.reduce((acc, content) => objMerge(acc, content), {}); 
    } catch (error) {
      this.logger.error('Failed to retrieve metadata', error);
      return {}; 
    }
  }

  async getChainMetadata(chainName: ChainName): Promise<ChainMetadata | null> {
    try {
      const metadata = await this.getMetadata();
      return metadata[chainName] ?? null; 
    } catch (error) {
      this.logger.error(`Failed to get metadata for chain: ${chainName}`, error);
      return null; 
    }
  }

  async getAddresses(): Promise<ChainMap<ChainAddresses>> {
    try {
      const results = await this.multiRegistryRead((r) => r.getAddresses());
      return results.reduce((acc, content) => objMerge(acc, content), {}); 
    } catch (error) {
      this.logger.error('Failed to retrieve addresses', error);
      return {}; 
    }
  }

  async getChainAddresses(chainName: ChainName): Promise<ChainAddresses | null> {
    try {
      const addresses = await this.getAddresses();
      return addresses[chainName] ?? null; 
    } catch (error) {
      this.logger.error(`Failed to retrieve addresses for chain: ${chainName}`, error);
      return null; 
    }
  }

  async getChainLogoUri(chainName: ChainName): Promise<string | null> {
    try {
      const results = await this.multiRegistryRead((r) => r.getChainLogoUri(chainName));
      return results.find((uri) => !!uri) ?? null; 
    } catch (error) {
      this.logger.error(`Failed to retrieve logo URI for chain: ${chainName}`, error);
      return null; 
    }
  }

  async addChain(chain: UpdateChainParams): Promise<void> {
    return this.multiRegistryWrite(
      async (registry) => await registry.addChain(chain),
      `adding chain ${chain.chainName}`,
    );
  }

  async updateChain(chain: UpdateChainParams): Promise<void> {
    return this.multiRegistryWrite(
      async (registry) => await registry.updateChain(chain),
      `updating chain ${chain.chainName}`,
    );
  }

  async removeChain(chain: ChainName): Promise<void> {
    return this.multiRegistryWrite(
      async (registry) => await registry.removeChain(chain),
      `removing chain ${chain}`,
    );
  }

  async getWarpRoute(id: WarpRouteId): Promise<WarpCoreConfig | null> {
    try {
      const results = await this.multiRegistryRead((r) => r.getWarpRoute(id));
      return results.find((r) => !!r) ?? null;
    } catch (error) {
      this.logger.error(`Failed to retrieve warp route for ID: ${id}`, error);
      return null; 
    }
  }

  async getWarpRoutes(filter?: WarpRouteFilterParams): Promise<WarpRouteConfigMap> {
    try {
      const results = await this.multiRegistryRead((r) => r.getWarpRoutes(filter));
      return results.reduce((acc, content) => objMerge(acc, content), {}); 
    } catch (error) {
      this.logger.error('Failed to retrieve warp routes', error);
      return {}; 
    }
  }

  async addWarpRoute(config: WarpCoreConfig): Promise<void> {
    return this.multiRegistryWrite(
      async (registry) => await registry.addWarpRoute(config),
      'adding warp route',
    );
  }

  protected multiRegistryRead<R>(readFn: (registry: IRegistry) => Promise<R> | R) {
    return Promise.all(this.registries.map(readFn));
  }

  protected async multiRegistryWrite(
    writeFn: (registry: IRegistry) => Promise<void>,
    logMsg: string,
  ): Promise<void> {
    for (const registry of this.registries) {
      // TODO remove this when GithubRegistry supports write methods
      if (registry.type === RegistryType.Github) {
        this.logger.warn(`Skipping ${logMsg} at ${registry.type} registry`);
        continue;
      }
      try {
        this.logger.info(`Now ${logMsg} at ${registry.type} registry at ${registry.uri}`);
        await writeFn(registry);
        this.logger.info(`Done ${logMsg} at ${registry.type} registry`);
      } catch (error) {
        // To prevent loss of artifacts, MergedRegistry write methods are failure tolerant
        this.logger.error(`Failure ${logMsg} at ${registry.type} registry`, error);
      }
    }
  }

  merge(otherRegistry: IRegistry): IRegistry {
    return new MergedRegistry({
      registries: [...this.registries, otherRegistry],
      logger: this.logger,
    });
  }
}
