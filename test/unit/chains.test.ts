import { ChainMetadataSchema, ChainTechnicalStack, EthJsonRpcBlockParameterTag } from '@hyperlane-xyz/sdk';
import { chainAddresses, chainMetadata } from '../../dist/index.js';
import { ChainAddressesSchema } from '../../src/types.js';

import { expect } from 'chai';

describe('Chain metadata', () => {
  for (const [chain, metadata] of Object.entries(chainMetadata)) {
    it(`${chain} metadata is valid`, () => {
      ChainMetadataSchema.parse(metadata);
    });

    it(`${chain} metadata contains deployer details if mailbox address is defined`, () => {
      if (chainAddresses[chain] && chainAddresses[chain].mailboxAddress) {
        expect(metadata.deployer).not.to.be.undefined;
      }
    });

    it(`${chain} metadata has 'index.from' defined if technicalStack is arbitrumnitro`, () => {
      if (metadata.technicalStack === ChainTechnicalStack.ArbitrumNitro) {
        expect(metadata.index?.from).to.be.not.undefined;
      }
    });

    it(`${chain} metadata has gasCurrencyCoinGeckoId if deployer is Abacus Works it is a mainnet`, () => {
      if (metadata.deployer?.name === "Abacus Works" && !metadata.isTestnet) {
        expect(metadata.gasCurrencyCoinGeckoId).not.to.be.undefined;
      }
    });

    it(`${chain} metadata has valid reorgPeriod`, () => {
      const reorgPeriod = metadata.blocks?.reorgPeriod;
      if (reorgPeriod === undefined) {
        return;
      }

      if (typeof reorgPeriod === 'string') {
        expect(Object.values(EthJsonRpcBlockParameterTag)).to.include(reorgPeriod);
      } else if (typeof reorgPeriod === 'number') {
        expect(reorgPeriod).to.be.at.least(0);
        expect(reorgPeriod).to.be.at.most(500);
      } else {
        throw new Error(`Invalid reorgPeriod type for ${chain}`);
      }
    });

    // Values derived from reorg period assessment framework
    // https://www.notion.so/hyperlanexyz/Reorg-period-assessment-framework-1126d35200d680cbb5f2c67b8b492d62
    describe('Reorg period', () => {
      // Ensure all Abacus Works mainnets have technicalStack defined
      it(`${chain} metadata has technicalStack defined if deployer is Abacus Works, and it is a mainnet with a mailbox deployed`, () => {
        if (metadata.deployer?.name === "Abacus Works" && !metadata.isTestnet && chainAddresses[chain]?.mailboxAddress) {
          expect(metadata.technicalStack).not.to.be.undefined;
        }
      });

      // Only enforce mainnet reorg period values
      if (!metadata.isTestnet) {
        it(`${chain} metadata has reorgPeriod set if technicalStack is opstack`, () => {
          if (metadata.technicalStack === ChainTechnicalStack.OpStack) {
            if (chain === 'base' || chain === 'optimism') {
              expect(metadata.blocks?.reorgPeriod).to.equal(10);
            } else if (chain === 'mantle') {
              expect(metadata.blocks?.reorgPeriod).to.equal(2);
            } else {
              expect(metadata.blocks?.reorgPeriod).to.equal(5);
            }
          }
        });

        it(`${chain} metadata has reorgPeriod of 5 if technicalStack is polygoncdk`, () => {
          if (metadata.technicalStack === ChainTechnicalStack.PolygonCDK) {
            expect(metadata.blocks?.reorgPeriod).to.equal(5);
          }
        });

        it(`${chain} metadata has reorgPeriod set if technicalStack is polkadotsubtrate`, () => {
          if (metadata.technicalStack === ChainTechnicalStack.PolkadotSubstrate) {
            expect(metadata.blocks?.reorgPeriod).to.equal('finalized');
          }
        });

        it(`${chain} metadata has reorgPeriod between 0 and 5 if technicalStack is arbitrumnitro`, () => {
          if (metadata.technicalStack === ChainTechnicalStack.ArbitrumNitro) {
            expect(metadata.blocks?.reorgPeriod).to.be.at.least(0);
            expect(metadata.blocks?.reorgPeriod).to.be.at.most(5);
          }
        });
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
