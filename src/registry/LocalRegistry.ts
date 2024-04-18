import fs from 'fs';
import path from 'path';
import type { Logger } from 'pino';
import { parse as yamlParse } from 'yaml';

import type { ChainMap, ChainMetadata, ChainName } from '@hyperlane-xyz/sdk';

import { CHAIN_SCHEMA_REF } from '../consts.js';
import { ChainAddresses, ChainAddressesSchema } from '../types.js';
import { toYamlString } from '../utils.js';
import { BaseRegistry, CHAIN_FILE_REGEX } from './BaseRegistry.js';
import {
  RegistryType,
  type ChainFiles,
  type IRegistry,
  type RegistryContent,
} from './IRegistry.js';

export interface LocalRegistryOptions {
  uri: string;
  logger?: Logger;
}

export class LocalRegistry extends BaseRegistry implements IRegistry {
  public readonly type = RegistryType.Local;
  public readonly uri: string;

  constructor(options: LocalRegistryOptions) {
    super({ logger: options.logger });
    this.uri = options.uri;
  }

  listRegistryContent(): RegistryContent {
    if (this.listContentCache) return this.listContentCache;

    const chainFileList = this.listFiles(path.join(this.uri, this.getChainsPath()));
    const chains: ChainMap<ChainFiles> = {};
    for (const chainFilePath of chainFileList) {
      const matches = chainFilePath.match(CHAIN_FILE_REGEX);
      if (!matches) continue;
      const [_, chainName, fileName] = matches;
      chains[chainName] ??= {};
      // @ts-ignore allow dynamic key assignment
      chains[chainName][fileName] = chainFilePath;
    }

    // TODO add handling for deployment artifact files here too

    return (this.listContentCache = { chains, deployments: {} });
  }

  getChains(): Array<ChainName> {
    return Object.keys(this.listRegistryContent().chains);
  }

  getMetadata(): ChainMap<ChainMetadata> {
    if (this.metadataCache) return this.metadataCache;
    const chainMetadata: ChainMap<ChainMetadata> = {};
    const repoContents = this.listRegistryContent();
    for (const [chainName, chainFiles] of Object.entries(repoContents.chains)) {
      if (!chainFiles.metadata) continue;
      const data = fs.readFileSync(chainFiles.metadata, 'utf8');
      chainMetadata[chainName] = yamlParse(data);
    }
    return (this.metadataCache = chainMetadata);
  }

  getChainMetadata(chainName: ChainName): ChainMetadata {
    const metadata = this.getMetadata();
    if (!metadata[chainName])
      throw new Error(`Metadata not found in registry for chain: ${chainName}`);
    return metadata[chainName];
  }

  getAddresses(): ChainMap<ChainAddresses> {
    if (this.addressCache) return this.addressCache;
    const chainAddresses: ChainMap<ChainAddresses> = {};
    const repoContents = this.listRegistryContent();
    for (const [chainName, chainFiles] of Object.entries(repoContents.chains)) {
      if (!chainFiles.addresses) continue;
      const data = fs.readFileSync(chainFiles.addresses, 'utf8');
      chainAddresses[chainName] = ChainAddressesSchema.parse(yamlParse(data));
    }
    return (this.addressCache = chainAddresses);
  }

  getChainAddresses(chainName: ChainName): ChainAddresses {
    const addresses = this.getAddresses();
    if (!addresses[chainName])
      throw new Error(`Addresses not found in registry for chain: ${chainName}`);
    return addresses[chainName];
  }

  addChains(
    chains: Array<{ chainName: ChainName; metadata?: ChainMetadata; addresses?: ChainAddresses }>,
  ): void {
    const currentChains = this.listRegistryContent().chains;
    for (const chain of chains) {
      if (currentChains[chain.chainName])
        throw new Error(`Chain ${chain.chainName} already exists in registry`);
    }

    this.updateChains(chains);
  }

  updateChains(
    chains: Array<{ chainName: ChainName; metadata?: ChainMetadata; addresses?: ChainAddresses }>,
  ): void {
    for (const chain of chains) {
      if (!chain.metadata && !chain.addresses)
        throw new Error(
          `Chain ${chain.chainName} must have metadata or addresses, preferably both`,
        );
    }

    // Ensure caches are initialized and filled before making changes
    this.listRegistryContent();
    this.getMetadata();
    this.getAddresses();

    for (const chain of chains) {
      const chainName = chain.chainName;
      if (chain.metadata) {
        this.createChainFile(
          chainName,
          'metadata',
          chain.metadata,
          this.metadataCache!,
          CHAIN_SCHEMA_REF,
        );
      }
      if (chain.addresses) {
        this.createChainFile(chainName, 'addresses', chain.addresses, this.addressCache!);
      }
    }
  }

  removeChains(chains: Array<ChainName>): void {
    const currentChains = this.listRegistryContent().chains;
    for (const chainName of chains) {
      if (!currentChains[chainName])
        throw new Error(`Chain ${chainName} does not exist in registry`);
    }

    for (const chainName of chains) {
      this.removeFiles(Object.values(currentChains[chainName]));
      if (this.listContentCache?.chains[chainName]) delete this.listContentCache.chains[chainName];
      if (this.metadataCache?.[chainName]) delete this.metadataCache[chainName];
      if (this.addressCache?.[chainName]) delete this.addressCache[chainName];
    }
  }

  protected listFiles(dirPath: string): string[] {
    let entries = fs.readdirSync(dirPath, { withFileTypes: true });

    let filePaths = entries.map((entry) => {
      let fullPath = path.join(dirPath, entry.name);
      return entry.isDirectory() ? this.listFiles(fullPath) : fullPath;
    });

    return filePaths.flat();
  }

  protected createFile(file: { filePath: string; data: string }): void {
    const dirPath = path.dirname(file.filePath);
    if (!fs.existsSync(dirPath))
      fs.mkdirSync(dirPath, {
        recursive: true,
      });
    fs.writeFileSync(file.filePath, file.data);
  }

  protected createChainFile(
    chainName: ChainName,
    fileName: keyof ChainFiles,
    data: any,
    cache: ChainMap<any>,
    prefix?: string,
  ) {
    const filePath = path.join(this.uri, this.getChainsPath(), chainName, `${fileName}.yaml`);
    this.listContentCache!.chains[chainName] ||= {};
    this.listContentCache!.chains[chainName][fileName] = filePath;
    cache[chainName] = data;
    this.createFile({ filePath, data: toYamlString(data, prefix) });
  }

  protected removeFiles(filePaths: string[]): void {
    for (const filePath of filePaths) {
      fs.unlinkSync(filePath);
    }
    const parentDir = path.dirname(filePaths[0]);
    if (fs.readdirSync(parentDir).length === 0) {
      fs.rmdirSync(parentDir);
    }
  }
}
