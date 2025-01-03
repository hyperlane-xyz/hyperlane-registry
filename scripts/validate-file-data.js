import fs from 'fs';
import path from 'path';
import { readYaml } from './utils.js';

const chainsDir = './chains';
const warpRoutesDir = './deployments/warp_routes';

// chains errors
const missingDeployerField = [];
const invalidTestnetChains = [];
const noLogoFileError = [];

// warp routes errors
const noConfigFileError = [];
const logoURIError = [];
const unorderedChainNamesError = [];

function validateChains() {
  if (!fs.existsSync(chainsDir)) {
    console.error(`Directory does not exist: ${chainsDir}`);
    return;
  }

  const entries = fs.readdirSync(chainsDir, { withFileTypes: true });

  entries.forEach((entry) => {
    if (!entry.isDirectory()) return;

    const entryPath = path.join(chainsDir, entry.name);
    const addressesPath = path.join(entryPath, 'addresses.yaml');
    const metadataPath = path.join(entryPath, 'metadata.yaml');

    // check if logo file exists
    const logoFile = fs.readdirSync(entryPath).find((file) => file.includes('logo.svg'));
    if (!logoFile) noLogoFileError.push(entryPath);

    if (!fs.existsSync(metadataPath)) return;

    // if addresses.yaml exists, check if deployer field is missing in metadata.yaml
    const metadata = readYaml(metadataPath);
    if (fs.existsSync(addressesPath)) {
      if (!Object.keys(metadata).includes('deployer')) missingDeployerField.push(metadataPath);
    }

    // check if isTestNet is set properly for chains that could be testnets
    // PD: this only works to check chains that have "test" on their name
    if ('name' in metadata && metadata['name'].includes('test')) {
      if (!('isTestnet' in metadata) || !metadata['isTestnet']) {
        invalidTestnetChains.push(metadataPath);
      }
    }
  });
}

// This regex will make sure that we can split the filename when it contains the words
// addresses or config that way we can grab all the chain names and exclude these words
const filenameRegex = /^([\w-]+)-(addresses|config)\.yaml$/;

// check if chain names in warp routes are ordered alphabetically
function validateChainNameOrder(entryPath) {
  const yamlFiles = fs.readdirSync(entryPath).filter((file) => file.includes('.yaml'));

  yamlFiles.forEach((filename) => {
    const match = filename.match(filenameRegex);
    const filePath = path.join(entryPath, filename);

    if (!match) return;

    const chains = match[1];
    const sortedChains = [...chains.split('-')].sort().join('-');

    if (chains !== sortedChains) unorderedChainNamesError.push(filePath);
  });
}

function validateConfigFiles(entryPath) {
  //Search for config files
  const configFiles = fs.readdirSync(entryPath).filter((file) => file.includes('-config.yaml'));

  if (configFiles.length === 0) {
    noConfigFileError.push(entryPath);
    return;
  }

  // Search and parse the config files in the current directory
  // For each entry, find if field logoURI is missing
  configFiles.forEach((configFile) => {
    const configFilePath = path.join(entryPath, configFile);
    const configData = readYaml(configFilePath);

    let foundLogoURIs = 0;

    if (Object.keys(configData).includes('tokens')) {
      const tokens = configData.tokens;
      tokens.forEach((token) => {
        if (!Object.keys(token).includes('logoURI')) {
          foundLogoURIs++;
        }
      });

      // if no entry found, skip check
      if (foundLogoURIs === 0) return;

      // otherwise all tokens must contain logoURI,
      if (foundLogoURIs !== tokens.length) logoURIError.push(configFilePath);
    }
  });
}

function validateWarpRoutes() {
  if (!fs.existsSync(warpRoutesDir)) {
    console.error(`Directory does not exist: ${warpRoutesDir}`);
    return;
  }

  const entries = fs.readdirSync(warpRoutesDir, { withFileTypes: true });

  entries.forEach((entry) => {
    if (!entry.isDirectory()) return;

    const entryPath = path.join(warpRoutesDir, entry.name);

    validateConfigFiles(entryPath);
    validateChainNameOrder(entryPath);
  });
}

function validateErrors() {
  const errorCount =
    missingDeployerField.length +
    invalidTestnetChains.length +
    noConfigFileError.length +
    noLogoFileError.length +
    logoURIError.length +
    unorderedChainNamesError.length;

  if (errorCount === 0) return;

  console.error(`Number of errors found: ${errorCount}`);

  if (missingDeployerField.length > 0)
    console.error(
      'Error: Chain contains addresses.yaml but missing deployer field in metadata.yaml for the following paths:',
      missingDeployerField,
    );

  if (invalidTestnetChains.length > 0)
    console.error(
      'Error: Chain contains "test" on its name but isTestNet is not set to "true" for the following paths:',
      invalidTestnetChains,
    );

  if (noLogoFileError.length > 0) console.error('Error: logo file missing at:', noLogoFileError);

  if (noConfigFileError.length > 0)
    console.error('Error: no config file at paths:', noConfigFileError);

  if (logoURIError.length > 0)
    console.error('Error: All tokens must contain logoURI field:', logoURIError);

  if (unorderedChainNamesError.length > 0)
    console.error(
      'Error: Chain names not ordered alphabetically at paths:',
      unorderedChainNamesError,
    );

  process.exit(1);
}

function main() {
  validateChains();
  validateWarpRoutes();
  validateErrors();
}

main();
