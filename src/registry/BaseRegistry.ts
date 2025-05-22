import type { Logger } from 'pino';

import {
  HypTokenRouterConfig,
  TokenType,
  ChainMap,
  ChainMetadata,
  ChainName,
  WarpCoreConfig,
  WarpRouteDeployConfig,
} from '@hyperlane-xyz/sdk';
import { assert, objFilter, objLength } from '@hyperlane-xyz/utils';
import type { ChainAddresses, MaybePromise, WarpDeployConfigMap, WarpRouteId } from '../types.js';
import { WarpRouteConfigMap } from '../types.js';
import { stripLeadingSlash } from '../utils.js';
import type {
  AddWarpRouteConfigOptions,
  IRegistry,
  RegistryContent,
  RegistryType,
  UpdateChainParams,
  WarpRouteFilterParams,
} from './IRegistry.js';
import { MergedRegistry } from './MergedRegistry.js';
import { createWarpRouteConfigId } from './warp-utils.js';
import { WARP_ROUTE_ID_REGEX } from '../consts.js';

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

  /**
   * Gets a warp route ID from a warp route config.
   * This uses the first symbol in the list. Situations where a config contains multiple
   * symbols are not officially supported yet.
   */
  static warpRouteConfigToId(
    config: WarpCoreConfig,
    options?: AddWarpRouteConfigOptions,
  ): WarpRouteId {
    let warpRouteId;
    if (options && 'warpRouteId' in options) {
      warpRouteId = options.warpRouteId;
    } else {
      if (!config?.tokens?.length) throw new Error('Cannot generate ID for empty warp config');
      const symbols = new Set(config.tokens.map((token) => token.symbol));
      if (!options?.symbol && symbols.size !== 1) {
        throw new Error(
          `Only one token symbol per warp config is supported for now. Found: [${[
            ...symbols,
          ].join()}]`,
        );
      }
      const tokenSymbol = options?.symbol || symbols.values().next().value;
      if (!tokenSymbol) throw new Error('Cannot generate warp config ID without a token symbol');
      const chains = new Set(config.tokens.map((token) => token.chainName));
      warpRouteId = createWarpRouteConfigId(tokenSymbol, [...chains.values()]);
    }

    assert(
      warpRouteId.match(WARP_ROUTE_ID_REGEX),
      `Invalid warp route ID: ${warpRouteId}. Must be in the format such as: TOKENSYMBOL/label...`,
    );

    return warpRouteId;
  }

  protected getWarpRouteCoreConfigPath(
    config: WarpCoreConfig,
    options?: AddWarpRouteConfigOptions,
  ) {
    const warpRouteId = BaseRegistry.warpRouteConfigToId(config, options);

    return `${this.getWarpRoutesPath()}/${warpRouteId}-config.yaml`;
  }

  /**
   * Generates a warp route ID based on the deploy config and options.
   *
   * @param config The warp route deployment config
   * @param options Additional config options for the warp route
   * @returns A string ID for the warp route
   *
   * If a warpRouteId is provided in options, use it directly.
   * Otherwise, the method attempts to generate an ID based on 1 synthetic chain, or defaults to all chains.
   */
  static warpDeployConfigToId(config: WarpRouteDeployConfig, options: AddWarpRouteConfigOptions) {
    const syntheticChains = objFilter(config, (_, c): c is HypTokenRouterConfig =>
      [TokenType.synthetic, TokenType.syntheticRebase, TokenType.syntheticUri].includes(c.type),
    );
    let warpRouteId;
    if ('warpRouteId' in options) {
      warpRouteId = options.warpRouteId;
    } else if (objLength(syntheticChains) === 1) {
      warpRouteId = createWarpRouteConfigId(options.symbol, Object.keys(syntheticChains));
    } else {
      warpRouteId = createWarpRouteConfigId(options.symbol, Object.keys(config));
    }

    assert(
      warpRouteId.match(WARP_ROUTE_ID_REGEX),
      `Invalid warp route ID: ${warpRouteId}. Must be in the format such as: TOKENSYMBOL/label...`,
    );
    return warpRouteId;
  }
  protected getWarpRouteDeployConfigPath(
    config: WarpRouteDeployConfig,
    options: AddWarpRouteConfigOptions,
  ) {
    const warpRouteId = BaseRegistry.warpDeployConfigToId(config, options);

    return `${this.getWarpRoutesPath()}/${warpRouteId}-deploy.yaml`;
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
  abstract addWarpRouteConfig(
    warpConfig: WarpRouteDeployConfig,
    options: AddWarpRouteConfigOptions,
  ): MaybePromise<void>;

  abstract getWarpDeployConfig(routeId: string): MaybePromise<WarpRouteDeployConfig | null>;
  abstract getWarpDeployConfigs(filter?: WarpRouteFilterParams): MaybePromise<WarpDeployConfigMap>;

  merge(otherRegistry: IRegistry): IRegistry {
    return new MergedRegistry({ registries: [this, otherRegistry], logger: this.logger });
  }
}
