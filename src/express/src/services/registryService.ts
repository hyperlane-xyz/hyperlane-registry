import { IRegistry } from '../../../registry/IRegistry.js';
import type { Logger } from 'pino';
export class RegistryService {
  private registry: IRegistry | null = null;
  private lastRefresh: number = Date.now();

  constructor(
    private readonly getRegistry: () => Promise<IRegistry>,
    private readonly refreshInterval: number,
    private readonly logger: Logger | Console,
  ) {}

  async initialize() {
    this.registry = await this.getRegistry();
  }

  async getCurrentRegistry(): Promise<IRegistry> {
    const now = Date.now();
    if (now - this.lastRefresh > this.refreshInterval || !this.registry) {
      this.logger.info('Refreshing registry cache...');
      this.registry = await this.getRegistry();
      this.lastRefresh = now;
    }

    return this.registry;
  }

  async withRegistry<T>(operation: (registry: IRegistry) => Promise<T>): Promise<T> {
    const registry = await this.getCurrentRegistry();
    return operation(registry);
  }
}
