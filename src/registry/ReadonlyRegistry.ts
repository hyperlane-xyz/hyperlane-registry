import {
  ChainMap,
  ChainMetadata,
  ChainName,
  WarpCoreConfig,
  WarpRouteDeployConfig,
} from '@hyperlane-xyz/sdk';
import { Logger } from '@hyperlane-xyz/utils';
import {
  ChainAddresses,
  MaybePromise,
  UpdateChainParams,
  WarpDeployConfigMap,
  WarpRouteConfigMap,
  WarpRouteFilterParams,
} from '../types.js';
import {
  AddWarpRouteConfigOptions,
  IRegistry,
  IRegistryWriteMethod,
  RegistryContent,
  RegistryType,
} from './IRegistry.js';
import { MergedRegistry } from './MergedRegistry.js';

/**
 * Wraps and delegates all read operations (getChains, getMetadata, getAddresses, etc.)
 * to the underlying registry while blocking all write operations (see {@link IRegistryWriteMethod}).
 *
 * Use this registry when you want to ensure that no modifications can be made to the underlying
 * registry, such as when exposing a registry to untrusted code or when enforcing immutability
 * at runtime.
 *
 * @example
 * ```typescript
 * const githubRegistry = new GithubRegistry({ branch: 'main' });
 * const readonly = new ReadonlyRegistry(githubRegistry);
 *
 * // Read operations work normally
 * const chains = await readonly.getChains();
 *
 * // Write operations are blocked and logged
 * await readonly.addChain(newChain); // Logs a message, does nothing
 * ```
 */
export class ReadonlyRegistry implements IRegistry {
  type: RegistryType = RegistryType.Readonly;
  uri: string;

  constructor(private readonly innerRegistry: IRegistry, private readonly logger?: Logger) {
    this.uri = this.innerRegistry.uri;
  }

  getUri(itemPath?: string): string {
    return this.innerRegistry.getUri(itemPath);
  }

  listRegistryContent(): MaybePromise<RegistryContent> {
    return this.innerRegistry.listRegistryContent();
  }

  getChains(): MaybePromise<Array<ChainName>> {
    return this.innerRegistry.getChains();
  }

  getMetadata(): MaybePromise<ChainMap<ChainMetadata>> {
    return this.innerRegistry.getMetadata();
  }

  getChainMetadata(chainName: ChainName): MaybePromise<ChainMetadata | null> {
    return this.innerRegistry.getChainMetadata(chainName);
  }

  getAddresses(): MaybePromise<ChainMap<ChainAddresses>> {
    return this.innerRegistry.getAddresses();
  }

  getChainAddresses(chainName: ChainName): MaybePromise<ChainAddresses | null> {
    return this.innerRegistry.getChainAddresses(chainName);
  }

  getChainLogoUri(chainName: ChainName): Promise<string | null> {
    return this.innerRegistry.getChainLogoUri(chainName);
  }

  private skipMethodExecution(methodName: IRegistryWriteMethod): MaybePromise<void> {
    const logger = this.logger ?? console;

    logger.info(`Skipping "${methodName}" method call as registry is readonly`);
  }

  addChain(_chain: UpdateChainParams): MaybePromise<void> {
    return this.skipMethodExecution('addChain');
  }

  updateChain(_chain: UpdateChainParams): MaybePromise<void> {
    return this.skipMethodExecution('updateChain');
  }

  removeChain(_chain: ChainName): MaybePromise<void> {
    return this.skipMethodExecution('removeChain');
  }

  getWarpRoute(routeId: string): MaybePromise<WarpCoreConfig | null> {
    return this.innerRegistry.getWarpRoute(routeId);
  }

  getWarpRoutes(filter?: WarpRouteFilterParams): MaybePromise<WarpRouteConfigMap> {
    return this.innerRegistry.getWarpRoutes(filter);
  }

  addWarpRoute(_config: WarpCoreConfig, _options?: AddWarpRouteConfigOptions): MaybePromise<void> {
    return this.skipMethodExecution('addWarpRoute');
  }

  addWarpRouteConfig(
    _config: WarpRouteDeployConfig,
    _options: AddWarpRouteConfigOptions,
  ): MaybePromise<void> {
    return this.skipMethodExecution('addWarpRouteConfig');
  }

  getWarpDeployConfig(routeId: string): MaybePromise<WarpRouteDeployConfig | null> {
    return this.innerRegistry.getWarpDeployConfig(routeId);
  }

  getWarpDeployConfigs(filter?: WarpRouteFilterParams): MaybePromise<WarpDeployConfigMap> {
    return this.innerRegistry.getWarpDeployConfigs(filter);
  }

  merge(otherRegistry: IRegistry): IRegistry {
    return new ReadonlyRegistry(
      new MergedRegistry({ registries: [this, otherRegistry], logger: this.logger }),
      this.logger,
    );
  }
}
