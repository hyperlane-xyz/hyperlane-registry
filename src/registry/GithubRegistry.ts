import type { Logger } from 'pino';
import { parse as yamlParse } from 'yaml';

import {
  ChainMetadataSchema,
  type ChainMap,
  type ChainMetadata,
  type ChainName,
} from '@hyperlane-xyz/sdk';

import { ChainAddresses, ChainAddressesSchema } from '../types.js';
import { BaseRegistry, CHAIN_FILE_REGEX } from './BaseRegistry.js';
import {
  RegistryType,
  type ChainFiles,
  type IRegistry,
  type RegistryContent,
} from './IRegistry.js';

const DEFAULT_REGISTRY = 'https://github.com/hyperlane-xyz/hyperlane-registry';

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
    super({ logger: options.logger });
    this.url = new URL(options.uri ?? DEFAULT_REGISTRY);
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
        const [_, chainName, fileName] = node.path.match(CHAIN_FILE_REGEX)!;
        chains[chainName] ??= {};
        // @ts-ignore allow dynamic key assignment
        chains[chainName][fileName] = this.getRawContentUrl(
          `${chainPath}/${chainName}/${fileName}.yaml`,
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
    if (this.metadataCache) return this.metadataCache;
    const chainMetadata: ChainMap<ChainMetadata> = {};
    const repoContents = await this.listRegistryContent();
    // TODO use concurrentMap here when utils package is updated
    for (const [chainName, chainFiles] of Object.entries(repoContents.chains)) {
      if (!chainFiles.metadata) continue;
      const response = await this.fetch(chainFiles.metadata);
      const data = await response.text();
      chainMetadata[chainName] = ChainMetadataSchema.parse(yamlParse(data));
    }
    return (this.metadataCache = chainMetadata);
  }

  async getChainMetadata(chainName: ChainName): Promise<ChainMetadata> {
    if (this.metadataCache?.[chainName]) return this.metadataCache[chainName];
    const url = this.getRawContentUrl(`${this.getChainsPath()}/${chainName}/metadata.yaml`);
    const response = await this.fetch(url);
    const data = await response.text();
    return ChainMetadataSchema.parse(yamlParse(data));
  }

  async getAddresses(): Promise<ChainMap<ChainAddresses>> {
    if (this.addressCache) return this.addressCache;
    const chainAddresses: ChainMap<ChainAddresses> = {};
    const repoContents = await this.listRegistryContent();
    // TODO use concurrentMap here when utils package is updated
    for (const [chainName, chainFiles] of Object.entries(repoContents.chains)) {
      if (!chainFiles.addresses) continue;
      const response = await this.fetch(chainFiles.addresses);
      const data = await response.text();
      chainAddresses[chainName] = ChainAddressesSchema.parse(yamlParse(data));
    }
    return (this.addressCache = chainAddresses);
  }

  async getChainAddresses(chainName: ChainName): Promise<ChainAddresses> {
    if (this.addressCache?.[chainName]) return this.addressCache[chainName];
    const url = this.getRawContentUrl(`${this.getChainsPath()}/${chainName}/addresses.yaml`);
    const response = await this.fetch(url);
    const data = await response.text();
    return ChainAddressesSchema.parse(yamlParse(data));
  }

  protected getRawContentUrl(path: string): string {
    return `https://raw.githubusercontent.com/${this.repoOwner}/${this.repoName}/${this.branch}/${path}`;
  }

  protected async fetch(url: string): Promise<Response> {
    this.logger.debug(`Fetching from github: ${url}`);
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch from github: ${response.status} ${response.statusText}`);
    return response;
  }
}
