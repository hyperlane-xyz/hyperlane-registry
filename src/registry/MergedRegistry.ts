import type { Logger } from 'pino';

import type {
  ChainMap,
  ChainMetadata,
  ChainName,
  WarpCoreConfig,
  WarpRouteDeployConfig,
} from '@hyperlane-xyz/sdk';
import {
  ChainAddresses,
  UpdateChainParams,
  WarpDeployConfigMap,
  WarpRouteConfigMap,
  WarpRouteFilterParams,
  WarpRouteId,
} from '../types.js';
import { objMerge } from '../utils.js';
import {
  AddWarpRouteConfigOptions,
  IRegistry,
  IRegistryMethods,
  RegistryContent,
  RegistryType,
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
        warpDeployConfig: {},
      },
    });
  }

  async getChains(): Promise<Array<ChainName>> {
    return Object.keys(await this.getMetadata());
  }

  async getMetadata(): Promise<ChainMap<ChainMetadata>> {
    const results = await this.multiRegistryRead((r) => r.getMetadata());
    return results.reduce((acc, content) => objMerge(acc, content), {});
  }

  async getChainMetadata(chainName: ChainName): Promise<ChainMetadata | null> {
    return (await this.getMetadata())[chainName] || null;
  }

  async getAddresses(): Promise<ChainMap<ChainAddresses>> {
    const results = await this.multiRegistryRead((r) => r.getAddresses());
    return results.reduce((acc, content) => objMerge(acc, content), {});
  }

  async getChainAddresses(chainName: ChainName): Promise<ChainAddresses | null> {
    return (await this.getAddresses())[chainName] || null;
  }

  async getChainLogoUri(chainName: ChainName): Promise<string | null> {
    const results = await this.multiRegistryRead((r) => r.getChainLogoUri(chainName));
    return results.find((uri) => !!uri) || null;
  }

  async addChain(chain: UpdateChainParams): Promise<void> {
    return this.multiRegistryWrite(
      async (registry) => await registry.addChain(chain),
      'addChain',
      `adding chain ${chain.chainName}`,
    );
  }

  async updateChain(chain: UpdateChainParams): Promise<void> {
    return this.multiRegistryWrite(
      async (registry) => await registry.updateChain(chain),
      'updateChain',
      `updating chain ${chain.chainName}`,
    );
  }

  async removeChain(chain: ChainName): Promise<void> {
    return this.multiRegistryWrite(
      async (registry) => await registry.removeChain(chain),
      'removeChain',
      `removing chain ${chain}`,
    );
  }

  async getWarpRoute(id: WarpRouteId): Promise<WarpCoreConfig | null> {
    const results = await this.multiRegistryRead((r) => r.getWarpRoute(id));
    return results.find((r) => !!r) || null;
  }

  async getWarpDeployConfig(id: WarpRouteId): Promise<WarpRouteDeployConfig | null> {
    const results = await this.multiRegistryRead((r) => r.getWarpDeployConfig(id));
    return results.find((r) => !!r) || null;
  }

  async getWarpRoutes(filter?: WarpRouteFilterParams): Promise<WarpRouteConfigMap> {
    const results = await this.multiRegistryRead((r) => r.getWarpRoutes(filter));
    return results.reduce((acc, content) => objMerge(acc, content), {});
  }

  async getWarpDeployConfigs(filter?: WarpRouteFilterParams): Promise<WarpDeployConfigMap> {
    const results = await this.multiRegistryRead((r) => r.getWarpDeployConfigs(filter));
    return results.reduce((acc, content) => objMerge(acc, content), {});
  }

  async addWarpRoute(config: WarpCoreConfig, options?: AddWarpRouteConfigOptions): Promise<void> {
    return this.multiRegistryWrite(
      async (registry) => await registry.addWarpRoute(config, options),
      'addWarpRoute',
      'adding warp route',
    );
  }

  async addWarpRouteConfig(
    config: WarpRouteDeployConfig,
    options: AddWarpRouteConfigOptions,
  ): Promise<void> {
    return this.multiRegistryWrite(
      async (registry) => await registry.addWarpRouteConfig(config, options),
      'addWarpRouteConfig',
      'adding warp route deploy config',
    );
  }

  protected multiRegistryRead<R>(readFn: (registry: IRegistry) => Promise<R> | R) {
    return Promise.all(this.registries.map(readFn));
  }

  protected async multiRegistryWrite(
    writeFn: (registry: IRegistry) => Promise<void>,
    methodName: IRegistryMethods,
    logMsg: string,
  ): Promise<void> {
    for (const registry of this.registries) {
      if (registry.unimplementedMethods?.has(methodName)) {
        this.logger.warn(`Skipping ${logMsg} at ${registry.type} registry (not supported)`);
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
