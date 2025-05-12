import { RegistryService } from './registryService.js';
import { AbstractService } from './baseService.js';

export class RootService extends AbstractService {
  constructor(registryService: RegistryService) {
    super(registryService);
  }

  async getMetadata() {
    return this.withRegistry(async (registry) => {
      return registry.getMetadata();
    });
  }

  async getAddresses() {
    return this.withRegistry(async (registry) => {
      return registry.getAddresses();
    });
  }

  async getChains() {
    return this.withRegistry(async (registry) => {
      return registry.getChains();
    });
  }

  async listRegistryContent() {
    return this.withRegistry(async (registry) => {
      return registry.listRegistryContent();
    });
  }
}
