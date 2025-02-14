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

export const getRegistry = (uri: string, logger?: Logger, enableProxy = false): IRegistry => {
  const trimmedUri = uri.trim();

  if (!trimmedUri) {
    throw new Error('Empty registry URI');
  }

  if (isHttpsUrl(trimmedUri)) {
    return new GithubRegistry({
      uri: trimmedUri,
      logger,
      proxyUrl: enableProxy && isCanonicalRepoUrl(trimmedUri) ? PROXY_DEPLOYED_URL : undefined,
    });
  }

  return new FileSystemRegistry({
    uri: trimmedUri,
    logger,
  });
};

export const getMergedRegistry = (
  registryUris: string[],
  logger?: Logger,
  enableProxy?: boolean,
): MergedRegistry => {
  if (!registryUris.length) {
    throw new Error('At least one registry URI is required');
  }

  const registryLogger = logger?.child({ module: 'MergedRegistry' });
  const registries = registryUris.map((uri, index) =>
    getRegistry(uri, registryLogger?.child({ uri, index }), enableProxy),
  );

  return new MergedRegistry({
    registries,
    logger: registryLogger,
  });
};
