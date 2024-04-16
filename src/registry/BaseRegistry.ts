import type { Logger } from 'pino';

import type { ChainMap, ChainMetadata, ChainName } from '@hyperlane-xyz/sdk';
import type { ChainAddresses, IRegistry, RegistryContent } from './IRegistry.js';

export abstract class BaseRegistry implements IRegistry {
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

  abstract listRegistryContent(): Promise<RegistryContent>;
  abstract getChains(): Promise<Array<ChainName>>;
  abstract getMetadata(): Promise<ChainMap<ChainMetadata>>;
  abstract getChainMetadata(chainName: ChainName): Promise<ChainMetadata | null>;
  abstract getAddresses(): Promise<ChainMap<ChainAddresses>>;
  abstract getChainAddresses(chainName: ChainName): Promise<ChainAddresses | null>;
}
