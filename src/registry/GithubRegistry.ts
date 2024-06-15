import type { Logger } from 'pino';
import { parse as yamlParse } from 'yaml';

import type { ChainMap, ChainMetadata, ChainName, WarpCoreConfig } from '@hyperlane-xyz/sdk';

import {
  CHAIN_FILE_REGEX,
  DEFAULT_GITHUB_REGISTRY,
  GITHUB_FETCH_CONCURRENCY_LIMIT,
  WARP_ROUTE_CONFIG_FILE_REGEX,
} from '../consts.js';
import { ChainAddresses, WarpRouteConfigMap, WarpRouteId } from '../types.js';
import { concurrentMap, stripLeadingSlash } from '../utils.js';
import { BaseRegistry } from './BaseRegistry.js';
import {
  ChainFiles,
  IRegistry,
  RegistryContent,
  RegistryType,
  UpdateChainParams,
  WarpRouteFilterParams,
} from './IRegistry.js';
import { filterWarpRoutesIds, warpRouteConfigPathToId } from './warp-utils.js';

export interface GithubRegistryOptions {
  uri?: string;
  branch?: string;
  authToken?: string;
  logger?: Logger;
}

interface TreeNode {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  sha: string;
  url: string;
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

  constructor(options: GithubRegistryOptions = {}) {
    super({ uri: options.uri ?? DEFAULT_GITHUB_REGISTRY, logger: options.logger });
    this.url = new URL(this.uri);
    this.branch = options.branch ?? 'main';
    const pathSegments = this.url.pathname.split('/');
    if (pathSegments.length < 2) throw new Error('Invalid github url');
    this.repoOwner = pathSegments.at(-2)!;
    this.repoName = pathSegments.at(-1)!;
  }

  getUri(itemPath?: string): string {
    if (!itemPath) return super.getUri();
    return this.getRawContentUrl(itemPath);
  }

  async listRegistryContent(): Promise<RegistryContent> {
    if (this.listContentCache) return this.listContentCache;

    // This uses the tree API instead of the simpler directory list API because it
    // allows us to get a full view of all files in one request.
    const apiUrl = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/git/trees/${this.branch}?recursive=true`;
    const response = await this.fetch(apiUrl);
    const result = await response.json();
    const tree = result.tree as TreeNode[];

    const chainPath = this.getChainsPath();
    const chains: RegistryContent['chains'] = {};
    const warpRoutes: RegistryContent['deployments']['warpRoutes'] = {};
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
    }

    return (this.listContentCache = { chains, deployments: { warpRoutes } });
  }

  async getChains(): Promise<Array<ChainName>> {
    const repoContents = await this.listRegistryContent();
    return Object.keys(repoContents.chains);
  }

  async getMetadata(): Promise<ChainMap<ChainMetadata>> {
    if (this.metadataCache && this.isMetadataCacheFull) return this.metadataCache;
    const chainMetadata = await this.fetchChainFiles<ChainMetadata>('metadata');
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
    const chainAddresses = await this.fetchChainFiles<ChainAddresses>('addresses');
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

  async getWarpRoutes(filter?: WarpRouteFilterParams): Promise<WarpRouteConfigMap> {
    const warpRoutes = (await this.listRegistryContent()).deployments.warpRoutes;
    const { ids: routeIds, values: routeConfigUrls } = filterWarpRoutesIds(warpRoutes, filter);
    const configs = await this.fetchYamlFiles<WarpCoreConfig>(routeConfigUrls);
    const idsWithConfigs = routeIds.map((id, i): [WarpRouteId, WarpCoreConfig] => [id, configs[i]]);
    return Object.fromEntries(idsWithConfigs);
  }

  async addWarpRoute(_config: WarpCoreConfig): Promise<void> {
    throw new Error('TODO: Implement');
  }

  protected getRawContentUrl(path: string): string {
    path = stripLeadingSlash(path);
    return `https://raw.githubusercontent.com/${this.repoOwner}/${this.repoName}/${this.branch}/${path}`;
  }

  // Fetches all files of a particular type in parallel
  // Defaults to all known chains if chainNames is not provided
  protected async fetchChainFiles<T>(
    fileName: keyof ChainFiles,
    chainNames?: ChainName[],
  ): Promise<ChainMap<T>> {
    const repoContents = await this.listRegistryContent();
    chainNames ||= Object.keys(repoContents.chains);

    const fileUrls = chainNames.reduce<ChainMap<string>>((acc, chainName) => {
      const fileUrl = repoContents.chains[chainName][fileName];
      if (fileUrl) acc[chainName] = fileUrl;
      return acc;
    }, {});

    const results = await this.fetchYamlFiles<T>(Object.values(fileUrls));
    const chainNameWithResult = chainNames.map((chainName, i): [ChainName, T] => [
      chainName,
      results[i],
    ]);
    return Object.fromEntries(chainNameWithResult);
  }

  protected async fetchChainFile<T>(
    fileName: keyof ChainFiles,
    chainName: ChainName,
  ): Promise<T | null> {
    const results = await this.fetchChainFiles<T>(fileName, [chainName]);
    return results[chainName] ?? null;
  }

  protected fetchYamlFiles<T>(urls: string[]): Promise<T[]> {
    return concurrentMap(GITHUB_FETCH_CONCURRENCY_LIMIT, urls, (url) => this.fetchYamlFile<T>(url));
  }

  protected async fetchYamlFile<T>(url: string): Promise<T> {
    const response = await this.fetch(url);
    const data = await response.text();
    return yamlParse(data);
  }

  protected async fetch(url: string): Promise<Response> {
    this.logger.debug(`Fetching from github: ${url}`);
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch from github: ${response.status} ${response.statusText}`);
    return response;
  }
}
