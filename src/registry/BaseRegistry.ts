import type { Logger } from 'pino';

import type {
  ChainMap,
  ChainMetadata,
  ChainName,
  WarpCoreConfig,
  WarpRouteDeployConfig,
} from '@hyperlane-xyz/sdk';
import type { ChainAddresses, MaybePromise, WarpDeployConfigMap } from '../types.js';
import { WarpRouteConfigMap } from '../types.js';
import { stripLeadingSlash } from '../utils.js';
import type {
  AddWarpRouteConfigOptions,
  AddWarpRouteOptions,
  IRegistry,
  RegistryContent,
  RegistryType,
  UpdateChainParams,
  WarpRouteFilterParams,
} from './IRegistry.js';
import { MergedRegistry } from './MergedRegistry.js';
import { createWarpRouteConfigId, warpRouteConfigToId } from './warp-utils.js';

export abstract class BaseRegistry implements IRegistry {
  public abstract type: RegistryType;
  public readonly uri: string;
  protected readonly logger: Logger;

  // Caches
  protected listContentCache?: RegistryContent;
  protected metadataCache?: ChainMap<ChainMetadata>;
  protected isMetadataCacheFull: boolean = false;
  protected addressCache?: ChainMap<ChainAddresses>;
  protected isAddressCacheFull: boolean = false;

  constructor({ uri, logger }: { uri: string; logger?: Logger }) {
    this.uri = uri;
    // @ts-ignore forcing in to avoid a @hyperlane-xyz/utils
    // dependency here, which could bloat consumer bundles
    // unnecessarily (e.g. they just want metadata)
    this.logger = logger || console;
  }

  getUri(itemPath?: string): string {
    if (itemPath) itemPath = stripLeadingSlash(itemPath);
    return itemPath ? `${this.uri}/${itemPath}` : this.uri;
  }

  protected getChainsPath(): string {
    return 'chains';
  }

  protected getWarpRoutesPath(): string {
    return 'deployments/warp_routes';
  }

  protected getWarpRouteCoreConfigPath(config: WarpCoreConfig, options?: AddWarpRouteOptions) {
    return `${this.getWarpRoutesPath()}/${warpRouteConfigToId(
      config,
      options?.symbol,
    )}-config.yaml`;
  }

  protected getWarpRouteDeployConfigPath(
    config: WarpRouteDeployConfig,
    options: AddWarpRouteConfigOptions,
  ) {
    const chains = Object.keys(config);
    const routeId =
      'warpRouteId' in options
        ? options.warpRouteId
        : createWarpRouteConfigId(options.symbol, chains);

    return `${this.getWarpRoutesPath()}/${routeId}-deploy.yaml`;
  }

  abstract listRegistryContent(): MaybePromise<RegistryContent>;

  abstract getChains(): MaybePromise<Array<ChainName>>;

  abstract getMetadata(): MaybePromise<ChainMap<ChainMetadata>>;
  abstract getChainMetadata(chainName: ChainName): MaybePromise<ChainMetadata | null>;

  abstract getAddresses(): MaybePromise<ChainMap<ChainAddresses>>;
  abstract getChainAddresses(chainName: ChainName): MaybePromise<ChainAddresses | null>;

  async getChainLogoUri(chainName: ChainName): Promise<string | null> {
    const registryContent = await this.listRegistryContent();
    const chain = registryContent.chains[chainName];
    return chain?.logo ?? null;
  }

  abstract addChain(chain: UpdateChainParams): MaybePromise<void>;
  abstract updateChain(chain: UpdateChainParams): MaybePromise<void>;
  abstract removeChain(chain: ChainName): MaybePromise<void>;

  abstract getWarpRoute(routeId: string): MaybePromise<WarpCoreConfig | null>;
  abstract getWarpRoutes(filter?: WarpRouteFilterParams): MaybePromise<WarpRouteConfigMap>;
  abstract addWarpRoute(config: WarpCoreConfig): MaybePromise<void>;

  abstract getWarpDeployConfig(routeId: string): MaybePromise<WarpRouteDeployConfig | null>;
  abstract getWarpDeployConfigs(filter?: WarpRouteFilterParams): MaybePromise<WarpDeployConfigMap>;

  merge(otherRegistry: IRegistry): IRegistry {
    return new MergedRegistry({ registries: [this, otherRegistry], logger: this.logger });
  }
}
