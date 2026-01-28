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

export interface GCPSignerRegistryOptions {
  /**
   * URI in the format: gcp://project-id/secret-name
   * The secret value should be a hex-encoded private key
   */
  uri: string;
  /**
   * Optional signer name to expose this secret as.
   * Defaults to 'default' if not specified.
   */
  signerName?: string;
  logger?: Logger;
}

/**
 * Parses a GCP registry URI in the format: gcp://project-id/secret-name
 * @returns { project, secretName } or null if invalid
 */
export function parseGCPUri(uri: string): { project: string; secretName: string } | null {
  if (!uri.startsWith('gcp://')) return null;

  const path = uri.slice('gcp://'.length);
  const slashIndex = path.indexOf('/');

  if (slashIndex === -1 || slashIndex === 0 || slashIndex === path.length - 1) {
    return null;
  }

  const project = path.slice(0, slashIndex);
  const secretName = path.slice(slashIndex + 1);

  return { project, secretName };
}

/**
 * A specialized registry that provides signer configuration from GCP Secret Manager.
 *
 * This registry only implements signer-related methods. All other registry methods
 * (chains, addresses, warp routes) return empty/null values.
 *
 * URI format: gcp://project-id/secret-name
 *
 * The secret in GCP Secret Manager should contain a hex-encoded private key.
 * This registry exposes it as a GCP_SECRET signer type, allowing the SignerFactory
 * to fetch the actual key at runtime.
 *
 * Example usage:
 * ```typescript
 * const registry = new GCPSignerRegistry({
 *   uri: 'gcp://my-project/deployer-key',
 *   signerName: 'deployer',
 * });
 *
 * // Get the signer config (doesn't fetch the secret yet)
 * const signer = await registry.getSigner('deployer');
 * // { type: 'gcpSecret', project: 'my-project', secretName: 'deployer-key' }
 *
 * // Use SignerFactory to create the actual signer (fetches secret)
 * const ethSigner = await SignerFactory.createSigner(signer, provider);
 * ```
 */
export class GCPSignerRegistry implements IRegistry {
  public readonly type = RegistryType.Partial;
  public readonly uri: string;
  protected readonly logger: Logger;

  private readonly project: string;
  private readonly secretName: string;
  private readonly signerName: string;

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

  constructor(options: GCPSignerRegistryOptions) {
    this.uri = options.uri;
    // @ts-ignore forcing in to avoid a @hyperlane-xyz/utils dependency
    this.logger = options.logger || console;
    this.signerName = options.signerName ?? 'default';

    const parsed = parseGCPUri(options.uri);
    if (!parsed) {
      throw new Error(
        `Invalid GCP registry URI: ${options.uri}. Expected format: gcp://project-id/secret-name`,
      );
    }

    this.project = parsed.project;
    this.secretName = parsed.secretName;
  }

  getUri(itemPath?: string): string {
    return itemPath ? `${this.uri}/${itemPath}` : this.uri;
  }

  // ============================================================
  // Signer methods - these are the only methods that return data
  // ============================================================

  /**
   * Returns the signer configuration for this GCP secret.
   * The configuration contains a single signer that references GCP Secret Manager.
   */
  getSignerConfiguration(): SignerConfiguration {
    return {
      signers: {
        [this.signerName]: {
          type: SignerType.GCP_SECRET,
          project: this.project,
          secretName: this.secretName,
        },
      },
      defaults: {
        default: { ref: this.signerName },
      },
    };
  }

  /**
   * Returns all signers (just the one GCP signer)
   */
  getSigners(): SignerConfigMap {
    return {
      [this.signerName]: {
        type: SignerType.GCP_SECRET,
        project: this.project,
        secretName: this.secretName,
      },
    };
  }

  /**
   * Get a specific signer by name
   */
  getSigner(id: string): SignerConfig | null {
    if (id === this.signerName) {
      return {
        type: SignerType.GCP_SECRET,
        project: this.project,
        secretName: this.secretName,
      };
    }
    return null;
  }

  /**
   * Get the default signer (always returns the GCP signer)
   */
  getDefaultSigner(_chainName?: ChainName): SignerConfig {
    return {
      type: SignerType.GCP_SECRET,
      project: this.project,
      secretName: this.secretName,
    };
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
    throw new Error('GCPSignerRegistry does not support addChain');
  }

  updateChain(_chain: UpdateChainParams): MaybePromise<void> {
    throw new Error('GCPSignerRegistry does not support updateChain');
  }

  removeChain(_chain: ChainName): MaybePromise<void> {
    throw new Error('GCPSignerRegistry does not support removeChain');
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
    throw new Error('GCPSignerRegistry does not support addWarpRoute');
  }

  addWarpRouteConfig(
    _config: WarpRouteDeployConfig,
    _options: AddWarpRouteConfigOptions,
  ): MaybePromise<void> {
    throw new Error('GCPSignerRegistry does not support addWarpRouteConfig');
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
