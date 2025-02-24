/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import sinon from 'sinon';

import type { ChainMetadata } from '@hyperlane-xyz/sdk';
import fs from 'fs';
import { CHAIN_FILE_REGEX } from '../../src/consts.js';
import { FileSystemRegistry } from '../../src/registry/FileSystemRegistry.js';
import { GITHUB_API_URL, GithubRegistry } from '../../src/registry/GithubRegistry.js';
import { RegistryType } from '../../src/registry/IRegistry.js';
import { MergedRegistry } from '../../src/registry/MergedRegistry.js';
import { PartialRegistry } from '../../src/registry/PartialRegistry.js';
import { ChainAddresses } from '../../src/types.js';

const GITHUB_REGISTRY_BRANCH = 'main';

const MOCK_CHAIN_NAME = 'mockchain';
const MOCK_CHAIN_NAME2 = 'mockchain2';
const MOCK_DISPLAY_NAME = 'faketherum';
const MOCK_SYMBOL = 'MOCK';
const MOCK_ADDRESS = '0x0000000000000000000000000000000000000001';

// Used to verify the GithubRegistry is fetching the correct data
// Must be kept in sync with value in canonical registry's main branch
const ETH_MAILBOX_ADDRESS = '0xc005dc82818d67AF737725bD4bf75435d065D239';

describe('Registry utilities', () => {
  const githubRegistry = new GithubRegistry({ branch: GITHUB_REGISTRY_BRANCH });
  expect(githubRegistry.repoOwner).to.eql('hyperlane-xyz');
  expect(githubRegistry.repoName).to.eql('hyperlane-registry');
  expect(githubRegistry.branch).to.eql(GITHUB_REGISTRY_BRANCH);

  const localRegistry = new FileSystemRegistry({ uri: './' });
  expect(localRegistry.uri).to.be.a('string');

  const partialRegistry = new PartialRegistry({
    chainMetadata: { ethereum: { chainId: 1, displayName: MOCK_DISPLAY_NAME } },
    chainAddresses: { ethereum: { mailbox: MOCK_ADDRESS } },
    warpRoutes: [{ tokens: [{ chainName: 'ethereum', symbol: 'USDT' }] }],
  });

  const mergedRegistry = new MergedRegistry({
    registries: [githubRegistry, localRegistry, partialRegistry],
  });

  for (const registry of [githubRegistry, localRegistry, partialRegistry, mergedRegistry]) {
    it(`Lists all chains for ${registry.type} registry`, async () => {
      const chains = await registry.getChains();
      expect(chains.length).to.be.greaterThan(0);
      expect(chains.includes('ethereum')).to.be.true;
    }).timeout(5_000);

    it(`Fetches all chain metadata for ${registry.type} registry`, async () => {
      const metadata = await registry.getMetadata();
      expect(Object.keys(metadata).length).to.be.greaterThan(0);
      expect(metadata['ethereum'].chainId).to.eql(1);
      if (registry.type === RegistryType.Partial || registry.type === RegistryType.Merged) {
        expect(metadata['ethereum'].displayName).to.eql(MOCK_DISPLAY_NAME);
      } else {
        expect(metadata['ethereum'].displayName).to.eql('Ethereum');
      }
    }).timeout(10_000);

    it(`Fetches single chain metadata for ${registry.type} registry`, async () => {
      const metadata = await registry.getChainMetadata('ethereum');
      expect(metadata!.chainId).to.eql(1);
    }).timeout(5_000);

    it(`Fetches chain addresses for ${registry.type} registry`, async () => {
      const addresses = await registry.getAddresses();
      expect(Object.keys(addresses).length).to.be.greaterThan(0);
      expect(addresses['ethereum'].mailbox.substring(0, 2)).to.eql('0x');
      if (registry.type === RegistryType.Github) {
        expect(addresses['ethereum'].mailbox).to.eql(ETH_MAILBOX_ADDRESS);
      }
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

    it(`Fetches warp route configs for ${registry.type} registry`, async () => {
      const routes = await registry.getWarpRoutes();
      const routeIds = Object.keys(routes);
      expect(routeIds.length).to.be.greaterThan(0);
      const firstRoute = await registry.getWarpRoute(routeIds[0]);
      expect(firstRoute!.tokens.length).to.be.greaterThan(0);
      const noRoutes = await registry.getWarpRoutes({ symbol: 'NOTFOUND' });
      expect(Object.keys(noRoutes).length).to.eql(0);
    }).timeout(15_000);

    it(`Fetches warp deploy configs for ${registry.type} registry`, async () => {
      const routes = await registry.getWarpDeployConfigs();
      const routeIds = Object.keys(routes);

      // TODO: Right now this returns an empty array
      // This cannot be implemented without deriving the token symbol from config.token
      // We will revisit once we merge the configs
      if (registry.type === RegistryType.Partial) expect(routeIds.length).to.be.equal(0);
      else {
        expect(routeIds.length).to.be.greaterThan(0);
        const firstRoute = await registry.getWarpDeployConfig(routeIds[0]);
        const chains = Object.keys(firstRoute!);
        expect(chains.length).to.be.greaterThan(0);
        const noRoutes = await registry.getWarpDeployConfigs({ chainName: 'NOTFOUND' });
        expect(Object.keys(noRoutes).length).to.eql(0);
      }
    }).timeout(10_000);

    // TODO remove this once GitHubRegistry methods are implemented
    if (registry.type !== RegistryType.FileSystem) continue;

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
      expect(fs.existsSync(configPath)).to.be.true;
      fs.unlinkSync(configPath);
      fs.rmdirSync(`deployments/warp_routes/${MOCK_SYMBOL}`);
    }).timeout(5_000);

    it(`Adds a warp route for ${registry.type} registry using the provided symbol`, async () => {
      const MOCKED_OPTION_SYMBOL = 'OPTION';
      await registry.addWarpRoute(
        {
          tokens: [
            { chainName: MOCK_CHAIN_NAME, symbol: MOCK_SYMBOL, standard: 'EvmHypCollateral' },
            { chainName: MOCK_CHAIN_NAME2, symbol: MOCK_SYMBOL, standard: 'EvmHypSynthetic' },
          ] as any,
          options: {},
        },
        { symbol: MOCKED_OPTION_SYMBOL },
      );
      const outputBasePath = `deployments/warp_routes/${MOCKED_OPTION_SYMBOL}/${MOCK_CHAIN_NAME}-${MOCK_CHAIN_NAME2}-`;
      const configPath = `${outputBasePath}config.yaml`;
      expect(fs.existsSync(configPath)).to.be.true;
      fs.unlinkSync(configPath);
      fs.rmdirSync(`deployments/warp_routes/${MOCKED_OPTION_SYMBOL}`);
    }).timeout(5_000);
  }

  describe('MergedRegistry', async () => {
    it('Merges metadata from multiple registries', async () => {
      const mergedMetadata = await mergedRegistry.getMetadata();
      const localMetadata = await localRegistry.getMetadata();
      expect(mergedMetadata['ethereum'].chainId).to.eql(1);
      // Confirm the partial registry metadata is merged
      expect(mergedMetadata['ethereum'].displayName).to.eql(MOCK_DISPLAY_NAME);
      expect(localMetadata['ethereum'].displayName).to.not.eql(MOCK_DISPLAY_NAME);
      // Confirm other chains are not affected
      expect(mergedMetadata['arbitrum']).to.eql(localMetadata['arbitrum']);
    });

    it('Merges addresses from multiple registries', async () => {
      const mergedAddresses = await mergedRegistry.getAddresses();
      const localAddresses = await localRegistry.getAddresses();
      // Confirm the partial registry metadata is merged
      expect(mergedAddresses['ethereum'].mailbox).to.eql(MOCK_ADDRESS);
      expect(localAddresses['ethereum'].mailbox).to.not.eql(MOCK_ADDRESS);
      // Confirm other chains are not affected
      expect(localAddresses['arbitrum']).to.eql(localAddresses['arbitrum']);
    });
  });

  describe('ProxiedGithubRegistry', () => {
    const proxyUrl = 'http://proxy.hyperlane.xyz';
    let proxiedGithubRegistry;
    let getApiRateLimitStub;
    beforeEach(() => {
      proxiedGithubRegistry = new GithubRegistry({ branch: GITHUB_REGISTRY_BRANCH, proxyUrl });
      getApiRateLimitStub = sinon.stub(proxiedGithubRegistry, 'getApiRateLimit');
    });
    afterEach(() => {
      sinon.restore();
    });
    it('always uses the public api if rate limit has been not been hit', async () => {
      getApiRateLimitStub.returns({ remaining: 10 });
      expect(await proxiedGithubRegistry.getApiUrl()).to.equal(
        `${GITHUB_API_URL}/repos/hyperlane-xyz/hyperlane-registry/git/trees/main?recursive=true`,
      );
    });

    it('should fallback to proxy url if public rate limit has been hit', async () => {
      getApiRateLimitStub.returns({ remaining: 0 });
      expect(await proxiedGithubRegistry.getApiUrl()).to.equal(
        `${proxyUrl}/repos/hyperlane-xyz/hyperlane-registry/git/trees/main?recursive=true`,
      );
    });
  });
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

describe('Warp routes file structure', () => {
  const localRegistry = new FileSystemRegistry({ uri: './' });
  const WARP_ROUTES_PATH = 'deployments/warp_routes';

  const findAddressesYaml = (dir: string): string | null => {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const path = `${dir}/${file}`;
        if (file === 'addresses.yaml') return path;
        if (fs.statSync(path).isDirectory()) {
          const result = findAddressesYaml(path);
          if (result) return result;
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  it('should not contain addresses.yaml files', async () => {
    const warpRoutes = await localRegistry.getWarpRoutes();
    expect(Object.keys(warpRoutes).length).to.be.greaterThan(0);

    const foundPath = findAddressesYaml(WARP_ROUTES_PATH);
    expect(foundPath, foundPath ? `Found addresses.yaml at: ${foundPath}` : '').to.be.null;
  });
});
