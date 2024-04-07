import type { ChainMap } from '@hyperlane-xyz/sdk';
import fs from 'fs';
import { parse } from 'yaml';

export function readAllChainYamlFiles(pattern: string) {
  const result: ChainMap<any> = {};
  for (const chainName of fs.readdirSync('./chains')) {
    const stat = fs.statSync(`./chains/${chainName}`);
    if (!stat.isDirectory()) continue;
    const chainFiles = fs.readdirSync(`./chains/${chainName}`);
    for (const chainFile of chainFiles) {
      if (!chainFile.includes(pattern)) continue;
      result[chainName] = parse(fs.readFileSync(`./chains/${chainName}/${chainFile}`, 'utf8'));
    }
  }
  return result;
}
