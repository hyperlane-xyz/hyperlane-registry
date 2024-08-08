import { ChainMetadataSchema } from '@hyperlane-xyz/sdk';
import { chainAddresses, chainMetadata } from '../../dist/index.js';
import { ChainAddressesSchema } from '../../src/types.js';

import { expect } from 'chai';

describe('Chain metadata', () => {
  for (const [chain, metadata] of Object.entries(chainMetadata)) {
    it(`${chain} metadata is valid`, () => {
      ChainMetadataSchema.parse(metadata);
    });

    // it(`${chain} metadata contains deployer details`, () => {
    //   expect(metadata.deployer).not.to.be.undefined;
    // });

    it(`${chain} metadata has gasCurrencyCoinGeckoId if deployer is Abacus Works it is a mainnet`, () => {
      if (metadata.deployer?.name === "Abacus Works" && (metadata.isTestnet === undefined || metadata.isTestnet === false)) {
        expect(metadata.gasCurrencyCoinGeckoId).not.to.be.undefined;
      }
    });
  }
});

describe('Chain addresses', () => {
  for (const [chain, addresses] of Object.entries(chainAddresses)) {
    it(`${chain} addresses are valid`, () => {
      ChainAddressesSchema.parse(addresses);
    });
  }
});
