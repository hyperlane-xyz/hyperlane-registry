import { expect } from 'chai';
import { SignerType } from '@hyperlane-xyz/sdk';

import {
  FoundryKeystoreRegistry,
  parseFoundryKeystoreUri,
} from '../../src/registry/FoundryKeystoreRegistry.js';
import { RegistryType } from '../../src/registry/IRegistry.js';

describe('FoundryKeystoreRegistry', () => {
  describe('parseFoundryKeystoreUri', () => {
    it('should parse simple account name URI', () => {
      const result = parseFoundryKeystoreUri('foundry://deployer');
      expect(result).to.deep.equal({
        accountName: 'deployer',
      });
    });

    it('should parse URI with absolute path', () => {
      const result = parseFoundryKeystoreUri('foundry:///home/user/.foundry/keystores/deployer');
      expect(result).to.deep.equal({
        accountName: 'deployer',
        keystorePath: '/home/user/.foundry/keystores',
      });
    });

    it('should parse URI with complex absolute path', () => {
      const result = parseFoundryKeystoreUri('foundry:///custom/path/to/keystores/my-account');
      expect(result).to.deep.equal({
        accountName: 'my-account',
        keystorePath: '/custom/path/to/keystores',
      });
    });

    it('should return null for non-foundry URI', () => {
      expect(parseFoundryKeystoreUri('https://example.com')).to.be.null;
      expect(parseFoundryKeystoreUri('gcp://project/secret')).to.be.null;
      expect(parseFoundryKeystoreUri('file:///path/to/file')).to.be.null;
      expect(parseFoundryKeystoreUri('/local/path')).to.be.null;
    });

    it('should return null for malformed foundry URI', () => {
      expect(parseFoundryKeystoreUri('foundry://')).to.be.null;
      expect(parseFoundryKeystoreUri('foundry:///')).to.be.null;
      expect(parseFoundryKeystoreUri('foundry:///accountName')).to.be.null; // No directory, just root + filename
    });

    it('should return null for relative path in URI', () => {
      // Relative paths with slashes are not allowed
      expect(parseFoundryKeystoreUri('foundry://path/to/account')).to.be.null;
    });
  });

  describe('constructor', () => {
    it('should create registry with simple account name', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry://deployer',
      });

      expect(registry.uri).to.equal('foundry://deployer');
      expect(registry.type).to.equal(RegistryType.Partial);
    });

    it('should create registry with absolute path', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry:///custom/keystores/deployer',
      });

      expect(registry.uri).to.equal('foundry:///custom/keystores/deployer');
      expect(registry.type).to.equal(RegistryType.Partial);
    });

    it('should use default signer name when not specified', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry://deployer',
      });

      const config = registry.getSignerConfiguration();
      expect(config.signers).to.have.property('default');
    });

    it('should use custom signer name when specified', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry://deployer',
        signerName: 'prod-deployer',
      });

      const config = registry.getSignerConfiguration();
      expect(config.signers).to.have.property('prod-deployer');
      expect(config.signers).to.not.have.property('default');
    });

    it('should throw error for invalid URI', () => {
      expect(
        () => new FoundryKeystoreRegistry({ uri: 'invalid://uri' }),
      ).to.throw('Invalid Foundry keystore registry URI');

      expect(
        () => new FoundryKeystoreRegistry({ uri: 'foundry://' }),
      ).to.throw('Invalid Foundry keystore registry URI');
    });
  });

  describe('getSignerConfiguration', () => {
    it('should return configuration with FOUNDRY_KEYSTORE signer (simple)', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry://deployer',
        signerName: 'prod',
      });

      const config = registry.getSignerConfiguration();

      expect(config.signers).to.deep.equal({
        prod: {
          type: SignerType.FOUNDRY_KEYSTORE,
          accountName: 'deployer',
        },
      });

      expect(config.defaults).to.deep.equal({
        default: { ref: 'prod' },
      });
    });

    it('should return configuration with FOUNDRY_KEYSTORE signer (with path)', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry:///custom/path/deployer',
        signerName: 'custom',
      });

      const config = registry.getSignerConfiguration();

      expect(config.signers).to.deep.equal({
        custom: {
          type: SignerType.FOUNDRY_KEYSTORE,
          accountName: 'deployer',
          keystorePath: '/custom/path',
        },
      });
    });

    it('should include passwordEnvVar when specified', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry://deployer',
        signerName: 'secure',
        passwordEnvVar: 'MY_KEYSTORE_PASSWORD',
      });

      const config = registry.getSignerConfiguration();

      expect(config.signers).to.deep.equal({
        secure: {
          type: SignerType.FOUNDRY_KEYSTORE,
          accountName: 'deployer',
          passwordEnvVar: 'MY_KEYSTORE_PASSWORD',
        },
      });
    });

    it('should include passwordFile when specified', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry://deployer',
        signerName: 'file-based',
        passwordFile: '/path/to/password-file',
      });

      const config = registry.getSignerConfiguration();

      expect(config.signers).to.deep.equal({
        'file-based': {
          type: SignerType.FOUNDRY_KEYSTORE,
          accountName: 'deployer',
          passwordFile: '/path/to/password-file',
        },
      });
    });

    it('should include both passwordFile and keystorePath when specified', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry:///custom/keystores/deployer',
        signerName: 'full',
        passwordFile: '/secrets/password',
      });

      const config = registry.getSignerConfiguration();

      expect(config.signers).to.deep.equal({
        full: {
          type: SignerType.FOUNDRY_KEYSTORE,
          accountName: 'deployer',
          keystorePath: '/custom/keystores',
          passwordFile: '/secrets/password',
        },
      });
    });
  });

  describe('getSigners', () => {
    it('should return all signers', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry://my-account',
        signerName: 'main',
      });

      const signers = registry.getSigners();

      expect(signers).to.deep.equal({
        main: {
          type: SignerType.FOUNDRY_KEYSTORE,
          accountName: 'my-account',
        },
      });
    });
  });

  describe('getSigner', () => {
    it('should return signer by name', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry://deployer',
        signerName: 'deployer',
      });

      const signer = registry.getSigner('deployer');

      expect(signer).to.deep.equal({
        type: SignerType.FOUNDRY_KEYSTORE,
        accountName: 'deployer',
      });
    });

    it('should return null for unknown signer name', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry://deployer',
        signerName: 'deployer',
      });

      expect(registry.getSigner('unknown')).to.be.null;
    });
  });

  describe('getDefaultSigner', () => {
    it('should return the Foundry keystore signer regardless of chain', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry://deployer',
      });

      const signer = registry.getDefaultSigner('ethereum');

      expect(signer).to.deep.equal({
        type: SignerType.FOUNDRY_KEYSTORE,
        accountName: 'deployer',
      });
    });

    it('should return the Foundry keystore signer when no chain specified', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry://deployer',
      });

      const signer = registry.getDefaultSigner();

      expect(signer).to.deep.equal({
        type: SignerType.FOUNDRY_KEYSTORE,
        accountName: 'deployer',
      });
    });
  });

  describe('non-signer methods', () => {
    let registry: FoundryKeystoreRegistry;

    beforeEach(() => {
      registry = new FoundryKeystoreRegistry({
        uri: 'foundry://deployer',
      });
    });

    it('should return empty chains', () => {
      expect(registry.getChains()).to.deep.equal([]);
    });

    it('should return empty metadata', () => {
      expect(registry.getMetadata()).to.deep.equal({});
    });

    it('should return null for chain metadata', () => {
      expect(registry.getChainMetadata('ethereum')).to.be.null;
    });

    it('should return empty addresses', () => {
      expect(registry.getAddresses()).to.deep.equal({});
    });

    it('should return null for chain addresses', () => {
      expect(registry.getChainAddresses('ethereum')).to.be.null;
    });

    it('should return empty warp routes', () => {
      expect(registry.getWarpRoutes()).to.deep.equal({});
    });

    it('should return null for specific warp route', () => {
      expect(registry.getWarpRoute('some-route')).to.be.null;
    });

    it('should return empty registry content', () => {
      const content = registry.listRegistryContent();
      expect(content).to.deep.equal({
        chains: {},
        deployments: {
          warpRoutes: {},
          warpDeployConfig: {},
        },
      });
    });

    it('should throw error for unsupported write operations', () => {
      expect(() => registry.addChain({ chainName: 'test' })).to.throw(
        'does not support',
      );
      expect(() => registry.updateChain({ chainName: 'test' })).to.throw(
        'does not support',
      );
      expect(() => registry.removeChain('test')).to.throw('does not support');
      expect(() => registry.addWarpRoute({} as any)).to.throw(
        'does not support',
      );
    });
  });

  describe('getUri', () => {
    it('should return URI without path', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry://deployer',
      });

      expect(registry.getUri()).to.equal('foundry://deployer');
    });

    it('should append path when specified', () => {
      const registry = new FoundryKeystoreRegistry({
        uri: 'foundry://deployer',
      });

      expect(registry.getUri('some/path')).to.equal(
        'foundry://deployer/some/path',
      );
    });
  });

  describe('merge', () => {
    it('should create MergedRegistry when merging', () => {
      const registry1 = new FoundryKeystoreRegistry({
        uri: 'foundry://deployer1',
      });
      const registry2 = new FoundryKeystoreRegistry({
        uri: 'foundry://deployer2',
      });

      const merged = registry1.merge(registry2);

      expect(merged.type).to.equal(RegistryType.Merged);
    });
  });
});
