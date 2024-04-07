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

  const metadata = parse(fs.readFileSync(`${inDirPath}/metadata.yaml`, 'utf8'));
  chainMetadata[metadata.name] = metadata;
  fs.mkdirSync(`${assetOutPath}`, { recursive: true });
  fs.mkdirSync(`${tsOutPath}`, { recursive: true });
  fs.copyFileSync(`${inDirPath}/metadata.yaml`, `${assetOutPath}/metadata.yaml`);
  fs.writeFileSync(`${assetOutPath}/metadata.json`, JSON.stringify(metadata, null, 2), 'utf8');
  fs.writeFileSync(`${tsOutPath}/metadata.ts`, genJsExport(metadata, 'metadata'), 'utf8');

  if (fs.existsSync(`${inDirPath}/addresses.yaml`)) {
    const addresses = parse(fs.readFileSync(`${inDirPath}/addresses.yaml`, 'utf8'));
    chainAddresses[metadata.name] = addresses;
    fs.copyFileSync(`${inDirPath}/addresses.yaml`, `${assetOutPath}/addresses.yaml`);
    fs.writeFileSync(`${assetOutPath}/addresses.json`, JSON.stringify(addresses, null, 2), 'utf8');
    fs.writeFileSync(`${tsOutPath}/addresses.ts`, genJsExport(addresses, 'addresses'), 'utf8');
  }

  fs.copyFileSync(`${inDirPath}/logo.svg`, `${assetOutPath}/logo.svg`);
}

console.log('Assembling typescript code');
fs.mkdirSync(`./tmp`, { recursive: true });
fs.copyFileSync(`./chains/core.ts`, `./tmp/index.ts`);
fs.writeFileSync(`./tmp/chainMetadata.ts`, genJsExport(chainMetadata, 'chainMetadata'), 'utf8');
const coreChainMetadata = pick<any>(chainMetadata, CoreChains);
fs.writeFileSync(
  `./tmp/coreChainMetadata.ts`,
  genJsExport(coreChainMetadata, 'coreChainMetadata'),
  'utf8',
);
fs.appendFileSync(`./tmp/index.ts`, `\nexport { chainMetadata } from './chainMetadata.js';\n`);
fs.appendFileSync(
  `./tmp/index.ts`,
  `export { coreChainMetadata } from './coreChainMetadata.js';\n`,
);
for (const name of Object.keys(chainMetadata)) {
  fs.appendFileSync(
    `./tmp/index.ts`,
    `export { metadata as ${name} } from './chains/${name}/metadata.js';\n`,
  );
  if (chainAddresses[name]) {
    fs.appendFileSync(
      `./tmp/index.ts`,
      `export { addresses as ${name}Addresses } from './chains/${name}/addresses.js';\n`,
    );
  }
}
