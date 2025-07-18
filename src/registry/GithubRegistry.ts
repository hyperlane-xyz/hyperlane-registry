import type { Logger } from 'pino';
import { parse as yamlParse } from 'yaml';
import JSZip from 'jszip';

import type {
  ChainMap,
  ChainMetadata,
  ChainName,
  WarpCoreConfig,
  WarpRouteDeployConfig,
} from '@hyperlane-xyz/sdk';

import {
  CHAIN_FILE_REGEX,
  DEFAULT_GITHUB_REGISTRY,
  GITHUB_FETCH_CONCURRENCY_LIMIT,
  WARP_ROUTE_CONFIG_FILE_REGEX,
  WARP_ROUTE_DEPLOY_FILE_REGEX,
} from '../consts.js';
import {
  ChainAddresses,
  UpdateChainParams,
  WarpDeployConfigMap,
  WarpRouteConfigMap,
  WarpRouteFilterParams,
  WarpRouteId,
} from '../types.js';
import { concurrentMap, parseGitHubPath, stripLeadingSlash } from '../utils.js';
import { BaseRegistry } from './BaseRegistry.js';
import {
  AddWarpRouteConfigOptions,
  ChainFiles,
  IRegistry,
  IRegistryMethods,
  RegistryContent,
  RegistryType,
} from './IRegistry.js';
import {
  filterWarpRoutesIds,
  warpRouteConfigPathToId,
  warpRouteDeployConfigPathToId,
} from './warp-utils.js';

export interface GithubRegistryOptions {
  uri?: string;
  proxyUrl?: string;
  branch?: string;
  authToken?: string;
  logger?: Logger;
  /**
   * Override browser detection. Defaults to true if running in a browser environment.
   */
  isBrowser?: boolean;
}

interface TreeNode {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  sha: string;
  url: string;
}

type GithubRateResponse = {
  resources: {
    core: {
      limit: number;
      used: number;
      remaining: number;
      reset: number;
    };
  };
};

export const GITHUB_API_URL = 'https://api.github.com';
export const GITHUB_API_VERSION = '2022-11-28';

// Custom error to capture HTTP status codes for GitHub fetch failures
export class GithubFetchError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  constructor(response: Response) {
    super(`Failed to fetch from github: ${response.status} ${response.statusText}`);
    this.name = 'GithubFetchError';
    this.status = response.status; // numeric HTTP status
    this.statusText = response.statusText;
  }
}

/**
 * A registry that uses a github repository as its data source.
 * Reads are performed via the github API and github's raw content URLs.
 * Writes are not yet supported (TODO)
 */
export class GithubRegistry extends BaseRegistry implements IRegistry {
  public readonly type = RegistryType.Github;
  public readonly url: URL;
  public readonly branch: string;
  public readonly repoOwner: string;
  public readonly repoName: string;
  public readonly proxyUrl: string | undefined;
  private readonly authToken: string | undefined;
  /** True when running in a browser environment (overridable via options). */
  private readonly isBrowser: boolean;
  // In-memory cache of archive file entries (relative path -> content as ArrayBuffer)
  private archiveEntries?: Map<string, ArrayBuffer>;
  // Promise tracking an in-flight archive download/unpack to dedupe parallel calls
  private archiveEntriesPromise?: Promise<void>;

  public readonly unimplementedMethods = new Set<IRegistryMethods>([
    'addChain',
    'updateChain',
    'removeChain',
    'addWarpRoute',
    'addWarpRouteConfig',
  ]);

  private readonly baseApiHeaders: Record<string, string> = {
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
  };

  constructor(options: GithubRegistryOptions = {}) {
    super({ uri: options.uri ?? DEFAULT_GITHUB_REGISTRY, logger: options.logger });
    this.url = new URL(this.uri);

    const { repoOwner, repoName, repoBranch } = parseGitHubPath(this.uri);

    this.repoOwner = repoOwner;
    this.repoName = repoName;
    if (options.branch && repoBranch) throw new Error('Branch is set in both options and url.');

    this.branch = options.branch ?? repoBranch ?? 'main';
    this.proxyUrl = options.proxyUrl;
    this.authToken = options.authToken;
    this.isBrowser =
      options.isBrowser !== undefined ? options.isBrowser : typeof window !== 'undefined';
  }

  getUri(itemPath?: string): string {
    if (!itemPath) return super.getUri();
    return this.getRawContentUrl(itemPath);
  }

  async listRegistryContent(): Promise<RegistryContent> {
    if (this.listContentCache) return this.listContentCache;

    // This uses the tree API instead of the simpler directory list API because it
    // allows us to get a full view of all files in one request.
    const apiUrl = await this.getApiUrl();
    const response = await this.fetch(apiUrl);
    const result = await response.json();
    const tree = result.tree as TreeNode[];

    const chainPath = this.getChainsPath();
    const chains: RegistryContent['chains'] = {};
    const warpRoutes: RegistryContent['deployments']['warpRoutes'] = {};
    const warpDeployConfig: RegistryContent['deployments']['warpDeployConfig'] = {};
    for (const node of tree) {
      if (CHAIN_FILE_REGEX.test(node.path)) {
        const [_, chainName, fileName, extension] = node.path.match(CHAIN_FILE_REGEX)!;
        chains[chainName] ??= {};
        // @ts-ignore allow dynamic key assignment
        chains[chainName][fileName] = this.getRawContentUrl(
          `${chainPath}/${chainName}/${fileName}.${extension}`,
        );
      }

      if (WARP_ROUTE_CONFIG_FILE_REGEX.test(node.path)) {
        const routeId = warpRouteConfigPathToId(node.path);
        warpRoutes[routeId] = this.getRawContentUrl(node.path);
      }

      if (WARP_ROUTE_DEPLOY_FILE_REGEX.test(node.path)) {
        const routeId = warpRouteDeployConfigPathToId(node.path);
        warpDeployConfig[routeId] = this.getRawContentUrl(node.path);
      }
    }

    return (this.listContentCache = { chains, deployments: { warpRoutes, warpDeployConfig } });
  }

  async getChains(): Promise<Array<ChainName>> {
    const repoContents = await this.listRegistryContent();
    return Object.keys(repoContents.chains);
  }

  async getMetadata(): Promise<ChainMap<ChainMetadata>> {
    if (this.metadataCache && this.isMetadataCacheFull) return this.metadataCache;
    const combinedDataUrl = this.getRawContentUrl(`${this.getChainsPath()}/metadata.yaml`);
    const chainMetadata = await this.fetchYamlFile<ChainMap<ChainMetadata>>(combinedDataUrl);
    this.isMetadataCacheFull = true;
    return (this.metadataCache = chainMetadata);
  }

  async getChainMetadata(chainName: ChainName): Promise<ChainMetadata | null> {
    if (this.metadataCache?.[chainName]) return this.metadataCache[chainName];
    const data = await this.fetchChainFile<ChainMetadata>('metadata', chainName);
    if (!data) return null;
    this.metadataCache = { ...this.metadataCache, [chainName]: data };
    return data;
  }

  async getAddresses(): Promise<ChainMap<ChainAddresses>> {
    if (this.addressCache && this.isAddressCacheFull) return this.addressCache;
    const combinedDataUrl = this.getRawContentUrl(`${this.getChainsPath()}/addresses.yaml`);
    const chainAddresses = await this.fetchYamlFile<ChainMap<ChainAddresses>>(combinedDataUrl);
    this.isAddressCacheFull = true;
    return (this.addressCache = chainAddresses);
  }

  async getChainAddresses(chainName: ChainName): Promise<ChainAddresses | null> {
    if (this.addressCache?.[chainName]) return this.addressCache[chainName];
    const data = await this.fetchChainFile<ChainAddresses>('addresses', chainName);
    if (!data) return null;
    this.addressCache = { ...this.addressCache, [chainName]: data };
    return data;
  }

  async addChain(_chains: UpdateChainParams): Promise<void> {
    throw new Error('TODO: Implement');
  }
  async updateChain(_chains: UpdateChainParams): Promise<void> {
    throw new Error('TODO: Implement');
  }
  async removeChain(_chains: ChainName): Promise<void> {
    throw new Error('TODO: Implement');
  }

  async getWarpRoute(routeId: string): Promise<WarpCoreConfig | null> {
    const repoContents = await this.listRegistryContent();
    const routeConfigUrl = repoContents.deployments.warpRoutes[routeId];
    if (!routeConfigUrl) return null;
    return this.fetchYamlFile(routeConfigUrl);
  }

  async getWarpDeployConfig(routeId: string): Promise<WarpRouteDeployConfig | null> {
    const repoContents = await this.listRegistryContent();
    const routeConfigUrl = repoContents.deployments.warpDeployConfig[routeId];
    if (!routeConfigUrl) return null;
    return this.fetchYamlFile(routeConfigUrl);
  }

  async getWarpRoutes(filter?: WarpRouteFilterParams): Promise<WarpRouteConfigMap> {
    if (this.warpRouteCache && this.isWarpRouteCacheFull) {
      const { idMap: filteredWarpRouteConfigs } = filterWarpRoutesIds(this.warpRouteCache, filter);
      return filteredWarpRouteConfigs;
    }
    const combinedDataUrl = this.getRawContentUrl(
      `${this.getWarpRoutesPath()}/warpRouteConfigs.yaml`,
    );
    const warpRouteConfigs = await this.fetchYamlFile<WarpRouteConfigMap>(combinedDataUrl);
    this.isWarpRouteCacheFull = true;
    this.warpRouteCache = warpRouteConfigs;
    const { idMap: filteredWarpRouteConfigs } = filterWarpRoutesIds(warpRouteConfigs, filter);
    return filteredWarpRouteConfigs;
  }

  async getWarpDeployConfigs(filter?: WarpRouteFilterParams): Promise<WarpDeployConfigMap> {
    const { warpDeployConfig } = (await this.listRegistryContent()).deployments;
    const { ids: routeIds, values: routeConfigUrls } = filterWarpRoutesIds(
      warpDeployConfig,
      filter,
    );
    return this.readConfigs(routeIds, routeConfigUrls);
  }

  protected async readConfigs<ConfigMap>(
    routeIds: string[],
    routeConfigUrls: string[],
  ): Promise<Record<string, ConfigMap>> {
    const configs = await this.fetchYamlFiles<ConfigMap>(routeConfigUrls);
    const idsWithConfigs = routeIds.map((id, i): [WarpRouteId, ConfigMap] => [id, configs[i]]);
    return Object.fromEntries(idsWithConfigs);
  }

  async addWarpRoute(_config: WarpCoreConfig): Promise<void> {
    throw new Error('TODO: Implement');
  }

  async addWarpRouteConfig(
    _config: WarpRouteDeployConfig,
    _options: AddWarpRouteConfigOptions,
  ): Promise<void> {
    throw new Error('TODO: Implement');
  }

  public async getApiUrl(): Promise<string> {
    const { remaining, reset } = await this.getApiRateLimit();
    let apiHost = GITHUB_API_URL;
    if (remaining === 0) {
      if (!this.proxyUrl)
        throw new Error(`Github API rate remaining: ${remaining}, limit reset at ${reset}.`);
      apiHost = this.proxyUrl;
    }
    return `${apiHost}/repos/${this.repoOwner}/${this.repoName}/git/trees/${this.branch}?recursive=true`;
  }

  public async getApiRateLimit(): Promise<GithubRateResponse['resources']['core']> {
    const response = await this.fetch(`${GITHUB_API_URL}/rate_limit`);
    const { resources } = (await response.json()) as GithubRateResponse;
    return resources.core;
  }

  protected getRawContentUrl(path: string): string {
    path = stripLeadingSlash(path);
    return `https://raw.githubusercontent.com/${this.repoOwner}/${this.repoName}/${this.branch}/${path}`;
  }

  protected async fetchChainFile<T>(
    fileName: keyof ChainFiles,
    chainName: ChainName,
  ): Promise<T | null> {
    const repoContents = await this.listRegistryContent();
    const fileUrl = repoContents.chains[chainName]?.[fileName];
    if (!fileUrl) return null;
    return this.fetchYamlFile<T>(fileUrl);
  }

  protected fetchYamlFiles<T>(urls: string[]): Promise<T[]> {
    return concurrentMap(GITHUB_FETCH_CONCURRENCY_LIMIT, urls, (url) => this.fetchYamlFile<T>(url));
  }

  /**
   * Returns an array of URLs to download the repository zip archive.
   * If authToken is set, returns the GitHub API zipball endpoint URL only.
   * Otherwise returns public archive URLs for branch, tag, and commit-SHA fallbacks.
   */
  protected async getArchiveDownloadUrls(): Promise<string[]> {
    if (this.authToken) {
      const apiUrl = await this.getApiUrl();
      const origin = new URL(apiUrl).origin;
      return [`${origin}/repos/${this.repoOwner}/${this.repoName}/zipball/${this.branch}`];
    }
    const base = `https://github.com/${this.repoOwner}/${this.repoName}/archive`;
    return [
      `${base}/refs/heads/${this.branch}.zip`,
      `${base}/refs/tags/${this.branch}.zip`,
      `${base}/${this.branch}.zip`,
    ];
  }

  /**
   * Ensure the repository archive is downloaded and entries are cached in memory.
   */
  protected ensureArchiveEntries(): Promise<void> {
    if (this.archiveEntries) return Promise.resolve();
    if (this.archiveEntriesPromise) return this.archiveEntriesPromise;
    // Kick off a single inflight download/unpack
    this.archiveEntriesPromise = (async () => {
      try {
        // Try each archive URL in order, but only fallback on 404 Not Found
        const archiveUrls = await this.getArchiveDownloadUrls();
        let responseBuf: ArrayBuffer | undefined;
        const errors: string[] = [];
        for (const url of archiveUrls) {
          try {
            const resp = await this.fetch(url);
            responseBuf = await resp.arrayBuffer();
            break;
          } catch (err: any) {
            // Retry only on 404 Not Found errors
            if (err instanceof GithubFetchError && err.status === 404) {
              errors.push(`${url}: ${err.status} ${err.statusText}`);
              continue;
            }
            // Propagate other errors immediately
            throw err;
          }
        }
        if (!responseBuf) {
          throw new Error(
            `Failed to download archive for ref ${this.branch}. ` +
              `Tried URLs: ${archiveUrls.join(', ')}. ` +
              `Errors: ${errors.join('; ')}`,
          );
        }
        const zip = await JSZip.loadAsync(responseBuf);
        const entries = new Map<string, ArrayBuffer>();
        for (const [filePath, zipEntry] of Object.entries(zip.files)) {
          if (zipEntry.dir) continue;
          const parts = filePath.split('/');
          // Remove the top-level folder (owner-repo-sha)
          parts.shift();
          const relativePath = parts.join('/');
          // Only cache files under 'chains/' or 'deployments/'
          if (!relativePath.startsWith('chains/') && !relativePath.startsWith('deployments/'))
            continue;
          const decompressedBuf = await zipEntry.async('arraybuffer');
          entries.set(relativePath, decompressedBuf);
        }
        this.archiveEntries = entries;
      } catch (err) {
        // Reset on failure to allow retry
        this.archiveEntriesPromise = undefined;
        throw err;
      }
    })();
    return this.archiveEntriesPromise;
  }

  /**
   * Fetch a YAML file, using in-memory archive if available for raw content paths.
   */
  protected async fetchYamlFile<T>(url: string): Promise<T> {
    const rawBase = `https://raw.githubusercontent.com/${this.repoOwner}/${this.repoName}/${this.branch}/`;
    if (!this.isBrowser && url.startsWith(rawBase)) {
      await this.ensureArchiveEntries();
      const relativePath = url.substring(rawBase.length);
      const dataBuf = this.archiveEntries?.get(relativePath);
      if (!dataBuf) throw new Error(`File not found in archive: ${relativePath}`);
      const data = new TextDecoder('utf-8').decode(dataBuf);
      return yamlParse(data);
    }
    // Fallback to network fetch for non-raw URLs
    const response = await this.fetch(url);
    const data = await response.text();
    return yamlParse(data);
  }

  protected async fetch(url: string): Promise<Response> {
    this.logger.debug(`Fetching from github: ${url}`);
    const isGithubApiRequest = url.startsWith(GITHUB_API_URL);
    const headers =
      isGithubApiRequest && !!this.authToken
        ? { ...this.baseApiHeaders, Authorization: `Bearer ${this.authToken}` }
        : undefined;
    const response = await fetch(url, {
      headers,
    });
    if (!response.ok) {
      // Throw custom error with status code for callers to inspect
      throw new GithubFetchError(response);
    }
    return response;
  }
}
