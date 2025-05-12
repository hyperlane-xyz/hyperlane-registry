import { ChainMetadataSchema, ChainName, ZChainName } from '@hyperlane-xyz/sdk';
import type { Logger } from 'pino';

import express, { Express } from 'express';
import { IRegistry } from '../registry/IRegistry.js';
import { WarpRouteId } from '../types.js';
import { DEFAULT_PORT, DEFAULT_REFRESH_INTERVAL } from './src/constants/ServerConstants.js';
import { NotFoundError } from './src/errors/ApiError.js';
import { errorHandler } from './src/middleware/errorHandler.js';

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
      let registry = await this.getRegistry();

      let lastRequest = Date.now();
      this.app.use('/', async (_req, _res, next) => {
        const now = Date.now();
        if (now - lastRequest > refreshInterval) {
          this.logger.info('Refreshing registry cache...');
          registry = await this.getRegistry();
        }

        lastRequest = now;

        return next();
      });

      this.app.get('/metadata', async (_req, res) => {
        const metadata = await registry.getMetadata();
        return res.json(metadata);
      });

      this.app.get('/addresses', async (_req, res) => {
        const addresses = await registry.getAddresses();
        return res.json(addresses);
      });

      this.app.get('/list-registry-content', async (_req, res) => {
        const content = await registry.listRegistryContent();
        return res.json(content);
      });

      this.app.get('/chains', async (_req, res) => {
        const chains = await registry.getChains();
        return res.json(chains);
      });

      this.app.get('/chain/:chain/metadata', async (req, res) => {
        const chainName = req.params.chain as ChainName;
        const metadata = await registry.getChainMetadata(chainName);
        if (!metadata) {
          throw new NotFoundError(`Chain metadata not found for chain ${chainName}`);
        }
        return res.json(metadata);
      });

      this.app.post('/chain/:chain/metadata', async (req, res) => {
        const chainName = ZChainName.parse(req.params.chain);
        const metadata = ChainMetadataSchema.parse(req.body);
        await registry.updateChain({
          chainName,
          metadata,
        });
        return res.status(200).json({ message: 'Chain metadata updated successfully' });
      });

      this.app.get('/chain/:chain/addresses', async (req, res) => {
        const chainName = req.params.chain as ChainName;
        const addresses = await registry.getChainAddresses(chainName);
        if (!addresses) {
          throw new NotFoundError(`Chain addresses not found for chain ${chainName}`);
        }
        return res.json(addresses);
      });

      this.app.get('/warp-route/:id', async (req, res) => {
        const id = req.params.id as WarpRouteId;
        const warpRoute = await registry.getWarpRoute(id);
        if (!warpRoute) {
          throw new NotFoundError(`Warp route not found for id ${id}`);
        }
        return res.json(warpRoute);
      });

      // add error handler to the end of the middleware stack
      this.app.use(errorHandler);

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
