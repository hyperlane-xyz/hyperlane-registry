import fs from 'fs';
import { stringify } from 'yaml';
import { chainMetadata, hyperlaneContractAddresses } from '@hyperlane-xyz/sdk';

const LOGO_DIR_PATH = './node_modules/@hyperlane-xyz/sdk/logos/color';
const CHAIN_SCHEMA_REF = '# yaml-language-server: $schema=../schema.json';

console.log('Migrating chain data from SDK');
for (const [name, metadata] of Object.entries(chainMetadata)) {
  if (name.startsWith('test')) continue;

  const dir = `./chains/${name}`;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let metaYaml = stringify(metadata, { indent: 2 });
  metaYaml = `${CHAIN_SCHEMA_REF}\n${metaYaml}`;
  fs.writeFileSync(`${dir}/metadata.yaml`, metaYaml, 'utf8');

  const addresses = hyperlaneContractAddresses[name];
  if (addresses) {
    const addrYaml = stringify(addresses, { indent: 2 });
    fs.writeFileSync(`${dir}/addresses.yaml`, addrYaml);
  } else {
    console.warn(`No addresses found for chain ${name}`);
  }

  const logoPath = `${LOGO_DIR_PATH}/${name}.svg`;
  if (fs.existsSync(logoPath)) {
    fs.copyFileSync(logoPath, `${dir}/logo.svg`);
  }
}
