/* eslint-disable @typescript-eslint/no-explicit-any */
import { use as chaiUse, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import type { ChainMetadata } from '@hyperlane-xyz/sdk';
import type { Logger } from 'pino';
import fs from 'fs';
import { CHAIN_FILE_REGEX } from '../../src/consts.js';
import { FileSystemRegistry } from '../../src/registry/FileSystemRegistry.js';
import { GITHUB_API_URL, GithubRegistry } from '../../src/registry/GithubRegistry.js';
import { RegistryType } from '../../src/registry/IRegistry.js';
import { MergedRegistry } from '../../src/registry/MergedRegistry.js';
import { PartialRegistry } from '../../src/registry/PartialRegistry.js';
import { ChainAddresses } from '../../src/types.js';
import { getRegistry } from '../../src/registry/registry-utils.js';
import { DEFAULT_GITHUB_REGISTRY, PROXY_DEPLOYED_URL } from '../../src/consts.js';
import { parseGitHubPath } from '../../src/utils.js';

const GITHUB_REGISTRY_BRANCH = 'main';

const MOCK_CHAIN_NAME = 'mockchain';
const MOCK_CHAIN_NAME2 = 'mockchain2';
const MOCK_DISPLAY_NAME = 'faketherum';
const MOCK_SYMBOL = 'MOCK';
const MOCK_ADDRESS = '0x0000000000000000000000000000000000000001';

// Used to verify the GithubRegistry is fetching the correct data
// Must be kept in sync with value in canonical registry's main branch
const ETH_MAILBOX_ADDRESS = '0xc005dc82818d67AF737725bD4bf75435d065D239';

chaiUse(chaiAsPromised);

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
    let proxiedGithubRegistry: GithubRegistry;
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

  describe('Authenticated GithubRegistry', () => {
    const proxyUrl = 'http://proxy.hyperlane.xyz';
    let authenticatedGithubRegistry: GithubRegistry;
    let invalidTokenGithubRegistry: GithubRegistry;
    let getApiRateLimitStub: sinon.SinonStub;
    beforeEach(() => {
      authenticatedGithubRegistry = new GithubRegistry({
        branch: GITHUB_REGISTRY_BRANCH,
        proxyUrl,
        authToken: process.env.GITHUB_TOKEN,
      });
      invalidTokenGithubRegistry = new GithubRegistry({
        branch: GITHUB_REGISTRY_BRANCH,
        proxyUrl,
        authToken: 'invalid_token',
      });
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should fetch chains with authenticated token', async function () {
      if (!process.env.GITHUB_TOKEN) {
        console.log('Skipping this test because GITHUB_TOKEN is not defined');
        this.skip();
      }
      return expect(authenticatedGithubRegistry.getChains()).to.eventually.be.fulfilled;
    });

    it('should fail fetching chains with invalid authentication token', async () => {
      return expect(invalidTokenGithubRegistry.getChains()).to.eventually.be.rejected;
    });

    describe('GitHub API rate limit handling and fallback behavior:', () => {
      beforeEach(() => {
        getApiRateLimitStub = sinon.stub(authenticatedGithubRegistry, 'getApiRateLimit');
      });
      it('always uses the authenticated api if rate limit has been not been hit', async () => {
        getApiRateLimitStub.resolves({ limit: 100, used: 90, remaining: 10, reset: 1234567890 });
        expect(await authenticatedGithubRegistry.getApiUrl()).to.equal(
          `${GITHUB_API_URL}/repos/hyperlane-xyz/hyperlane-registry/git/trees/main?recursive=true`,
        );
      });

      it('should fallback to proxy url if public rate limit has been hit', async () => {
        getApiRateLimitStub.resolves({ limit: 100, used: 100, remaining: 0, reset: 1234567890 });
        expect(await authenticatedGithubRegistry.getApiUrl()).to.equal(
          `${proxyUrl}/repos/hyperlane-xyz/hyperlane-registry/git/trees/main?recursive=true`,
        );
      });
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

describe('Registry Utils', () => {
  // Mock logger
  const logger: Logger = {
    child: () => ({ info: () => {}, child: () => ({ info: () => {} }) }),
  } as any;

  const localPath = './';
  const githubUrl = 'https://github.com/hyperlane-xyz/hyperlane-registry';

  describe('getRegistry', () => {
    type TestCase = {
      name: string;
      uris: string[];
      useProxy: boolean;
      branch?: string;
      expectedRegistries: {
        type: any;
        uri: string;
        proxyUrl?: string;
        branch?: string;
      }[];
    };

    const testCases: TestCase[] = [
      {
        name: 'FileSystemRegistry for local path',
        uris: [localPath],
        useProxy: false,
        expectedRegistries: [{ type: FileSystemRegistry, uri: localPath }],
      },
      {
        name: 'GithubRegistry for HTTPS URLs',
        uris: [githubUrl],
        useProxy: false,
        expectedRegistries: [{ type: GithubRegistry, uri: githubUrl, branch: 'main' }],
      },
      {
        name: 'proxied GithubRegistry for canonical repo',
        uris: [DEFAULT_GITHUB_REGISTRY],
        useProxy: true,
        expectedRegistries: [
          {
            type: GithubRegistry,
            uri: DEFAULT_GITHUB_REGISTRY,
            proxyUrl: PROXY_DEPLOYED_URL,
            branch: 'main',
          },
        ],
      },
      {
        name: 'non-proxied GithubRegistry for non-canonical repos',
        uris: ['https://github.com/user/test'],
        useProxy: false,
        expectedRegistries: [
          { type: GithubRegistry, uri: 'https://github.com/user/test', branch: 'main' },
        ],
      },
      {
        name: 'FileSystemRegistry for non-HTTPS URLs',
        uris: ['local/path'],
        useProxy: false,
        expectedRegistries: [{ type: FileSystemRegistry, uri: 'local/path' }],
      },
      {
        name: 'multiple URIs with mixed types',
        uris: [githubUrl, localPath],
        useProxy: false,
        expectedRegistries: [
          { type: GithubRegistry, uri: githubUrl, branch: 'main' },
          { type: FileSystemRegistry, uri: localPath },
        ],
      },
      {
        name: 'mixed registry types with proxy settings',
        uris: [DEFAULT_GITHUB_REGISTRY, localPath, 'https://github.com/user/test'],
        useProxy: true,
        expectedRegistries: [
          {
            type: GithubRegistry,
            uri: DEFAULT_GITHUB_REGISTRY,
            proxyUrl: PROXY_DEPLOYED_URL,
            branch: 'main',
          },
          { type: FileSystemRegistry, uri: localPath },
          {
            type: GithubRegistry,
            uri: 'https://github.com/user/test',
            branch: 'main',
            proxyUrl: PROXY_DEPLOYED_URL,
          },
        ],
      },
      {
        name: 'non-proxied GithubRegistry with branch',
        uris: ['https://github.com/user/test/tree/branch'],
        useProxy: false,
        expectedRegistries: [
          {
            type: GithubRegistry,
            uri: 'https://github.com/user/test/tree/branch',
            branch: 'branch',
          },
        ],
      },
      {
        name: 'non-proxied GithubRegistry with branch in constructor',
        uris: ['https://github.com/user/test'],
        useProxy: false,
        branch: 'constructor-branch',
        expectedRegistries: [
          {
            type: GithubRegistry,
            uri: 'https://github.com/user/test',
            branch: 'constructor-branch',
          },
        ],
      },
    ];

    testCases.forEach(({ name, uris, useProxy, branch, expectedRegistries }) => {
      it(name, () => {
        const registry = getRegistry({
          registryUris: uris,
          enableProxy: useProxy,
          branch,
          logger,
        }) as MergedRegistry;
        expect(registry).to.be.instanceOf(MergedRegistry);
        expect(registry.registries.length).to.equal(expectedRegistries.length);

        registry.registries.forEach((reg, idx) => {
          const expected = expectedRegistries[idx];
          expect(reg).to.be.instanceOf(expected.type);
          expect(reg.uri).to.equal(expected.uri);
          if (reg instanceof GithubRegistry) {
            expect(reg.proxyUrl).to.equal(expected.proxyUrl);
            expect(reg.branch).to.equal(expected.branch);
          }
          expect(reg).to.have.property('logger');
        });
      });
    });

    const randomOwner = faker.internet.displayName();
    const randomName = faker.internet.domainWord();

    it(`should be able to parse a pathname with no branch`, () => {
      const url = `https://github.com/${randomOwner}/${randomName}`;
      const { repoOwner, repoName, repoBranch } = parseGitHubPath(url);
      expect(repoOwner).to.equal(randomOwner);
      expect(repoName).to.equal(randomName);
      expect(repoBranch).to.be.undefined;
    });

    it(`should be able to parse a pathname with commit hash`, () => {
      const randomCommitHash = faker.string.hexadecimal({ length: 40 });
      const url = `https://github.com/${randomOwner}/${randomName}/tree/${randomCommitHash}`;
      const { repoOwner, repoName, repoBranch } = parseGitHubPath(url);
      expect(repoOwner).to.equal(randomOwner);
      expect(repoName).to.equal(randomName);
      expect(repoBranch).to.equal(randomCommitHash);
    });

    it(`should be able to parse user with branch name`, () => {
      const randomBranch = `owner/asset/${faker.git.branch()}`;
      const url = `https://github.com/${randomOwner}/${randomName}/tree/${randomBranch}`;
      const { repoOwner, repoName, repoBranch } = parseGitHubPath(url);
      expect(repoOwner).to.equal(randomOwner);
      expect(repoName).to.equal(randomName);
      expect(repoBranch).to.equal(randomBranch);
    });

    it('throws error for empty URIs array', () => {
      expect(() => getRegistry({ registryUris: [], enableProxy: true, logger })).to.throw(
        'At least one registry URI is required',
      );
      expect(() => getRegistry({ registryUris: [''], enableProxy: true, logger })).to.throw(
        'At least one registry URI is required',
      );
      expect(() => getRegistry({ registryUris: ['   '], enableProxy: true, logger })).to.throw(
        'At least one registry URI is required',
      );
    });

    it('throws error if both option.branch is set and url includes a branch for GithubRegistry', () => {
      expect(() =>
        getRegistry({
          registryUris: ['https://github.com/user/test/tree/branch'],
          enableProxy: false,
          branch: 'main',
        }),
      ).to.throw('Branch is set in both options and url.');
    });
  });
});
