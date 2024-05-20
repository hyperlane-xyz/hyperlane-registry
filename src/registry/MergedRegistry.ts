import type { Logger } from 'pino';

import type { ChainMap, ChainMetadata, ChainName, WarpCoreConfig } from '@hyperlane-xyz/sdk';
import { ChainAddresses } from '../types.js';
import { objMerge } from '../utils.js';
import { BaseRegistry } from './BaseRegistry.js';
import { IRegistry, RegistryContent, RegistryType } from './IRegistry.js';

export interface MergedRegistryOptions {
  registries: Array<IRegistry>;
  logger?: Logger;
}

export class MergedRegistry extends BaseRegistry implements IRegistry {
  public readonly type = RegistryType.Merged;
  public readonly registries: Array<IRegistry>;

  constructor({ registries, logger }: MergedRegistryOptions) {
    super({ uri: '__merged_registry__', logger });
    if (!registries.length) throw new Error('At least one registry URI is required');
    this.registries = registries;
  }

  async listRegistryContent(): Promise<RegistryContent> {
    const results = await this.multiRegistryRead((r) => r.listRegistryContent());
    return results.reduce((acc, content) => objMerge(acc, content), {
      chains: {},
      deployments: {},
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

  async addChain(chain: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): Promise<void> {
    return this.multiRegistryWrite(
      async (registry) => await registry.addChain(chain),
      `adding chain ${chain.chainName}`,
    );
  }

  async updateChain(chain: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): Promise<void> {
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
}
