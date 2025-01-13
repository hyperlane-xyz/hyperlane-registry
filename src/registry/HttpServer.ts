import { ChainMetadataSchema, ChainName, ZChainName } from '@hyperlane-xyz/sdk';
import express, { Express } from 'express';
import { IRegistry } from './IRegistry.js';

export class HttpServer {
  app: Express;

  constructor(protected getRegistry: () => Promise<IRegistry>) {
    this.app = express();
    this.app.use(express.json());
  }

  start(port = process.env.PORT || 3000, refreshInterval = 1000 * 60 * 5) {
    let registry: IRegistry;
    let lastRequest = Date.now();

    this.app.use('/', async (_req, res, next) => {
      const now = Date.now();
      if (now - lastRequest > refreshInterval) {
        console.log('Refreshing registry cache...');
        registry = await this.getRegistry();
      }

      lastRequest = now;

      return next();
    });

    this.app.get('/metadata', async (_req, res) => {
      const metadata = await registry.getMetadata();
      return res.json(metadata);
    });

    // Get chain metadata
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

    this.app.get('/addresses', async (_req, res) => {
      const addresses = await registry.getAddresses();
      return res.json(addresses);
    });

    const server = this.app.listen(port, () => console.log(`Server running on port ${port}`));

    server.on('request', (req, _res) => console.log('Request:', req.url));

    server.on('error', (error) => console.error('Server error:', error));
  }
}
