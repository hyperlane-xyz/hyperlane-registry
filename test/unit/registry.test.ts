/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';

import type { ChainMetadata } from '@hyperlane-xyz/sdk';
import fs from 'fs';
import { CHAIN_FILE_REGEX } from '../../src/registry/BaseRegistry.js';
import { GithubRegistry } from '../../src/registry/GithubRegistry.js';
import { LocalRegistry } from '../../src/registry/LocalRegistry.js';
import { ChainAddresses } from '../../src/types.js';

const MOCK_CHAIN_NAME = 'mockchain';
const MOCK_CHAIN_NAME2 = 'mockchain2';
const MOCK_SYMBOL = 'MOCK';

describe('Registry utilities', () => {
  const githubRegistry = new GithubRegistry();
  expect(githubRegistry.repoOwner).to.eql('hyperlane-xyz');
  expect(githubRegistry.repoName).to.eql('hyperlane-registry');
  expect(githubRegistry.branch).to.eql('main');

  const localRegistry = new LocalRegistry({ uri: './' });
  expect(localRegistry.uri).to.be.a('string');

  for (const registry of [githubRegistry, localRegistry]) {
    it(`Lists all chains for ${registry.type} registry`, async () => {
      const chains = await registry.getChains();
      expect(chains.length).to.be.greaterThan(0);
      expect(chains.includes('ethereum')).to.be.true;
    }).timeout(5_000);

    it(`Fetches all chain metadata for ${registry.type} registry`, async () => {
      const metadata = await registry.getMetadata();
      expect(Object.keys(metadata).length).to.be.greaterThan(0);
      expect(metadata['ethereum'].chainId).to.eql(1);
    }).timeout(10_000);

    it(`Fetches single chain metadata for ${registry.type} registry`, async () => {
      const metadata = await registry.getChainMetadata('ethereum');
      expect(metadata!.chainId).to.eql(1);
    }).timeout(5_000);

    it(`Fetches chain addresses for ${registry.type} registry`, async () => {
      const addresses = await registry.getAddresses();
      expect(Object.keys(addresses).length).to.be.greaterThan(0);
      expect(addresses['ethereum'].mailbox.substring(0, 2)).to.eql('0x');
    }).timeout(10_000);

    it(`Fetches single chain addresses for ${registry.type} registry`, async () => {
      const addresses = await registry.getChainAddresses('ethereum');
      expect(addresses!.mailbox.substring(0, 2)).to.eql('0x');
    }).timeout(5_000);

    it(`Caches correctly for ${registry.type} registry`, async () => {
      const metadata = await registry.getMetadata();
      const addresses = await registry.getAddresses();
      expect(Object.keys(metadata).length).to.be.greaterThan(0);
      expect(Object.keys(addresses).length).to.be.greaterThan(0);
      // Note the short timeout to ensure result is coming from cache
    }).timeout(250);

    // TODO remove this once GitHubRegistry methods are implemented
    if (registry.type === 'github') continue;

    it(`Adds a new chain for ${registry.type} registry`, async () => {
      const mockMetadata: ChainMetadata = {
        ...(await registry.getChainMetadata('ethereum'))!,
        name: MOCK_CHAIN_NAME,
      };
      const mockAddresses: ChainAddresses = await registry.getChainAddresses('ethereum')!;
      await registry.addChain({
        chainName: MOCK_CHAIN_NAME,
        metadata: mockMetadata,
        addresses: mockAddresses,
      });
      expect((await registry.getChains()).includes(MOCK_CHAIN_NAME)).to.be.true;
    }).timeout(5_000);

    it(`Removes a chain for ${registry.type} registry`, async () => {
      await registry.removeChain('mockchain');
      expect((await registry.getChains()).includes(MOCK_CHAIN_NAME)).to.be.false;
    }).timeout(5_000);

    it(`Adds a warp route for ${registry.type} registry`, async () => {
      await registry.addWarpRoute({
        tokens: [
          { chainName: MOCK_CHAIN_NAME, symbol: MOCK_SYMBOL, standard: 'EvmHypCollateral' },
          { chainName: MOCK_CHAIN_NAME2, symbol: MOCK_SYMBOL, standard: 'EvmHypSynthetic' },
        ] as any,
        options: {},
      });
      const outputBasePath = `deployments/warp_routes/${MOCK_SYMBOL}/${MOCK_CHAIN_NAME}-${MOCK_CHAIN_NAME2}-`;
      const configPath = `${outputBasePath}config.yaml`;
      const addressesPath = `${outputBasePath}addresses.yaml`;
      expect(fs.existsSync(configPath)).to.be.true;
      expect(fs.existsSync(addressesPath)).to.be.true;
      fs.unlinkSync(configPath);
      fs.unlinkSync(addressesPath);
      fs.rmdirSync(`deployments/warp_routes/${MOCK_SYMBOL}`);
    }).timeout(5_000);
  }
});

describe('Registry regex', () => {
  it('Matches chain file regex', () => {
    expect(CHAIN_FILE_REGEX.test('chains/ethereum/metadata.yaml')).to.be.true;
    expect(CHAIN_FILE_REGEX.test('chains/ancient8/addresses.yaml')).to.be.true;
    expect(CHAIN_FILE_REGEX.test('chains/_NotAChain/addresses.yaml')).to.be.false;
    expect(CHAIN_FILE_REGEX.test('chains/foobar/logo.svg')).to.be.true;
    expect(CHAIN_FILE_REGEX.test('chains/foobar/randomfile.txt')).to.be.false;
  });
});
