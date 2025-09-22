import {
  ChainMetadataSchema,
  ChainTechnicalStack,
  EthJsonRpcBlockParameterTag,
} from '@hyperlane-xyz/sdk';
import { ProtocolType } from '@hyperlane-xyz/utils';
import { chainAddresses, chainMetadata } from '../../dist/index.js';
import { ChainAddressesSchema } from '../../src/types.js';
import { isAbacusWorksChain } from '../../src/utils.js';

import { expect } from 'chai';
import { ABACUS_WORKS_DEPLOYER_NAME } from '../../src/consts.js';

const legacyIcaChains = ['viction', 'ontology'];

describe('Chain metadata', () => {
  const skippedChainsList = ['inclusivelayertestnet'];
  for (const [chain, metadata] of Object.entries(chainMetadata)) {
    if (skippedChainsList.includes(chain)) {
      continue;
    }

    it(`${chain} metadata has name and domain defined`, () => {
      expect(metadata.name).not.to.be.undefined;
      expect(metadata.domainId).not.to.be.undefined;
    });

    it(`${chain} metadata is valid`, () => {
      ChainMetadataSchema.parse(metadata);
    });

    // check if isTestNet is set properly for chains that could be testnets
    // PD: this only works to check chains that have "test" on their name
    it(`${chain} isTestnet is set to true when name contains test`, () => {
      if (metadata.name.includes('test')) {
        expect(metadata.isTestnet).to.be.true;
      }
    });

    it(`${chain} metadata contains deployer details if mailbox address is defined`, () => {
      if (chainAddresses[chain] && chainAddresses[chain].mailbox) {
        expect(metadata.deployer).not.to.be.undefined;
      }
    });

    it(`${chain} metadata has 'index.from' defined if technicalStack is arbitrumnitro`, () => {
      if (metadata.technicalStack === ChainTechnicalStack.ArbitrumNitro) {
        expect(metadata.index?.from).to.be.not.undefined;
      }
    });

    it(`${chain} metadata has gasCurrencyCoinGeckoId if deployer is Abacus Works it is a mainnet`, () => {
      if (metadata.deployer?.name === ABACUS_WORKS_DEPLOYER_NAME && !metadata.isTestnet) {
        expect(metadata.gasCurrencyCoinGeckoId).not.to.be.undefined;
      }
    });

    it(`${chain} metadata has interchainAccountRouter defined if it is a mainnet with mailbox, deployer is Abacus Works, protocol is ethereum and technicalStack is not zksync`, () => {
      if (!metadata.isTestnet &&
          chainAddresses[chain]?.mailbox &&
          metadata.deployer?.name === ABACUS_WORKS_DEPLOYER_NAME &&
          metadata.protocol === ProtocolType.Ethereum &&
          metadata.technicalStack !== ChainTechnicalStack.ZkSync &&
          !legacyIcaChains.includes(chain)) {
        expect(chainAddresses[chain].interchainAccountRouter).not.to.be.undefined;
      }
    });

    it(`${chain} metadata does not have interchainAccountIsm address defined`, () => {
      expect(chainAddresses[chain]?.interchainAccountIsm).to.be.undefined;
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

    it(`${chain} metadata has domainId within int32 limits`, () => {
      const domainId = metadata.domainId;
      expect(domainId).to.be.at.least(0);
      // scraper db id is signed int32 - https://github.com/hyperlane-xyz/hyperlane-monorepo/issues/3121
      expect(domainId).to.be.at.most(2147483647); // 2^31 - 1
    });

    // Ensure all Abacus Works mainnets have gasCurrencyCoinGeckoId defined
    it(`${chain} metadata has gasCurrencyCoinGeckoId defined if deployer is Abacus Works`, () => {
      if (isAbacusWorksChain(metadata) && !metadata.isTestnet) {
        expect(metadata.gasCurrencyCoinGeckoId).not.to.be.undefined;
      }
    });

    // Values derived from reorg period assessment framework
    // https://www.notion.so/hyperlanexyz/Reorg-period-assessment-framework-1126d35200d680cbb5f2c67b8b492d62
    describe('Reorg period', () => {
      // Ensure all Abacus Works mainnets have blocks defined
      it(`${chain} metadata has blocks defined if deployer is Abacus Works`, () => {
        if (isAbacusWorksChain(metadata) && !metadata.isTestnet) {
          expect(metadata.blocks).not.to.be.undefined;
        }
      });

      // Ensure all Abacus Works mainnets have technicalStack defined
      it(`${chain} metadata has technicalStack defined if deployer is Abacus Works`, () => {
        if (isAbacusWorksChain(metadata) && !metadata.isTestnet) {
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
            } else if (chain === 'zircuit') {
              expect(metadata.blocks?.reorgPeriod).to.equal(300);
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

        it(`${chain} metadata has reorgPeriod of 1 if protocolType is starknet`, () => {
          if (metadata.protocol === ProtocolType.Starknet) {
            expect(metadata.blocks?.reorgPeriod).to.equal(1);
          }
        });

        it(`${chain} metadata has reorgPeriod set if technicalStack is polkadotsubstrate`, () => {
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
