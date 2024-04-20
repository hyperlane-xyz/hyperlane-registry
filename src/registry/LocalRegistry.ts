import fs from 'fs';
import path from 'path';
import type { Logger } from 'pino';
import { parse as yamlParse } from 'yaml';

import { type ChainMap, type ChainMetadata, type ChainName } from '@hyperlane-xyz/sdk';

import { ChainAddresses, ChainAddressesSchema } from '../types.js';
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

  protected listFiles(dirPath: string): string[] {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    const filePaths = entries.map((entry) => {
      const fullPath = path.join(dirPath, entry.name);
      return entry.isDirectory() ? this.listFiles(fullPath) : fullPath;
    });

    return filePaths.flat();
  }
}
