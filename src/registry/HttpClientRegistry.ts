import {
  ChainMap,
  ChainMetadata,
  ChainName,
  WarpCoreConfig,
  WarpRouteDeployConfig,
} from '@hyperlane-xyz/sdk';
import { ChainAddresses, MaybePromise, WarpDeployConfigMap, WarpRouteConfigMap } from '../types.js';
import {
  IRegistry,
  RegistryContent,
  RegistryType,
  UpdateChainParams,
  WarpRouteFilterParams,
  AddWarpRouteConfigOptions,
} from './IRegistry.js';

export class HttpClientRegistry implements IRegistry {
  private baseUrl: string;
  public readonly type = RegistryType.Http;
  public readonly uri: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.uri = baseUrl;
  }

  getMetadata(): MaybePromise<ChainMap<ChainMetadata>> {
    return this.fetchJson<ChainMap<ChainMetadata>>('/metadata');
  }

  getAddresses(): MaybePromise<ChainMap<ChainAddresses>> {
    return this.fetchJson<ChainMap<ChainAddresses>>('/addresses');
  }

  getUri(_itemPath?: string): string {
    throw new Error('Method not implemented.');
  }

  listRegistryContent(): MaybePromise<RegistryContent> {
    return this.fetchJson<RegistryContent>('/list-registry-content');
  }

  getChains(): MaybePromise<Array<ChainName>> {
    return this.fetchJson<Array<ChainName>>('/chains');
  }

  getChainMetadata(chainName: ChainName): MaybePromise<ChainMetadata> {
    return this.fetchJson<ChainMetadata>(`/chain/${chainName}/metadata`);
  }

  updateChain(update: UpdateChainParams): MaybePromise<void> {
    return this.fetchJson<void>(`/chain/${update.chainName}/metadata`, {
      method: 'POST',
      body: JSON.stringify(update.metadata),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  getChainAddresses(chainName: ChainName): MaybePromise<ChainAddresses | null> {
    return this.fetchJson<ChainAddresses>(`/chain/${chainName}/addresses`);
  }

  getChainLogoUri(_chainName: ChainName): Promise<string | null> {
    throw new Error('Method not implemented.');
  }

  addChain(_chain: UpdateChainParams): MaybePromise<void> {
    throw new Error('Method not implemented.');
  }

  removeChain(_chain: ChainName): MaybePromise<void> {
    throw new Error('Method not implemented.');
  }

  getWarpRoute(routeId: string): MaybePromise<WarpCoreConfig | null> {
    return this.fetchJson<WarpCoreConfig | null>(`/warp-route/${encodeURIComponent(routeId)}`);
  }

  getWarpRoutes(_filter?: WarpRouteFilterParams): MaybePromise<WarpRouteConfigMap> {
    throw new Error('Method not implemented.');
  }

  addWarpRoute(_config: WarpCoreConfig): MaybePromise<void> {
    throw new Error('Method not implemented.');
  }

  getWarpDeployConfig(_routeId: string): MaybePromise<WarpRouteDeployConfig | null> {
    throw new Error('Method not implemented.');
  }

  getWarpDeployConfigs(): MaybePromise<WarpDeployConfigMap> {
    throw new Error('Method not implemented.');
  }

  addWarpRouteConfig(
    _config: WarpRouteDeployConfig,
    _options: AddWarpRouteConfigOptions,
  ): MaybePromise<void> {
    throw new Error('Method not implemented.');
  }

  merge(_otherRegistry: IRegistry): IRegistry {
    throw new Error('Method not implemented.');
  }

  private async fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
