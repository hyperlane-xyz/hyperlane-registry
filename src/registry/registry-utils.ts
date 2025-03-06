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

const isValidFilePath = (path: string): boolean => {
  try {
    // Check for invalid characters in path
    // These are generally invalid in most file systems
    const invalidChars = /[<>:"|?*\x00-\x1F]/g;
    if (invalidChars.test(path)) return false;

    // For paths with protocol, validate they're file:// protocol
    if (path.includes('://')) {
      try {
        const url = new URL(path);
        return url.protocol === 'file:';
      } catch {
        return false;
      }
    }

    // Basic check: path should not contain null bytes
    if (path.includes('\0')) return false;

    return true;
  } catch {
    return false;
  }
};

export function getRegistry(
  registryUris: string[],
  enableProxy: boolean,
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
          logger: childLogger,
          proxyUrl: enableProxy && isCanonicalRepoUrl(uri) ? PROXY_DEPLOYED_URL : undefined,
        });
      } else {
        if (!isValidFilePath(uri)) {
          throw new Error(`Invalid file system path: ${uri}`);
        }

        // Extract path from file:// URL if needed
        const fsPath = uri.includes('://') ? new URL(uri).pathname : uri;

        return new FileSystemRegistry({
          uri: fsPath,
          logger: childLogger,
        });
      }
    });
  return new MergedRegistry({
    registries,
    logger,
  });
}
