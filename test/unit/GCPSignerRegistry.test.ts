import { expect } from 'chai';
import { SignerType } from '@hyperlane-xyz/sdk';

import {
  GCPSignerRegistry,
  parseGCPUri,
} from '../../src/registry/GCPSignerRegistry.js';
import { RegistryType } from '../../src/registry/IRegistry.js';

describe('GCPSignerRegistry', () => {
  describe('parseGCPUri', () => {
    it('should parse valid GCP URI', () => {
      const result = parseGCPUri('gcp://my-project/my-secret');
      expect(result).to.deep.equal({
        project: 'my-project',
        secretName: 'my-secret',
      });
    });

    it('should parse URI with complex project name', () => {
      const result = parseGCPUri('gcp://my-org-project-123/deployer-key');
      expect(result).to.deep.equal({
        project: 'my-org-project-123',
        secretName: 'deployer-key',
      });
    });

    it('should parse URI with path-like secret name', () => {
      const result = parseGCPUri('gcp://project/secrets/prod/deployer');
      expect(result).to.deep.equal({
        project: 'project',
        secretName: 'secrets/prod/deployer',
      });
    });

    it('should return null for non-GCP URI', () => {
      expect(parseGCPUri('https://example.com')).to.be.null;
      expect(parseGCPUri('file:///path/to/file')).to.be.null;
      expect(parseGCPUri('/local/path')).to.be.null;
    });

    it('should return null for malformed GCP URI', () => {
      expect(parseGCPUri('gcp://')).to.be.null;
      expect(parseGCPUri('gcp://project')).to.be.null;
      expect(parseGCPUri('gcp://project/')).to.be.null;
      expect(parseGCPUri('gcp:///secret')).to.be.null;
    });
  });

  describe('constructor', () => {
    it('should create registry with valid URI', () => {
      const registry = new GCPSignerRegistry({
        uri: 'gcp://my-project/my-secret',
      });

      expect(registry.uri).to.equal('gcp://my-project/my-secret');
      expect(registry.type).to.equal(RegistryType.Partial);
    });

    it('should use default signer name when not specified', () => {
      const registry = new GCPSignerRegistry({
        uri: 'gcp://my-project/my-secret',
      });

      const config = registry.getSignerConfiguration();
      expect(config.signers).to.have.property('default');
    });

    it('should use custom signer name when specified', () => {
      const registry = new GCPSignerRegistry({
        uri: 'gcp://my-project/my-secret',
        signerName: 'deployer',
      });

      const config = registry.getSignerConfiguration();
      expect(config.signers).to.have.property('deployer');
      expect(config.signers).to.not.have.property('default');
    });

    it('should throw error for invalid URI', () => {
      expect(
        () => new GCPSignerRegistry({ uri: 'invalid://uri' }),
      ).to.throw('Invalid GCP registry URI');

      expect(
        () => new GCPSignerRegistry({ uri: 'gcp://project-only' }),
      ).to.throw('Invalid GCP registry URI');
    });
  });

  describe('getSignerConfiguration', () => {
    it('should return configuration with GCP_SECRET signer', () => {
      const registry = new GCPSignerRegistry({
        uri: 'gcp://my-project/my-secret',
        signerName: 'prod',
      });

      const config = registry.getSignerConfiguration();

      expect(config.signers).to.deep.equal({
        prod: {
          type: SignerType.GCP_SECRET,
          project: 'my-project',
          secretName: 'my-secret',
        },
      });

      expect(config.defaults).to.deep.equal({
        default: { ref: 'prod' },
      });
    });
  });

  describe('getSigners', () => {
    it('should return all signers', () => {
      const registry = new GCPSignerRegistry({
        uri: 'gcp://project/secret',
        signerName: 'main',
      });

      const signers = registry.getSigners();

      expect(signers).to.deep.equal({
        main: {
          type: SignerType.GCP_SECRET,
          project: 'project',
          secretName: 'secret',
        },
      });
    });
  });

  describe('getSigner', () => {
    it('should return signer by name', () => {
      const registry = new GCPSignerRegistry({
        uri: 'gcp://project/secret',
        signerName: 'deployer',
      });

      const signer = registry.getSigner('deployer');

      expect(signer).to.deep.equal({
        type: SignerType.GCP_SECRET,
        project: 'project',
        secretName: 'secret',
      });
    });

    it('should return null for unknown signer name', () => {
      const registry = new GCPSignerRegistry({
        uri: 'gcp://project/secret',
        signerName: 'deployer',
      });

      expect(registry.getSigner('unknown')).to.be.null;
    });
  });

  describe('getDefaultSigner', () => {
    it('should return the GCP signer regardless of chain', () => {
      const registry = new GCPSignerRegistry({
        uri: 'gcp://project/secret',
      });

      const signer = registry.getDefaultSigner('ethereum');

      expect(signer).to.deep.equal({
        type: SignerType.GCP_SECRET,
        project: 'project',
        secretName: 'secret',
      });
    });

    it('should return the GCP signer when no chain specified', () => {
      const registry = new GCPSignerRegistry({
        uri: 'gcp://project/secret',
      });

      const signer = registry.getDefaultSigner();

      expect(signer).to.deep.equal({
        type: SignerType.GCP_SECRET,
        project: 'project',
        secretName: 'secret',
      });
    });
  });

  describe('non-signer methods', () => {
    let registry: GCPSignerRegistry;

    beforeEach(() => {
      registry = new GCPSignerRegistry({
        uri: 'gcp://project/secret',
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
      const registry = new GCPSignerRegistry({
        uri: 'gcp://project/secret',
      });

      expect(registry.getUri()).to.equal('gcp://project/secret');
    });

    it('should append path when specified', () => {
      const registry = new GCPSignerRegistry({
        uri: 'gcp://project/secret',
      });

      expect(registry.getUri('some/path')).to.equal(
        'gcp://project/secret/some/path',
      );
    });
  });

  describe('merge', () => {
    it('should create MergedRegistry when merging', () => {
      const registry1 = new GCPSignerRegistry({
        uri: 'gcp://project1/secret1',
      });
      const registry2 = new GCPSignerRegistry({
        uri: 'gcp://project2/secret2',
      });

      const merged = registry1.merge(registry2);

      expect(merged.type).to.equal(RegistryType.Merged);
    });
  });
});
