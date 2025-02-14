import type { Logger } from 'pino';
import { GithubRegistry } from './GithubRegistry.js';
import { FileSystemRegistry } from './FileSystemRegistry.js';
import { IRegistry } from './IRegistry.js';
import { DEFAULT_GITHUB_REGISTRY, PROXY_DEPLOYED_URL } from '../consts.js';
import { MergedRegistry } from './MergedRegistry.js';

export class RegistryFactory {
  constructor(private readonly enableProxy: boolean = false, private readonly logger?: Logger) {}

  private isHttpsUrl(value: string): boolean {
    try {
      if (!value) return false;
      const url = new URL(value);
      return url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private isCanonicalRepoUrl(url: string): boolean {
    return url === DEFAULT_GITHUB_REGISTRY;
  }

  public createRegistry(uri: string, logger: Logger | undefined = this.logger): IRegistry {
    const trimmedUri = uri.trim();
    if (!trimmedUri) throw new Error('Empty registry URI');

    if (this.isHttpsUrl(trimmedUri)) {
      return new GithubRegistry({
        uri: trimmedUri,
        logger: logger,
        proxyUrl:
          this.enableProxy && this.isCanonicalRepoUrl(trimmedUri) ? PROXY_DEPLOYED_URL : undefined,
      });
    }

    return new FileSystemRegistry({
      uri: trimmedUri,
      logger: logger,
    });
  }

  public createMergedRegistry(registryUris: string[]): MergedRegistry {
    if (!registryUris.length) throw new Error('At least one registry URI is required');

    const registryLogger = this.logger?.child({ module: 'MergedRegistry' });
    const registries = registryUris.map((uri, index) =>
      this.createRegistry(uri, registryLogger?.child({ uri, index })),
    );

    return new MergedRegistry({
      registries,
      logger: registryLogger,
    });
  }
}
