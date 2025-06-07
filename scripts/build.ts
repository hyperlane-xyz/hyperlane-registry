/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChainMetadataSchemaObject, WarpCoreConfigSchema } from '@hyperlane-xyz/sdk';
import fs from 'fs';
import { parse, stringify } from 'yaml';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { BaseRegistry } from '../src/registry/BaseRegistry';
import { WARP_ROUTE_ID_REGEX } from '../src/consts';
const chainMetadata = {};
const chainAddresses = {};
const warpRouteConfigs = {};

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

function genWarpRouteConfigExport(data, exportName) {
  return `import type { WarpCoreConfig } from '@hyperlane-xyz/sdk';
${genJsExport(data, exportName)} as WarpCoreConfig`;
}

function genWarpRouteConfigMapExport(data, exportName) {
  return `import type { WarpCoreConfig } from '@hyperlane-xyz/sdk';
${genJsExport(data, exportName)} as Record<string, WarpCoreConfig>`;
}

function createTmpDir() {
  console.log('Preparing tmp directory');
  if (fs.existsSync('./tmp')) fs.rmSync(`./tmp`, { recursive: true });
  // Start with the contents of src, which we will add to in this script
  fs.cpSync(`./src`, `./tmp`, { recursive: true });
}

function createChainFiles() {
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
}

// Update the combined metadata and addresses files
// These reduce the fetches needed to get all chain data
function updateCombinedChainFiles() {
  console.log('Updating combined chain metadata and addresses files');
  const AUTO_GEN_PREFIX = '# AUTO-GENERATED; DO NOT EDIT MANUALLY';
  const combinedMetadata = stringify(chainMetadata, { sortMapEntries: true });
  const combinedAddresses = stringify(chainAddresses, { sortMapEntries: true });
  fs.writeFileSync('./chains/metadata.yaml', `${AUTO_GEN_PREFIX}\n${combinedMetadata}`);
  fs.writeFileSync('./chains/addresses.yaml', `${AUTO_GEN_PREFIX}\n${combinedAddresses}`);
}

function updateCombinedWarpRouteConfigsFile() {
  console.log('Updating combined warp route config files');
  const AUTO_GEN_PREFIX = '# AUTO-GENERATED; DO NOT EDIT MANUALLY';
  const combinedWarpRouteConfigs = stringify(warpRouteConfigs, { sortMapEntries: true });
  fs.writeFileSync(
    './deployments/warp_routes/warpRouteConfigs.yaml',
    `${AUTO_GEN_PREFIX}\n${combinedWarpRouteConfigs}`,
  );
}

function createWarpConfigFiles() {
  console.log('Parsing and copying warp config data');
  const warpPathBase = 'deployments/warp_routes';
  // Outer loop for token symbol directories
  for (const warpDir of fs.readdirSync(`./${warpPathBase}`)) {
    const inDirPath = `./${warpPathBase}/${warpDir}`;
    const assetOutPath = `./dist/${warpPathBase}/${warpDir}`;
    // ts files go to the tmp dir so they can be compiled along with other generated code
    const tsOutPath = `./tmp/${warpPathBase}/${warpDir}`;
    const stat = fs.statSync(`${inDirPath}`);
    if (!stat.isDirectory()) continue;

    // Inner loop for individual warp route configs
    for (const warpFile of fs.readdirSync(inDirPath)) {
      if (!warpFile.endsWith('config.yaml')) continue;
      const [warpFileName] = warpFile.split('.');
      // Remove the -config suffix from the filename
      const label = warpFileName.replace('-config', '');
      const warpRouteId = `${warpDir}/${label}`;
      if (!WARP_ROUTE_ID_REGEX.test(warpRouteId)) {
        throw new Error(`Invalid warp route ID format: ${warpRouteId}`);
      }

      const config = parse(fs.readFileSync(`${inDirPath}/${warpFile}`, 'utf8'));
      //Situations where a config contains multiple symbols are not officially supported yet.
      const id = BaseRegistry.warpRouteConfigToId(config, { warpRouteId });
      warpRouteConfigs[id] = config;
      fs.mkdirSync(`${assetOutPath}`, { recursive: true });
      fs.mkdirSync(`${tsOutPath}`, { recursive: true });
      fs.copyFileSync(`${inDirPath}/${warpFileName}.yaml`, `${assetOutPath}/${warpFileName}.yaml`);
      fs.writeFileSync(`${assetOutPath}/${warpFileName}.json`, JSON.stringify(config, null, 2));
      fs.writeFileSync(
        `${tsOutPath}/${warpFileName}.ts`,
        genWarpRouteConfigExport(config, 'warpRouteConfig'),
      );
    }
  }
}

function generateChainTsCode() {
  console.log('Assembling chain typescript code');
  // Create files for the chain metadata and addresses maps
  fs.writeFileSync(
    `./tmp/chainMetadata.ts`,
    genChainMetadataMapExport(chainMetadata, 'chainMetadata'),
  );
  fs.writeFileSync(`./tmp/chainAddresses.ts`, genJsExport(chainAddresses, 'chainAddresses'));
  // Add the exports for new files to the index file
  fs.appendFileSync(
    `./tmp/index.ts`,
    `
  export { chainMetadata } from './chainMetadata.js';
  export { chainAddresses } from './chainAddresses.js';
  `,
  );
  // Also create individual js files for each chain
  for (const name of Object.keys(chainMetadata)) {
    // Create an index file for each chain folder to allow for direct, single-chain imports
    fs.writeFileSync(
      `./tmp/chains/${name}/index.ts`,
      `export { metadata } from './metadata.js';\n`,
    );
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
}

function generateWarpConfigTsCode() {
  console.log('Assembling warp config typescript code');
  // Generate a combined config map
  fs.writeFileSync(
    `./tmp/warpRouteConfigs.ts`,
    genWarpRouteConfigMapExport(warpRouteConfigs, 'warpRouteConfigs'),
  );
  // Add the export to the index file
  fs.appendFileSync(
    `./tmp/index.ts`,
    `\nexport { warpRouteConfigs } from './warpRouteConfigs.js';`,
  );
}

function updateJsonSchemas() {
  console.log('Updating & copying chain JSON schemas');
  const chainSchema = zodToJsonSchema(ChainMetadataSchemaObject, 'hyperlaneChainMetadata');
  fs.writeFileSync(`./chains/schema.json`, JSON.stringify(chainSchema, null, 2), 'utf8');
  fs.copyFileSync(`./chains/schema.json`, `./dist/chains/schema.json`);
  const warpSchema = zodToJsonSchema(WarpCoreConfigSchema, 'hyperlaneWarpCoreConfig');
  fs.writeFileSync(
    `./deployments/warp_routes/schema.json`,
    JSON.stringify(warpSchema, null, 2),
    'utf8',
  );
  // Warp Deploy schema should not be attempted until this is resolved: https://github.com/StefanTerdell/zod-to-json-schema/issues/68
}

createTmpDir();
createChainFiles();
updateCombinedChainFiles();
createWarpConfigFiles();
updateCombinedWarpRouteConfigsFile();
generateChainTsCode();
generateWarpConfigTsCode();
updateJsonSchemas();
