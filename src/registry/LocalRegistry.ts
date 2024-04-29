import fs from 'fs';
import path from 'path';
import type { Logger } from 'pino';
import { parse as yamlParse } from 'yaml';

import type { ChainMap, ChainMetadata, ChainName, WarpCoreConfig } from '@hyperlane-xyz/sdk';

import { SCHEMA_REF } from '../consts.js';
import { ChainAddresses, ChainAddressesSchema } from '../types.js';
import { toYamlString } from '../utils.js';
import { BaseRegistry, CHAIN_FILE_REGEX } from './BaseRegistry.js';
import {
  RegistryType,
  type ChainFiles,
  type IRegistry,
  type RegistryContent,
} from './IRegistry.js';
import { warpConfigToWarpAddresses } from './warp-utils.js';

export interface LocalRegistryOptions {
  uri: string;
  logger?: Logger;
}

export class LocalRegistry extends BaseRegistry implements IRegistry {
  public readonly type = RegistryType.Local;

  constructor(options: LocalRegistryOptions) {
    super(options);
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

  addChain(chain: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): void {
    const currentChains = this.listRegistryContent().chains;
    if (currentChains[chain.chainName])
      throw new Error(`Chain ${chain.chainName} already exists in registry`);

    this.createOrUpdateChain(chain);
  }

  updateChain(chain: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): void {
    const currentChains = this.listRegistryContent();
    if (!currentChains.chains[chain.chainName]) {
      this.logger.debug(`Chain ${chain.chainName} not found in registry, adding it now`);
    }
    this.createOrUpdateChain(chain);
  }

  removeChain(chainName: ChainName): void {
    const currentChains = this.listRegistryContent().chains;
    if (!currentChains[chainName]) throw new Error(`Chain ${chainName} does not exist in registry`);

    this.removeFiles(Object.values(currentChains[chainName]));
    if (this.listContentCache?.chains[chainName]) delete this.listContentCache.chains[chainName];
    if (this.metadataCache?.[chainName]) delete this.metadataCache[chainName];
    if (this.addressCache?.[chainName]) delete this.addressCache[chainName];
  }

  protected listFiles(dirPath: string): string[] {
    if (!fs.existsSync(dirPath)) return [];

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const filePaths = entries.map((entry) => {
      const fullPath = path.join(dirPath, entry.name);
      return entry.isDirectory() ? this.listFiles(fullPath) : fullPath;
    });

    return filePaths.flat();
  }

  addWarpRoute(config: WarpCoreConfig): void {
    let { configPath, addressesPath } = this.getWarpArtifactsPaths(config);

    configPath = path.join(this.uri, configPath);
    this.createFile({ filePath: configPath, data: toYamlString(config, SCHEMA_REF) });

    addressesPath = path.join(this.uri, addressesPath);
    const addresses = warpConfigToWarpAddresses(config);
    this.createFile({ filePath: addressesPath, data: toYamlString(addresses) });
  }

  protected createOrUpdateChain(chain: {
    chainName: ChainName;
    metadata?: ChainMetadata;
    addresses?: ChainAddresses;
  }): void {
    if (!chain.metadata && !chain.addresses)
      throw new Error(`Chain ${chain.chainName} must have metadata or addresses, preferably both`);

    const currentChains = this.listRegistryContent();
    if (!currentChains.chains[chain.chainName]) {
      this.logger.debug(`Chain ${chain.chainName} not found in registry, adding it now`);
    }

    if (chain.metadata) {
      this.createChainFile(
        chain.chainName,
        'metadata',
        chain.metadata,
        this.getMetadata(),
        SCHEMA_REF,
      );
    }
    if (chain.addresses) {
      this.createChainFile(chain.chainName, 'addresses', chain.addresses, this.getAddresses());
    }
  }

  protected createChainFile(
    chainName: ChainName,
    fileName: keyof ChainFiles,
    data: any,
    cache: ChainMap<any>,
    prefix?: string,
  ) {
    const filePath = path.join(this.uri, this.getChainsPath(), chainName, `${fileName}.yaml`);
    const currentChains = this.listRegistryContent().chains;
    currentChains[chainName] ||= {};
    currentChains[chainName][fileName] = filePath;
    cache[chainName] = data;
    this.createFile({ filePath, data: toYamlString(data, prefix) });
  }

  protected createFile(file: { filePath: string; data: string }): void {
    const dirPath = path.dirname(file.filePath);
    if (!fs.existsSync(dirPath))
      fs.mkdirSync(dirPath, {
        recursive: true,
      });
    fs.writeFileSync(file.filePath, file.data);
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
