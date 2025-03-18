import type { Logger } from 'pino';
import { GithubRegistry } from './GithubRegistry.js';
import { FileSystemRegistry } from './FileSystemRegistry.js';
import { IRegistry } from './IRegistry.js';
import { PROXY_DEPLOYED_URL } from '../consts.js';
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

const isValidFilePath = (path: string): boolean => {
  try {
    // Check for control characters (0-31) and DEL (127) without using regex
    const hasControlChars = Array.from(path).some((char) => {
      const code = char.charCodeAt(0);
      return (code >= 0 && code <= 31) || code === 127;
    });
    if (hasControlChars) return false;

    // For paths with protocol, validate they're file:// protocol
    if (path.includes('://')) {
      try {
        const url = new URL(path);
        return url.protocol === 'file:';
      } catch {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Retrieves a registry instance based on the provided registry URIs.
 * The registry can be either a GitHub registry or a file system registry,
 * and the returned instance is a `MergedRegistry` that combines all the
 * specified registries.
 *
 * @param registryUris - An array of registry URIs to use for creating the registry.
 * @param enableProxy - If enabled, forwards all requests to Hyperlane Registry, with higher read limits.
 * @param branch - An optional branch name to use for the GitHub registry.
 * @param logger - An optional logger instance to use for logging.
 * @returns An `IRegistry` instance that combines the specified registries.
 */
export function getRegistry({
  registryUris,
  enableProxy,
  branch,
  logger,
  authToken,
}: {
  registryUris: string[];
  enableProxy: boolean;
  branch?: string;
  logger?: Logger;
  authToken?: string;
}): IRegistry {
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
          proxyUrl: enableProxy ? PROXY_DEPLOYED_URL : undefined,
          authToken,
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
