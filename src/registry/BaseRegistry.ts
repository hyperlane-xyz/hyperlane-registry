import type { Logger } from 'pino';

import type { ChainMap, ChainMetadata, ChainName } from '@hyperlane-xyz/sdk';
import { ChainAddresses, MaybePromise } from '../types.js';
import type { IRegistry, RegistryContent, RegistryType } from './IRegistry.js';

export const CHAIN_FILE_REGEX = /chains\/([a-z]+)\/([a-z]+)\.yaml/;

export abstract class BaseRegistry implements IRegistry {
  abstract type: RegistryType;
  protected readonly logger: Logger;

  // Caches
  protected listContentCache?: RegistryContent;
  protected metadataCache?: ChainMap<ChainMetadata>;
  protected addressCache?: ChainMap<ChainAddresses>;

  constructor({ logger }: { logger?: Logger }) {
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
}
