import { ChainMap, ChainMetadata, ChainName, WarpCoreConfig } from '@hyperlane-xyz/sdk';
import { ChainAddresses, MaybePromise, WarpRouteConfigMap } from '../types.js';
import {
  IRegistry,
  RegistryContent,
  RegistryType,
  UpdateChainParams,
  WarpRouteFilterParams,
} from './IRegistry.js';

export class HttpClientRegistry implements IRegistry {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  getChainMetadata(chainName: ChainName): MaybePromise<ChainMetadata> {
    return this.fetchJson<ChainMetadata>(`/metadata/${chainName}`);
  }

  updateChain(update: UpdateChainParams): MaybePromise<void> {
    return this.fetchJson<void>(`/metadata/${update.chainName}`, {
      method: 'POST',
      body: JSON.stringify(update.metadata),
    });
  }

  get type(): RegistryType {
    throw new Error('Method not implemented.');
  }

  get uri(): string {
    throw new Error('Method not implemented.');
  }

  getUri(itemPath?: string): string {
    throw new Error('Method not implemented.');
  }
  listRegistryContent(): MaybePromise<RegistryContent> {
    throw new Error('Method not implemented.');
  }
  getChains(): MaybePromise<Array<ChainName>> {
    throw new Error('Method not implemented.');
  }
  getMetadata(): MaybePromise<ChainMap<ChainMetadata>> {
    throw new Error('Method not implemented.');
  }
  getAddresses(): MaybePromise<ChainMap<ChainAddresses>> {
    throw new Error('Method not implemented.');
  }
  getChainAddresses(chainName: ChainName): MaybePromise<ChainAddresses | null> {
    throw new Error('Method not implemented.');
  }
  getChainLogoUri(chainName: ChainName): Promise<string | null> {
    throw new Error('Method not implemented.');
  }
  addChain(chain: UpdateChainParams): MaybePromise<void> {
    throw new Error('Method not implemented.');
  }
  removeChain(chain: ChainName): MaybePromise<void> {
    throw new Error('Method not implemented.');
  }
  getWarpRoute(routeId: string): MaybePromise<WarpCoreConfig | null> {
    throw new Error('Method not implemented.');
  }
  getWarpRoutes(filter?: WarpRouteFilterParams): MaybePromise<WarpRouteConfigMap> {
    throw new Error('Method not implemented.');
  }
  addWarpRoute(config: WarpCoreConfig): MaybePromise<void> {
    throw new Error('Method not implemented.');
  }
  merge(otherRegistry: IRegistry): IRegistry {
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
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }
}
