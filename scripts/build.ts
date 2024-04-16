import { ChainMetadataSchemaObject } from '@hyperlane-xyz/sdk';
import { pick } from '@hyperlane-xyz/utils';
import fs from 'fs';
import { parse } from 'yaml';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { CoreChains } from '../src/core/chains';

function genJsExport(data, exportName) {
  return `export const ${exportName} = ${JSON.stringify(data, null, 2)}`;
}

function genChainMetadataExport(data, exportName) {
  return `import type { ChainMetadata } from '@hyperlane-xyz/sdk';
${genJsExport(data, exportName)} as ChainMetadata`;
}

function genChainMetadataMapExport(data, exportName) {
  return `import type { ChainMetadata, ChainMap } from '@hyperlane-xyz/sdk';
${genJsExport(data, exportName)} as ChainMap<ChainMetadata>`;
}

console.log('Preparing tmp directory');
if (fs.existsSync('./tmp')) fs.rmSync(`./tmp`, { recursive: true });
// Start with the contents of src, which we will add to in this script
fs.cpSync(`./src`, `./tmp`, { recursive: true });

let chainMetadata = {};
let chainAddresses = {};

console.log('Parsing and copying chain data');
for (const file of fs.readdirSync('./chains')) {
  const inDirPath = `./chains/${file}`;
  const assetOutPath = `./dist/chains/${file}`;
  // ts files go to the tmp dir so they can be compiled along with other generated code
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
  fs.writeFileSync(`${tsOutPath}/metadata.ts`, genChainMetadataExport(metadata, 'metadata'));

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
// Create files for the chain metadata and addresses maps
fs.writeFileSync(
  `./tmp/chainMetadata.ts`,
  genChainMetadataMapExport(chainMetadata, 'chainMetadata'),
);
fs.writeFileSync(`./tmp/chainAddresses.ts`, genJsExport(chainAddresses, 'chainAddresses'));
// And also alternate versions with just the core chains
const coreChainMetadata = pick<any>(chainMetadata, CoreChains);
const coreChainAddresses = pick<any>(chainAddresses, CoreChains);
fs.writeFileSync(
  `./tmp/coreChainMetadata.ts`,
  genChainMetadataMapExport(coreChainMetadata, 'coreChainMetadata'),
);
fs.writeFileSync(
  `./tmp/coreChainAddresses.ts`,
  genJsExport(coreChainAddresses, 'coreChainAddresses'),
);
// Add the exports for new files to the index file
fs.appendFileSync(
  `./tmp/index.ts`,
  `
export { chainMetadata } from './chainMetadata.js';
export { coreChainMetadata } from './coreChainMetadata.js';
export { chainAddresses } from './chainAddresses.js';
export { coreChainAddresses } from './coreChainAddresses.js';
`,
);
// Also create individual js files for each chain
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

console.log('Updating & copying chain JSON schema');
const schema = zodToJsonSchema(ChainMetadataSchemaObject, 'hyperlaneChainMetadata');
const schemaStr = JSON.stringify(schema, null, 2);
fs.writeFileSync(`./chains/schema.json`, schemaStr, 'utf8');
fs.copyFileSync(`./chains/schema.json`, `./dist/chains/schema.json`);
