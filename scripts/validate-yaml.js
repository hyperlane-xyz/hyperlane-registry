import fs from 'fs';
import path from 'path';
import { readYaml } from './utils.js';

const chainsDir = './chains';

const missingDeployerField = [];
const invalidTestnetChains = [];

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

function validateErrors() {
  const errorCount = missingDeployerField.length + invalidTestnetChains.length;

  if (errorCount === 0) return;

  console.error(`Number of errors found: ${errorCount}`);

  if (missingDeployerField.length > 0) {
    console.error(
      'Error: Chain contains addresses.yaml but missing deployer field in metadata.yaml for the following paths:',
      missingDeployerField,
    );
  }

  if (invalidTestnetChains.length > 0) {
    console.error(
      'Error: Chain contains "test" on its name but isTestNet is not set to "true" for the following paths:',
      invalidTestnetChains,
    );
  }

  process.exit(1);
}

function main() {
  validateChains();
  validateErrors();
}

main();
