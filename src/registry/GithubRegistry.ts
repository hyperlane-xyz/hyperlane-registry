import type { Logger } from 'pino';
import { parse } from 'yaml';

import { rootLogger } from '@hyperlane-xyz/utils';

import { ChainMap, ChainMetadata, ChainName } from '@hyperlane-xyz/sdk';

import { BaseRegistry } from './BaseRegistry.js';
import { ChainAddresses, ChainFiles, IRegistry, RegistryContent } from './IRegistry.js';

const DEFAULT_REGISTRY = 'https://github.com/hyperlane-xyz/hyperlane-registry';
const CHAIN_FILE_REGEX = /chains\/([a-z]+)\/([a-z]+)\.yaml/;

export interface GithubRegistryOptions {
  url?: string;
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
  public readonly url: URL;
  public readonly branch: string;
  public readonly repoOwner: string;
  public readonly repoName: string;

  constructor(options: GithubRegistryOptions = {}) {
    super({
      logger: options.logger ?? rootLogger.child({ module: 'GithubRegistry' }),
    });
    this.url = new URL(options.url ?? DEFAULT_REGISTRY);
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
    for (const [chainName, chainFiles] of Object.entries(repoContents.chains)) {
      if (!chainFiles.metadata) continue;
      const response = await this.fetch(chainFiles.metadata);
      const metadata = parse(await response.text()) as ChainMetadata;
      chainMetadata[chainName] = metadata;
    }
    return (this.metadataCache = chainMetadata);
  }

  async getChainMetadata(chainName: ChainName): Promise<ChainMetadata> {
    if (this.metadataCache?.[chainName]) return this.metadataCache[chainName];
    const url = this.getRawContentUrl(`${this.getChainsPath()}/${chainName}/metadata.yaml`);
    const response = await this.fetch(url);
    return parse(await response.text()) as ChainMetadata;
  }

  async getAddresses(): Promise<ChainMap<ChainAddresses>> {
    if (this.addressCache) return this.addressCache;
    const chainAddresses: ChainMap<ChainAddresses> = {};
    const repoContents = await this.listRegistryContent();
    for (const [chainName, chainFiles] of Object.entries(repoContents.chains)) {
      if (!chainFiles.addresses) continue;
      const response = await this.fetch(chainFiles.addresses);
      const addresses = parse(await response.text()) as ChainAddresses;
      chainAddresses[chainName] = addresses;
    }
    return (this.addressCache = chainAddresses);
  }

  async getChainAddresses(chainName: ChainName): Promise<ChainAddresses> {
    if (this.addressCache?.[chainName]) return this.addressCache[chainName];
    const url = this.getRawContentUrl(`${this.getChainsPath()}/${chainName}/addresses.yaml`);
    const response = await this.fetch(url);
    return parse(await response.text()) as ChainAddresses;
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
