import type { Logger } from 'pino';

import { rootLogger } from '@hyperlane-xyz/utils';

import { ChainMap, ChainMetadata, ChainName } from '@hyperlane-xyz/sdk';
import { ChainAddresses, IRegistry, RegistryContent } from './IRegistry.js';

export abstract class BaseRegistry implements IRegistry {
  protected readonly logger: Logger;

  // Caches
  protected listContentCache?: RegistryContent;
  protected metadataCache?: ChainMap<ChainMetadata>;
  protected addressCache?: ChainMap<ChainAddresses>;

  constructor({ logger = rootLogger.child({ module: 'Registry' }) }: { logger?: Logger }) {
    this.logger = logger;
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
