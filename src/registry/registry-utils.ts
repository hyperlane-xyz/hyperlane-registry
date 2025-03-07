import type { Logger } from 'pino';
import { GithubRegistry } from './GithubRegistry.js';
import { FileSystemRegistry } from './FileSystemRegistry.js';
import { IRegistry } from './IRegistry.js';
import { DEFAULT_GITHUB_REGISTRY, PROXY_DEPLOYED_URL } from '../consts.js';
import { MergedRegistry } from './MergedRegistry.js';

const isHttpsUrl = (value: string): boolean => {
  try {
    if (!value) return false;
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
};

const isCanonicalRepoUrl = (url: string): boolean => {
  return url === DEFAULT_GITHUB_REGISTRY;
};

export function getRegistry(
  registryUris: string[],
  enableProxy: boolean,
  branch?: string,
  logger?: Logger,
): IRegistry {
  const registryLogger = logger?.child({ module: 'MergedRegistry' });
  const registries = registryUris
    .map((uri) => uri.trim())
    .filter((uri) => !!uri)
    .map((uri, index) => {
      const childLogger = registryLogger?.child({ uri, index });
      if (isHttpsUrl(uri)) {
        return new GithubRegistry({
          uri,
          branch,
          logger: childLogger,
          proxyUrl: enableProxy && isCanonicalRepoUrl(uri) ? PROXY_DEPLOYED_URL : undefined,
        });
      } else {
        return new FileSystemRegistry({
          uri,
          logger: childLogger,
        });
      }
    });
  return new MergedRegistry({
    registries,
    logger,
  });
}
