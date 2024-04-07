import { ChainMetadataSchema } from '@hyperlane-xyz/sdk';
import { z } from 'zod';
import { readAllChainYamlFiles } from './utils';

describe('Chain metadata', () => {
  it('All chains have valid metadata', () => {
    const result = readAllChainYamlFiles('metadata.yaml');
    for (const [chain, metadata] of Object.entries(result)) {
      console.log('Validating metadata for', chain);
      ChainMetadataSchema.parse(metadata);
    }
  });
});

describe('Chain addresses', () => {
  const AddressSchema = z.record(z.string());
  it('All chain addresses are valid', () => {
    const result = readAllChainYamlFiles('addresses.yaml');
    for (const [chain, addresses] of Object.entries(result)) {
      console.log('Validating addresses for', chain);
      AddressSchema.parse(addresses);
    }
  });
});
