import { pick } from '@hyperlane-xyz/utils';
import fs from 'fs';
import { parse } from 'yaml';
import { CoreChains } from '../chains/core';

function genJsExport(data, exportName) {
  return `export const ${exportName} = ${JSON.stringify(data, null, 2)};`;
}

let chainMetadata = {};
let chainAddresses = {};

console.log('Parsing and copying chain data');
for (const file of fs.readdirSync('./chains')) {
  const inDirPath = `./chains/${file}`;
  const assetOutPath = `./dist/chains/${file}`;
  // generated ts files to to the tmp dir so they can be compiled along with other generated code
  const tsOutPath = `./tmp/chains/${file}`;
  const stat = fs.statSync(`${inDirPath}`);
  if (!stat.isDirectory()) continue;

  // Convert and copy metadata
  const metadata = parse(fs.readFileSync(`${inDirPath}/metadata.yaml`, 'utf8'));
  chainMetadata[metadata.name] = metadata;
  fs.mkdirSync(`${assetOutPath}`, { recursive: true });
  fs.mkdirSync(`${tsOutPath}`, { recursive: true });
  fs.copyFileSync(`${inDirPath}/metadata.yaml`, `${assetOutPath}/metadata.yaml`);
  fs.writeFileSync(`${assetOutPath}/metadata.json`, JSON.stringify(metadata, null, 2));
  fs.writeFileSync(`${tsOutPath}/metadata.ts`, genJsExport(metadata, 'metadata'));

  // Convert and copy addresses if there are any
  if (fs.existsSync(`${inDirPath}/addresses.yaml`)) {
    const addresses = parse(fs.readFileSync(`${inDirPath}/addresses.yaml`, 'utf8'));
    chainAddresses[metadata.name] = addresses;
    fs.copyFileSync(`${inDirPath}/addresses.yaml`, `${assetOutPath}/addresses.yaml`);
    fs.writeFileSync(`${assetOutPath}/addresses.json`, JSON.stringify(addresses, null, 2));
    fs.writeFileSync(`${tsOutPath}/addresses.ts`, genJsExport(addresses, 'addresses'));
  }

  // Copy the logo file
  fs.copyFileSync(`${inDirPath}/logo.svg`, `${assetOutPath}/logo.svg`);
}

console.log('Assembling typescript code');
fs.mkdirSync(`./tmp`, { recursive: true });
// Start with the contents of core.ts for the new index file
fs.copyFileSync(`./chains/core.ts`, `./tmp/index.ts`);
fs.writeFileSync(`./tmp/chainMetadata.ts`, genJsExport(chainMetadata, 'chainMetadata'));
const coreChainMetadata = pick<any>(chainMetadata, CoreChains);
fs.writeFileSync(`./tmp/coreChainMetadata.ts`, genJsExport(coreChainMetadata, 'coreChainMetadata'));
// Add the chain metadata map exports to the index file
fs.appendFileSync(`./tmp/index.ts`, `\nexport { chainMetadata } from './chainMetadata.js';\n`);
fs.appendFileSync(
  `./tmp/index.ts`,
  `export { coreChainMetadata } from './coreChainMetadata.js';\n`,
);
for (const name of Object.keys(chainMetadata)) {
  // Create an index file for each chain folder to allow for direct, single-chain imports
  fs.writeFileSync(`./tmp/chains/${name}/index.ts`, `export { metadata } from './metadata.js';\n`);
  // Also add a metadata export to the root index for convenience
  fs.appendFileSync(
    `./tmp/index.ts`,
    `export { metadata as ${name} } from './chains/${name}/metadata.js';\n`,
  );
  // Ditto as above for addresses if they exist
  if (chainAddresses[name]) {
    fs.appendFileSync(
      `./tmp/chains/${name}/index.ts`,
      `export { addresses } from './addresses.js';\n`,
    );
    fs.appendFileSync(
      `./tmp/index.ts`,
      `export { addresses as ${name}Addresses } from './chains/${name}/addresses.js';\n`,
    );
  }
}
