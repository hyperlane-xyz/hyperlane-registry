import fs from 'fs';
import path from 'path';
import { readYaml } from './utils.js';

const chainsDir = './chains';
const warpRoutesDir = './deployments/warp_routes';

// chains errors
const missingDeployerField = [];
const noLogoFileError = [];

// warp route warnings / errors
const noConfigFileWarning = [];
const invalidLogoURIPathError = [];
const scaleMismatchError = [];

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
  });
}

function normalizeScale(scale) {
  if (scale == null) return null;
  if (typeof scale === 'number') return { numerator: 1, denominator: scale };
  if (typeof scale === 'object' && 'numerator' in scale && 'denominator' in scale) {
    return { numerator: scale.numerator, denominator: scale.denominator };
  }
  return null;
}

function scaleEqual(a, b) {
  if (a == null || b == null) return false;
  return a.numerator === b.numerator && a.denominator === b.denominator;
}

function validateScaleConsistency(configFilePath, configData) {
  const deployFilePath = configFilePath.replace(/-config\.yaml$/, '-deploy.yaml');
  if (!fs.existsSync(deployFilePath)) return;

  const deployData = readYaml(deployFilePath);
  if (!deployData || typeof deployData !== 'object' || !Array.isArray(configData.tokens)) return;

  for (const [chainName, chainCfg] of Object.entries(deployData)) {
    if (!chainCfg || typeof chainCfg !== 'object' || !('scale' in chainCfg)) continue;
    const deployScale = normalizeScale(chainCfg.scale);
    if (!deployScale) continue;

    const token = configData.tokens.find((t) => t.chainName === chainName);
    const configScale = token && 'scale' in token ? normalizeScale(token.scale) : null;

    if (!scaleEqual(deployScale, configScale)) {
      scaleMismatchError.push({
        chain: chainName,
        deploy: deployFilePath,
        config: configFilePath,
        deployScale,
        configScale,
      });
    }
  }
}

function validateConfigFiles(entryPath) {
  //Search for config files
  const configFiles = fs.readdirSync(entryPath).filter((file) => file.includes('-config.yaml'));

  if (configFiles.length === 0) {
    noConfigFileWarning.push(entryPath);
    return;
  }

  configFiles.forEach((configFile) => {
    const configFilePath = path.join(entryPath, configFile);
    const configData = readYaml(configFilePath);

    if (Object.keys(configData).includes('tokens')) {
      const tokens = configData.tokens;
      tokens.forEach((token) => {
        if (Object.keys(token).includes('logoURI')) {
          const logoURI = token.logoURI;
          const filePath = path.join('./', logoURI);
          if (!fs.existsSync(filePath)) {
            invalidLogoURIPathError.push({
              chain: token.chainName,
              path: configFilePath,
            });
          }
        }
      });

      validateScaleConsistency(configFilePath, configData);
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
  });
}

function validateErrors() {
  // First, warnings

  // There's a chicken and egg problem for SVM warp routes: we need to
  // merge the SVM metadata.json of a new token into main so we get a perma-link
  // prior to deploying the token. This means we generally submit a first PR with the
  // metadata and a follow-up PR with the addresses / config.
  if (noConfigFileWarning.length > 0)
    console.warn('Error: no config file at paths:', noConfigFileWarning);

  // Then, errors
  const errorCount =
    missingDeployerField.length +
    noLogoFileError.length +
    invalidLogoURIPathError.length +
    scaleMismatchError.length;

  if (errorCount === 0) return;

  console.error(`Number of errors found: ${errorCount}`);

  if (missingDeployerField.length > 0)
    console.error(
      'Error: Chain contains addresses.yaml but missing deployer field in metadata.yaml for the following paths:',
      missingDeployerField,
    );

  if (noLogoFileError.length > 0) console.error('Error: logo file missing at:', noLogoFileError);

  if (invalidLogoURIPathError.length > 0) {
    console.error(
      'Error: Invalid logoURI paths, verify that files exist:',
      invalidLogoURIPathError,
    );
  }

  if (scaleMismatchError.length > 0) {
    console.error(
      'Error: deploy.yaml defines scale but config.yaml scale is missing or does not match:',
      scaleMismatchError,
    );
  }

  process.exit(1);
}

function main() {
  validateChains();
  validateWarpRoutes();
  validateErrors();
}

main();
