import type { Logger } from 'pino';

import type { ChainMap, ChainMetadata, ChainName } from '@hyperlane-xyz/sdk';
import type { ChainAddresses, MaybePromise } from '../types.js';
import type { IRegistry, RegistryContent, RegistryType } from './IRegistry.js';

export const CHAIN_FILE_REGEX = /chains\/([a-z0-9]+)\/([a-z]+)\.yaml/;

export abstract class BaseRegistry implements IRegistry {
  public abstract type: RegistryType;
  public readonly uri: string;
  protected readonly logger: Logger;

  // Caches
  protected listContentCache?: RegistryContent;
  protected metadataCache?: ChainMap<ChainMetadata>;
  protected addressCache?: ChainMap<ChainAddresses>;

  constructor({ uri, logger }: { uri: string; logger?: Logger }) {
    this.uri = uri;
    // @ts-ignore forcing in to avoid a @hyperlane-xyz/utils
    // dependency here, which could bloat consumer bundles
    // unnecessarily (e.g. they just want metadata)
    this.logger = logger || console;
  }

  protected getChainsPath(): string {
    return 'chains';
  }

  protected getWarpArtifactsPath(): string {
    return 'deployments/warp_routes';
  }

  abstract listRegistryContent(): MaybePromise<RegistryContent>;
  abstract getChains(): MaybePromise<Array<ChainName>>;
  abstract getMetadata(): MaybePromise<ChainMap<ChainMetadata>>;
  abstract getChainMetadata(chainName: ChainName): MaybePromise<ChainMetadata | null>;
  abstract getAddresses(): MaybePromise<ChainMap<ChainAddresses>>;
  abstract getChainAddresses(chainName: ChainName): MaybePromise<ChainAddresses | null>;
  abstract addChain(chain: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): MaybePromise<void>;
  abstract updateChain(chain: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): MaybePromise<void>;
  abstract removeChain(chain: ChainName): MaybePromise<void>;
}
