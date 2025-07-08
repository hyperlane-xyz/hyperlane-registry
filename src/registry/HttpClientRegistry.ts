import {
  ChainMap,
  ChainMetadata,
  ChainName,
  WarpCoreConfig,
  WarpRouteDeployConfig,
} from '@hyperlane-xyz/sdk';
import {
  ChainAddresses,
  MaybePromise,
  WarpDeployConfigMap,
  WarpRouteConfigMap,
  WarpRouteFilterParams,
} from '../types.js';
import {
  IRegistry,
  RegistryContent,
  RegistryType,
  UpdateChainParams,
  AddWarpRouteConfigOptions,
} from './IRegistry.js';

export class HttpError extends Error {
  public status: number;
  public body: any;

  constructor(message: string, status: number, body: any = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

export class HttpClientRegistry implements IRegistry {
  private baseUrl: string;
  public readonly type = RegistryType.Http;
  public readonly uri: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
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

  async getChainMetadata(chainName: ChainName): Promise<ChainMetadata | null> {
    try {
      return await this.fetchJson<ChainMetadata>(`/chain/${chainName}/metadata`);
    } catch (e) {
      if (e instanceof HttpError && e.status === 404) {
        return null;
      }
      throw e;
    }
  }

  async getChainAddresses(chainName: ChainName): Promise<ChainAddresses | null> {
    try {
      return await this.fetchJson<ChainAddresses>(`/chain/${chainName}/addresses`);
    } catch (e) {
      if (e instanceof HttpError && e.status === 404) {
        return null;
      }
      throw e;
    }
  }

  updateChain(update: UpdateChainParams): MaybePromise<void> {
    // TODO this should handle updating both metadata and addresses
    return this.fetchJson<void>(`/chain/${update.chainName}/metadata`, {
      method: 'POST',
      body: JSON.stringify(update.metadata),
      headers: {
        'Content-Type': 'application/json',
      },
    });
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
    return this.fetchJson<WarpCoreConfig | null>(`/warp-route/${routeId}`);
  }

  getWarpRoutes(filter?: WarpRouteFilterParams): MaybePromise<WarpRouteConfigMap> {
    const queryParams = new URLSearchParams();
    if (filter?.symbol) {
      queryParams.set('symbol', filter.symbol);
    }
    if (filter?.label) {
      queryParams.set('label', filter.label);
    }
    return this.fetchJson<WarpRouteConfigMap>(`/warp-routes?${queryParams.toString()}`);
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
    const requestOptions: RequestInit = { ...options };
    // Only add JSON content-type header if there's a body
    if (options.body) {
      requestOptions.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, requestOptions);

    // Handle successful requests that have no content to parse.
    if (response.status === 204) {
      return null as T;
    }

    if (!response.ok) {
      let errorBody: any = null;
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
      try {
        errorBody = await response.json();
        // Use the server's detailed error message if available
        if (errorBody && errorBody.message) {
          errorMessage = errorBody.message;
        }
      } catch (e) {
        // Ignore if error body isn't valid JSON, use statusText instead.
      }
      // Throw the structured error
      throw new HttpError(errorMessage, response.status, errorBody);
    }

    return response.json();
  }
}
