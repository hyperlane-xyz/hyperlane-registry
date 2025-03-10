import { stringify } from 'yaml';
import { ABACUS_WORKS_DEPLOYER_NAME } from './consts.js';
import { ChainMetadata } from '@hyperlane-xyz/sdk';

export function toYamlString(data: any, prefix?: string): string {
  const yamlString = stringify(data, {
    indent: 2,
    sortMapEntries: true,
    aliasDuplicateObjects: false,
  });
  return prefix ? `${prefix}\n${yamlString}` : yamlString;
}

export function stripLeadingSlash(path: string): string {
  return path.startsWith('/') || path.startsWith('\\') ? path.slice(1) : path;
}

export async function concurrentMap<A, B>(
  concurrency: number,
  xs: A[],
  mapFn: (val: A, idx: number) => Promise<B>,
): Promise<B[]> {
  let res: B[] = [];
  for (let i = 0; i < xs.length; i += concurrency) {
    const remaining = xs.length - i;
    const sliceSize = Math.min(remaining, concurrency);
    const slice = xs.slice(i, i + sliceSize);
    res = res.concat(await Promise.all(slice.map((elem, index) => mapFn(elem, i + index))));
  }
  return res;
}

export function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Recursively merges b into a
// Where there are conflicts, b takes priority over a
export function objMerge(a: Record<string, any>, b: Record<string, any>, max_depth = 10): any {
  if (max_depth === 0) {
    throw new Error('objMerge tried to go too deep');
  }
  if (isObject(a) && isObject(b)) {
    const ret: Record<string, any> = {};
    const aKeys = new Set(Object.keys(a));
    const bKeys = new Set(Object.keys(b));
    const allKeys = new Set([...aKeys, ...bKeys]);
    for (const key of allKeys.values()) {
      if (aKeys.has(key) && bKeys.has(key)) {
        ret[key] = objMerge(a[key], b[key], max_depth - 1);
      } else if (aKeys.has(key)) {
        ret[key] = a[key];
      } else {
        ret[key] = b[key];
      }
    }
    return ret;
  } else {
    return b ? b : a;
  }
}

export function isAbacusWorksChain(metadata: ChainMetadata): boolean {
  return metadata.deployer?.name?.toLowerCase() === ABACUS_WORKS_DEPLOYER_NAME.toLowerCase();
}

export function parseGitHubPath(uri: string): {
  repoOwner: string;
  repoName: string;
  repoBranch: string | undefined;
} {
  const { pathname } = new URL(uri);

  // Intended pattern: /{user}/{repo}/tree/{branch}
  const regex = /\/([^/]+)\/([^/]+)(?:\/tree\/(.*))?/;
  const match = pathname.match(regex);

  if (!match) {
    throw new Error('Invalid github url');
  }
  const [, repoOwner, repoName, repoBranch] = match;
  return { repoOwner, repoName, repoBranch };
}
