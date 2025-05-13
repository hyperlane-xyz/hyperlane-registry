import type { Logger } from 'pino';

import express, { Express } from 'express';
import { IRegistry } from '../registry/IRegistry.js';
import { DEFAULT_PORT, DEFAULT_REFRESH_INTERVAL } from './src/constants/ServerConstants.js';
import { createErrorHandler } from './src/middleware/errorHandler.js';
import { createWarpRouter } from './src/routes/warp.js';
import { WarpService } from './src/services/warpService.js';
import { RegistryService } from './src/services/registryService.js';
import { createRootRouter } from './src/routes/root.js';
import { RootService } from './src/services/rootService.js';
import { createChainRouter } from './src/routes/chain.js';
import { ChainService } from './src/services/chainService.js';

export class HttpServer {
  app: Express;
  protected logger: Logger | Console;

  constructor(protected getRegistry: () => Promise<IRegistry>, logger?: Logger) {
    this.app = express();
    this.app.use(express.json());
    this.logger = logger || console;
  }

  async start(port = DEFAULT_PORT, refreshInterval = DEFAULT_REFRESH_INTERVAL) {
    try {
      const registryService = new RegistryService(this.getRegistry, refreshInterval, this.logger);
      await registryService.initialize();

      this.app.use('/', createRootRouter(new RootService(registryService)));
      this.app.use('/chain', createChainRouter(new ChainService(registryService)));
      this.app.use('/warp-route', createWarpRouter(new WarpService(registryService)));

      // add error handler to the end of the middleware stack
      this.app.use(createErrorHandler(this.logger));

      const server = this.app.listen(port, () =>
        this.logger.info(`Server running on port ${port}`),
      );

      server.on('request', (req, _res) => this.logger.info('Request:', req.url));

      server.on('error', (error) => this.logger.error('Server error:', error));
    } catch (error) {
      this.logger.error('Error starting server:', error);
      process.exit(1);
    }
  }
}
