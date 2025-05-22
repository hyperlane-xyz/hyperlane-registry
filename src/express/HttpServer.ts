import type { Logger } from 'pino';

import express, { Express, Request, Response } from 'express';
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
    this.logger = logger || console;
    this.app = express();
    this.app.set('trust proxy', true); // trust proxy for x-forwarded-for header
    this.app.use(express.json());
  }

  async start(
    port = parseInt(process.env.PORT || DEFAULT_PORT.toString()),
    refreshInterval = parseInt(process.env.REFRESH_INTERVAL || DEFAULT_REFRESH_INTERVAL.toString()),
  ) {
    try {
      const registryService = new RegistryService(this.getRegistry, refreshInterval, this.logger);
      await registryService.initialize();

      // add health check routes
      this.app.use('/health', (_req: Request, res: Response) => void res.sendStatus(200));
      this.app.use('/readiness', (_req: Request, res: Response) => void res.sendStatus(200));

      // add routes
      this.app.use('/', createRootRouter(new RootService(registryService)));
      this.app.use('/chain', createChainRouter(new ChainService(registryService)));
      this.app.use('/warp-route', createWarpRouter(new WarpService(registryService)));

      // add error handler to the end of the middleware stack
      this.app.use(createErrorHandler(this.logger));

      const host = process.env.HOST || '127.0.0.1';
      const server = this.app.listen(port, host, () =>
        this.logger.info(`Server running on port ${port}`),
      );

      server.on('request', (req, _res) => this.logger.info('Request:', req.url));
      server.on('error', (error) => this.logger.error('Server error:', error));

      // add shutdown handler
      const shutdown = () => {
        this.logger.info('Shutting down…');
        server.close(() => process.exit(0));
      };
      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
    } catch (error) {
      this.logger.error('Error starting server:', error);
      process.exit(1);
    }
  }
}
