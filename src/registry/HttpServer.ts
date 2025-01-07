import { ChainMetadata, ChainName } from '@hyperlane-xyz/sdk';
import express, { Express, Router } from 'express';
import { IRegistry } from './IRegistry.js';

export class HttpServer {
  app: Express;
  
  constructor(registry: IRegistry) {
    this.app = express();
    const router = Router();
    this.app.use(express.json());

    // Get chain metadata
    router.get('/metadata/:chain', async (req, res) => {
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

    router.post('/metadata/:chain', async (req, res) => {
      try {
        const chainName = req.params.chain as ChainName;
        const metadata = req.body as ChainMetadata;
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
  }

  start(port = process.env.PORT || 3000) {
    return new Promise<void>((resolve, reject) => {
      const server = this.app.listen(port, () => {
        process.stdout.write(`Server running on port ${port}\n`);
        resolve();
      });

      server.on('error', (error) => {
        reject(error);
      });
    });
  }
}
