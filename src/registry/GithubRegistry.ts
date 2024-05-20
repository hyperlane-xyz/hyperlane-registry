import type { Logger } from 'pino';
import { parse as yamlParse } from 'yaml';

import type { ChainMap, ChainMetadata, ChainName, WarpCoreConfig } from '@hyperlane-xyz/sdk';

import { DEFAULT_GITHUB_REGISTRY, GITHUB_FETCH_CONCURRENCY_LIMIT } from '../consts.js';
import { ChainAddresses } from '../types.js';
import { concurrentMap } from '../utils.js';
import { BaseRegistry, CHAIN_FILE_REGEX } from './BaseRegistry.js';
import {
  RegistryType,
  type ChainFiles,
  type IRegistry,
  type RegistryContent,
} from './IRegistry.js';

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

  async listRegistryContent(): Promise<RegistryContent> {
    if (this.listContentCache) return this.listContentCache;

    // This uses the tree API instead of the simpler directory list API because it
    // allows us to get a full view of all files in one request.
    const apiUrl = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/git/trees/${this.branch}?recursive=true`;
    const response = await this.fetch(apiUrl);
    const result = await response.json();
    const tree = result.tree as TreeNode[];

    const chainPath = this.getChainsPath();
    const chains: ChainMap<ChainFiles> = {};
    for (const node of tree) {
      if (CHAIN_FILE_REGEX.test(node.path)) {
        const [_, chainName, fileName, extension] = node.path.match(CHAIN_FILE_REGEX)!;
        chains[chainName] ??= {};
        // @ts-ignore allow dynamic key assignment
        chains[chainName][fileName] = this.getRawContentUrl(
          `${chainPath}/${chainName}/${fileName}.${extension}`,
        );
      }

      // TODO add handling for deployment artifact files here too
    }

    return (this.listContentCache = { chains, deployments: {} });
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
    const data = await this.fetchSingleChainFile<ChainMetadata>('metadata', chainName);
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
    const data = await this.fetchSingleChainFile<ChainAddresses>('addresses', chainName);
    if (!data) return null;
    this.addressCache = { ...this.addressCache, [chainName]: data };
    return data;
  }

  async addChain(_chains: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): Promise<void> {
    throw new Error('TODO: Implement');
  }
  async updateChain(_chains: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): Promise<void> {
    throw new Error('TODO: Implement');
  }
  async removeChain(_chains: ChainName): Promise<void> {
    throw new Error('TODO: Implement');
  }

  async addWarpRoute(_config: WarpCoreConfig): Promise<void> {
    throw new Error('TODO: Implement');
  }

  protected getRawContentUrl(path: string): string {
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

    const results = await concurrentMap(
      GITHUB_FETCH_CONCURRENCY_LIMIT,
      Object.entries(fileUrls),
      async ([chainName, fileUrl]): Promise<[ChainName, T]> => {
        const response = await this.fetch(fileUrl);
        const data = await response.text();
        return [chainName, yamlParse(data)];
      },
    );

    return Object.fromEntries(results);
  }

  protected async fetchSingleChainFile<T>(
    fileName: keyof ChainFiles,
    chainName: ChainName,
  ): Promise<T | null> {
    const results = await this.fetchChainFiles<T>(fileName, [chainName]);
    return results[chainName] ?? null;
  }

  protected async fetch(url: string): Promise<Response> {
    this.logger.debug(`Fetching from github: ${url}`);
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch from github: ${response.status} ${response.statusText}`);
    return response;
  }
}
