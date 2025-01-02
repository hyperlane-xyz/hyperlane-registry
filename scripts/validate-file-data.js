import fs from 'fs';
import path from 'path';
import { readYaml } from './utils.js';

const chainsDir = './chains';
const warpRoutesDir = './deployments/warp_routes';

// chains errors
const missingDeployerField = [];
const invalidTestnetChains = [];

// warp routes errors
const noConfigFileError = [];
const noLogoFileError = [];
const noLogoURIError = [];
const unorderedChainNamesError = [];

function validateChains() {
  if (!fs.existsSync(chainsDir)) {
    console.error(`Directory does not exist: ${chainsDir}`);
    return;
  }

  const entries = fs.readdirSync(chainsDir, { withFileTypes: true });

  entries.forEach((entry) => {
    if (entry.isDirectory()) {
      const entryPath = path.join(chainsDir, entry.name);
      const addressesPath = path.join(entryPath, 'addresses.yaml');
      const metadataPath = path.join(entryPath, 'metadata.yaml');

      if (fs.existsSync(metadataPath)) {
        // if addresses.yaml exists, check if deployer field is missing in metadata.yaml
        const metadata = readYaml(metadataPath);
        if (fs.existsSync(addressesPath)) {
          if (!('deployer' in metadata)) {
            missingDeployerField.push(metadataPath);
          }
        }

        // check if isTestNet is set properly for chains that could be testnets
        // PD: this only works to check chains that have "test" on their name
        if ('name' in metadata && metadata['name'].includes('test')) {
          if (!('isTestnet' in metadata) || !metadata['isTestnet']) {
            invalidTestnetChains.push(metadataPath);
          }
        }
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

    if (match) {
      const chains = match[1].split('-');

      for (let i = 0; i < chains.length - 1; i++) {
        // Combine conditions: skip comparison for the last word
        if (i !== chains.length - 1 && chains[i] > chains[i + 1]) {
          unorderedChainNamesError.push(filePath);
          return;
        }
      }
    }
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

    if ('tokens' in configData) {
      configData.tokens.forEach((token) => {
        if (!('logoURI' in token)) {
          noLogoURIError.push({
            chainName: token.chainName || 'unknown',
            path: configFilePath,
          });
        }
      });
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
    if (entry.isDirectory()) {
      const entryPath = path.join(warpRoutesDir, entry.name);

      // check if logo file exists
      const logoFile = fs.readdirSync(entryPath).find((file) => file.includes('logo'));
      if (!logoFile) noLogoFileError.push(entryPath);

      validateConfigFiles(entryPath);
      validateChainNameOrder(entryPath);
    }
  });
}

function validateErrors() {
  const errorCount =
    missingDeployerField.length +
    invalidTestnetChains.length +
    noConfigFileError.length +
    noLogoFileError.length +
    noLogoURIError.length +
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

  if (noConfigFileError.length > 0)
    console.error('Error: no config file at paths:', noConfigFileError);

  if (noLogoFileError.length > 0) console.error('Error: logo file missing at:', noLogoFileError);

  if (noLogoURIError.length > 0) console.error('Error: Missing field logoURI at:', noLogoURIError);

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
