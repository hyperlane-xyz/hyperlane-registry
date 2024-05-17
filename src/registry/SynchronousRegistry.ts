import type { ChainMap, ChainMetadata, ChainName, WarpCoreConfig } from '@hyperlane-xyz/sdk';

import { ChainAddresses } from '../types.js';
import { BaseRegistry } from './BaseRegistry.js';
import { type IRegistry, type RegistryContent } from './IRegistry.js';

/**
 * Shared code for sync registries like the FileSystem and Partial registries.
 * This is required because of the inconsistent sync/async methods across registries.
 * If the Infra package can be updated to work with async-only methods, this code can be moved to the BaseRegistry class.
 */
export abstract class SynchronousRegistry extends BaseRegistry implements IRegistry {
  abstract listRegistryContent(): RegistryContent;

  getChains(): Array<ChainName> {
    return Object.keys(this.listRegistryContent().chains);
  }

  abstract getMetadata(): ChainMap<ChainMetadata>;

  getChainMetadata(chainName: ChainName): ChainMetadata | null {
    return this.getMetadata()[chainName] || null;
  }

  abstract getAddresses(): ChainMap<ChainAddresses>;

  getChainAddresses(chainName: ChainName): ChainAddresses | null {
    return this.getAddresses()[chainName] || null;
  }

  addChain(chain: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): void {
    const currentChains = this.listRegistryContent().chains;
    if (currentChains[chain.chainName])
      throw new Error(`Chain ${chain.chainName} already exists in registry`);

    this.createOrUpdateChain(chain);
  }

  updateChain(chain: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): void {
    const currentChains = this.listRegistryContent();
    if (!currentChains.chains[chain.chainName]) {
      this.logger.debug(`Chain ${chain.chainName} not found in registry, adding it now`);
    }
    this.createOrUpdateChain(chain);
  }

  removeChain(chainName: ChainName): void {
    const currentChains = this.listRegistryContent().chains;
    if (!currentChains[chainName]) throw new Error(`Chain ${chainName} does not exist in registry`);

    if (this.listContentCache?.chains[chainName]) delete this.listContentCache.chains[chainName];
    if (this.metadataCache?.[chainName]) delete this.metadataCache[chainName];
    if (this.addressCache?.[chainName]) delete this.addressCache[chainName];
  }

  abstract addWarpRoute(config: WarpCoreConfig): void;

  protected abstract createOrUpdateChain(chain: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): void;
}
