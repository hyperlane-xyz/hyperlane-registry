import type { Logger } from 'pino';

import type {
  ChainMap,
  ChainMetadata,
  ChainName,
  SignerConfig,
  WarpCoreConfig,
  WarpRouteDeployConfig,
} from '@hyperlane-xyz/sdk';
import { SignerType } from '@hyperlane-xyz/sdk';

import type {
  ChainAddresses,
  MaybePromise,
  SignerConfigMap,
  SignerConfiguration,
  UpdateChainParams,
  WarpDeployConfigMap,
  WarpRouteConfigMap,
  WarpRouteFilterParams,
} from '../types.js';
import type {
  AddWarpRouteConfigOptions,
  IRegistry,
  IRegistryMethods,
  RegistryContent,
} from './IRegistry.js';
import { RegistryType } from './IRegistry.js';
import { MergedRegistry } from './MergedRegistry.js';

export interface FoundryKeystoreRegistryOptions {
  /**
   * URI in the format:
   * - foundry://accountName (uses default ~/.foundry/keystores path)
   * - foundry:///absolute/path/to/keystores/accountName
   *
   * The keystore file should be a JSON file encrypted with a password.
   */
  uri: string;
  /**
   * Optional signer name to expose this keystore as.
   * Defaults to 'default' if not specified.
   */
  signerName?: string;
  /**
   * Path to a file containing the keystore password.
   * This is the recommended approach for production use.
   */
  passwordFile?: string;
  /**
   * Environment variable containing the keystore password directly.
   * Not recommended for production - use passwordFile or ETH_PASSWORD instead.
   */
  passwordEnvVar?: string;
  logger?: Logger;
}

/**
 * Parses a Foundry keystore registry URI.
 *
 * Supported formats:
 * - foundry://accountName - Uses default ~/.foundry/keystores path
 * - foundry:///absolute/path/to/keystores/accountName - Uses custom keystore path
 *
 * @returns { accountName, keystorePath? } or null if invalid
 */
export function parseFoundryKeystoreUri(
  uri: string,
): { accountName: string; keystorePath?: string } | null {
  if (!uri.startsWith('foundry://')) return null;

  const path = uri.slice('foundry://'.length);
  if (!path || path === '/') {
    return null;
  }

  // If path starts with /, it's an absolute path
  if (path.startsWith('/')) {
    // Format: foundry:///absolute/path/to/keystores/accountName
    const lastSlash = path.lastIndexOf('/');
    if (lastSlash === 0) {
      // Just foundry:///accountName - invalid, need directory
      return null;
    }
    const keystorePath = path.slice(0, lastSlash);
    const accountName = path.slice(lastSlash + 1);
    if (!accountName) return null;
    return { accountName, keystorePath };
  }

  // Format: foundry://accountName (uses default path)
  // No slashes allowed in simple format
  if (path.includes('/')) {
    return null;
  }

  return { accountName: path };
}

/**
 * A specialized registry that provides signer configuration from a Foundry keystore.
 *
 * This registry only implements signer-related methods. All other registry methods
 * (chains, addresses, warp routes) return empty/null values.
 *
 * URI formats:
 * - foundry://accountName - Uses default ~/.foundry/keystores path
 * - foundry:///absolute/path/to/keystores/accountName - Uses custom keystore path
 *
 * The keystore file should be a Foundry-compatible encrypted JSON keystore.
 *
 * Password resolution (in order):
 * 1. passwordFile option - direct path to password file
 * 2. passwordEnvVar option - env var containing the password directly
 * 3. ETH_PASSWORD env var - Foundry standard, path to password file
 *
 * Example usage:
 * ```typescript
 * // Option 1: Use ETH_PASSWORD (Foundry standard)
 * // echo "my-password" > ~/.keystore-password
 * // export ETH_PASSWORD=~/.keystore-password
 *
 * const registry = new FoundryKeystoreRegistry({
 *   uri: 'foundry://deployer',
 * });
 *
 * // Option 2: Specify password file directly
 * const registry = new FoundryKeystoreRegistry({
 *   uri: 'foundry://deployer',
 *   passwordFile: '/path/to/password-file',
 * });
 *
 * // Get the signer config (doesn't decrypt yet)
 * const signer = await registry.getSigner('deployer');
 * // { type: 'foundryKeystore', accountName: 'deployer' }
 *
 * // Use SignerFactory to create the actual signer (decrypts keystore)
 * const ethSigner = await SignerFactory.createSigner(signer, provider);
 * ```
 */
export class FoundryKeystoreRegistry implements IRegistry {
  public readonly type = RegistryType.Partial;
  public readonly uri: string;
  protected readonly logger: Logger;

  private readonly accountName: string;
  private readonly keystorePath?: string;
  private readonly signerName: string;
  private readonly passwordFile?: string;
  private readonly passwordEnvVar?: string;

  /**
   * Methods not implemented by this registry.
   * This registry only provides signer configuration.
   */
  public readonly unimplementedMethods = new Set<IRegistryMethods>([
    'addChain',
    'updateChain',
    'removeChain',
    'addWarpRoute',
    'addWarpRouteConfig',
    'getChainLogoUri',
  ]);

  constructor(options: FoundryKeystoreRegistryOptions) {
    this.uri = options.uri;
    // @ts-ignore forcing in to avoid a @hyperlane-xyz/utils dependency
    this.logger = options.logger || console;
    this.signerName = options.signerName ?? 'default';
    this.passwordFile = options.passwordFile;
    this.passwordEnvVar = options.passwordEnvVar;

    const parsed = parseFoundryKeystoreUri(options.uri);
    if (!parsed) {
      throw new Error(
        `Invalid Foundry keystore registry URI: ${options.uri}. ` +
          `Expected format: foundry://accountName or foundry:///path/to/keystores/accountName`,
      );
    }

    this.accountName = parsed.accountName;
    this.keystorePath = parsed.keystorePath;
  }

  getUri(itemPath?: string): string {
    return itemPath ? `${this.uri}/${itemPath}` : this.uri;
  }

  // ============================================================
  // Signer methods - these are the only methods that return data
  // ============================================================

  /**
   * Returns the signer configuration for this Foundry keystore.
   * The configuration contains a single signer that references the keystore file.
   */
  getSignerConfiguration(): SignerConfiguration {
    return {
      signers: {
        [this.signerName]: this.buildSignerConfig(),
      },
      defaults: {
        default: { ref: this.signerName },
      },
    };
  }

  /**
   * Returns all signers (just the one Foundry keystore signer)
   */
  getSigners(): SignerConfigMap {
    return {
      [this.signerName]: this.buildSignerConfig(),
    };
  }

  /**
   * Get a specific signer by name
   */
  getSigner(id: string): SignerConfig | null {
    if (id === this.signerName) {
      return this.buildSignerConfig();
    }
    return null;
  }

  /**
   * Get the default signer (always returns the Foundry keystore signer)
   */
  getDefaultSigner(_chainName?: ChainName): SignerConfig {
    return this.buildSignerConfig();
  }

  private buildSignerConfig(): SignerConfig {
    const config: SignerConfig = {
      type: SignerType.FOUNDRY_KEYSTORE,
      accountName: this.accountName,
    };

    if (this.keystorePath) {
      (config as any).keystorePath = this.keystorePath;
    }

    if (this.passwordFile) {
      (config as any).passwordFile = this.passwordFile;
    }

    if (this.passwordEnvVar) {
      (config as any).passwordEnvVar = this.passwordEnvVar;
    }

    return config;
  }

  // ============================================================
  // Chain methods - return empty/null (not supported)
  // ============================================================

  listRegistryContent(): RegistryContent {
    return {
      chains: {},
      deployments: {
        warpRoutes: {},
        warpDeployConfig: {},
      },
    };
  }

  getChains(): ChainName[] {
    return [];
  }

  getMetadata(): ChainMap<ChainMetadata> {
    return {};
  }

  getChainMetadata(_chainName: ChainName): ChainMetadata | null {
    return null;
  }

  getAddresses(): ChainMap<ChainAddresses> {
    return {};
  }

  getChainAddresses(_chainName: ChainName): ChainAddresses | null {
    return null;
  }

  async getChainLogoUri(_chainName: ChainName): Promise<string | null> {
    return null;
  }

  addChain(_chain: UpdateChainParams): MaybePromise<void> {
    throw new Error('FoundryKeystoreRegistry does not support addChain');
  }

  updateChain(_chain: UpdateChainParams): MaybePromise<void> {
    throw new Error('FoundryKeystoreRegistry does not support updateChain');
  }

  removeChain(_chain: ChainName): MaybePromise<void> {
    throw new Error('FoundryKeystoreRegistry does not support removeChain');
  }

  // ============================================================
  // Warp route methods - return empty/null (not supported)
  // ============================================================

  getWarpRoute(_routeId: string): WarpCoreConfig | null {
    return null;
  }

  getWarpRoutes(_filter?: WarpRouteFilterParams): WarpRouteConfigMap {
    return {};
  }

  addWarpRoute(_config: WarpCoreConfig, _options?: AddWarpRouteConfigOptions): MaybePromise<void> {
    throw new Error('FoundryKeystoreRegistry does not support addWarpRoute');
  }

  addWarpRouteConfig(
    _config: WarpRouteDeployConfig,
    _options: AddWarpRouteConfigOptions,
  ): MaybePromise<void> {
    throw new Error('FoundryKeystoreRegistry does not support addWarpRouteConfig');
  }

  getWarpDeployConfig(_routeId: string): WarpRouteDeployConfig | null {
    return null;
  }

  getWarpDeployConfigs(_filter?: WarpRouteFilterParams): WarpDeployConfigMap {
    return {};
  }

  // ============================================================
  // Merge support
  // ============================================================

  merge(otherRegistry: IRegistry): IRegistry {
    return new MergedRegistry({ registries: [this, otherRegistry], logger: this.logger });
  }
}
