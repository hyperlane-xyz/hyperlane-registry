import { ChainMetadata, ChainName } from '@hyperlane-xyz/sdk';
import { RegistryService } from './registryService.js';
import { NotFoundError } from '../errors/ApiError.js';
import { AbstractService } from './abstractService.js';

export class ChainService extends AbstractService {
  constructor(registryService: RegistryService) {
    super(registryService);
  }

  async getChainMetadata(chainName: ChainName) {
    return this.withRegistry(async (registry) => {
      const metadata = await registry.getChainMetadata(chainName);
      if (!metadata) {
        throw new NotFoundError(`Chain metadata not found for chain ${chainName}`);
      }
      return metadata;
    });
  }

  async getChainAddresses(chainName: ChainName) {
    return this.withRegistry(async (registry) => {
      const addresses = await registry.getChainAddresses(chainName);
      if (!addresses) {
        throw new NotFoundError(`Chain addresses not found for chain ${chainName}`);
      }
      return addresses;
    });
  }

  async setChainMetadata(chainName: ChainName, metadata: ChainMetadata) {
    return this.withRegistry(async (registry) => {
      return registry.updateChain({ chainName, metadata });
    });
  }
}
