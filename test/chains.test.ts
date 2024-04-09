import { ChainMetadataSchema } from '@hyperlane-xyz/sdk';
import { z } from 'zod';
import { chainAddresses, chainMetadata } from '../dist/index.js';

describe('Chain metadata', () => {
  for (const [chain, metadata] of Object.entries(chainMetadata)) {
    it(`${chain} metadata is valid`, () => {
      ChainMetadataSchema.parse(metadata);
    });
  }
});

describe('Chain addresses', () => {
  const AddressSchema = z.record(z.string());
  for (const [chain, addresses] of Object.entries(chainAddresses)) {
    it(`${chain} addresses are valid`, () => {
      AddressSchema.parse(addresses);
    });
  }
});
