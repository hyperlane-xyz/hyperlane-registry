import { ChainMetadataSchema, ChainName, ZChainName } from '@hyperlane-xyz/sdk';
import type { Logger } from 'pino';

import express, { Express } from 'express';
import { IRegistry } from './IRegistry.js';
import { WarpRouteId } from '../types.js';

const DEFAULT_PORT = 3000;
const DEFAULT_REFRESH_INTERVAL = 1000 * 60 * 5; // 5 minutes

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
        try {
          const content = await registry.listRegistryContent();
          return res.json(content);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          return res.status(500).json({ error: errorMessage });
        }
      });

      this.app.get('/chains', async (_req, res) => {
        try {
          const chains = await registry.getChains();
          return res.json(chains);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          return res.status(500).json({ error: errorMessage });
        }
      });

      this.app.get('/chain/:chain/metadata', async (req, res) => {
        try {
          const chainName = req.params.chain as ChainName;
          const metadata = await registry.getChainMetadata(chainName);
          if (!metadata) {
            return res.status(404).json({ error: 'Chain metadata not found' });
          }
          return res.json(metadata);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          return res.status(500).json({ error: errorMessage });
        }
      });

      this.app.post('/chain/:chain/metadata', async (req, res) => {
        try {
          const chainName = ZChainName.parse(req.params.chain);
          const metadata = ChainMetadataSchema.parse(req.body);
          await registry.updateChain({
            chainName,
            metadata,
          });
          return res.status(200).json({ message: 'Chain metadata updated successfully' });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          return res.status(500).json({ error: errorMessage });
        }
      });

      this.app.get('/chain/:chain/addresses', async (req, res) => {
        try {
          const chainName = req.params.chain as ChainName;
          const addresses = await registry.getChainAddresses(chainName);
          if (!addresses) {
            return res.status(404).json({ error: 'Chain addresses not found' });
          }
          return res.json(addresses);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          return res.status(500).json({ error: errorMessage });
        }
      });

      this.app.get('/warp-route/:id', async (req, res) => {
        try {
          const id = req.params.id as WarpRouteId;
          const warpRoute = await registry.getWarpRoute(id);
          if (!warpRoute) {
            return res.status(404).json({ error: 'Warp route not found' });
          }
          return res.json(warpRoute);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          return res.status(500).json({ error: errorMessage });
        }
      });

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
