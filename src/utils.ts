import { stringify } from 'yaml';

export function toYamlString(data: any, prefix?: string): string {
  const yamlString = stringify(data);
  return prefix ? `${prefix}\n${yamlString}` : yamlString;
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
