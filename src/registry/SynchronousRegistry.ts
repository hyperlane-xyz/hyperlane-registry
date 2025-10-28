import type {
  ChainMap,
  ChainMetadata,
  ChainName,
  WarpCoreConfig,
  WarpRouteDeployConfig,
} from '@hyperlane-xyz/sdk';

import {
  ChainAddresses,
  UpdateChainParams,
  WarpDeployConfigMap,
  WarpRouteConfigMap,
  WarpRouteFilterParams,
  WarpRouteId,
} from '../types.js';
import { BaseRegistry } from './BaseRegistry.js';
import { AddWarpRouteConfigOptions, IRegistry, RegistryContent } from './IRegistry.js';
import { filterWarpRoutesIds } from './warp-utils.js';

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

  addChain(chain: UpdateChainParams): void {
    const currentChains = this.listRegistryContent().chains;
    if (currentChains[chain.chainName])
      throw new Error(`Chain ${chain.chainName} already exists in registry`);

    this.createOrUpdateChain(chain);
  }

  updateChain(chain: UpdateChainParams): void {
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

  getWarpRoute(routeId: string): WarpCoreConfig | null {
    return this.getWarpRoutesForIds([routeId])[0] || null;
  }

  getWarpDeployConfig(routeId: string): WarpRouteDeployConfig | null {
    return this.getWarpDeployConfigForIds([routeId])[0] || null;
  }

  /**
   * Retrieves a filtered map of the warp routes configs
   */
  getWarpRoutes(filter?: WarpRouteFilterParams): WarpRouteConfigMap {
    const warpRoutes = this.listRegistryContent().deployments.warpRoutes;
    const { ids: routeIds } = filterWarpRoutesIds(warpRoutes, filter);
    const configs = this.getWarpRoutesForIds(routeIds);
    const idsWithConfigs = routeIds.map((id, i): [WarpRouteId, WarpCoreConfig] => [id, configs[i]]);
    return Object.fromEntries(idsWithConfigs);
  }

  /**
   * Retrieves a map of all the warp routes deployment configs
   */
  getWarpDeployConfigs(filter?: WarpRouteFilterParams): WarpDeployConfigMap {
    const warpDeployConfig = this.listRegistryContent().deployments.warpDeployConfig;
    const { ids: routeIds } = filterWarpRoutesIds(warpDeployConfig, filter);
    const configs = this.getWarpDeployConfigForIds(routeIds);
    const idsWithConfigs = routeIds.map((id, i): [WarpRouteId, WarpRouteDeployConfig] => [
      id,
      configs[i],
    ]);
    return Object.fromEntries(idsWithConfigs);
  }

  abstract addWarpRoute(config: WarpCoreConfig, options?: AddWarpRouteConfigOptions): void;

  protected abstract createOrUpdateChain(chain: UpdateChainParams): void;

  protected abstract getWarpRoutesForIds(ids: WarpRouteId[]): WarpCoreConfig[];
  protected abstract getWarpDeployConfigForIds(ids: WarpRouteId[]): WarpRouteDeployConfig[];
}
