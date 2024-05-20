import type { Logger } from 'pino';

import type { ChainMap, ChainMetadata, ChainName, WarpCoreConfig } from '@hyperlane-xyz/sdk';
import { ChainAddresses } from '../types.js';
import { ChainFiles, IRegistry, RegistryContent, RegistryType } from './IRegistry.js';
import { SynchronousRegistry } from './SynchronousRegistry.js';

const PARTIAL_URI_PLACEHOLDER = '__partial_registry__';

/**
 * A registry that accepts partial data, such as incomplete chain metadata or addresses.
 * Useful for merging with other registries force overrides of subsets of data.
 */
export interface PartialRegistryOptions {
  chainMetadata?: ChainMap<Partial<ChainMetadata>>;
  chainAddresses?: ChainMap<Partial<ChainAddresses>>;
  // TODO add more fields here as needed
  logger?: Logger;
}

export class PartialRegistry extends SynchronousRegistry implements IRegistry {
  public readonly type = RegistryType.Partial;
  public chainMetadata: ChainMap<Partial<ChainMetadata>>;
  public chainAddresses: ChainMap<Partial<ChainAddresses>>;

  constructor({ chainMetadata, chainAddresses, logger }: PartialRegistryOptions) {
    super({ uri: PARTIAL_URI_PLACEHOLDER, logger });
    this.chainMetadata = chainMetadata || {};
    this.chainAddresses = chainAddresses || {};
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
    return {
      chains,
      deployments: {},
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

  protected createOrUpdateChain(chain: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): void {
    if (chain.metadata) this.chainMetadata[chain.chainName] = chain.metadata;
    if (chain.addresses) this.chainAddresses[chain.chainName] = chain.addresses;
  }
}
