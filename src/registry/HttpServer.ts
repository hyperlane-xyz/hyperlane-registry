import { ChainMetadata, ChainName } from '@hyperlane-xyz/sdk';
import express, { Express } from 'express';
import { IRegistry } from './IRegistry.js';

export class HttpServer {
  app: Express;

  constructor(registry: IRegistry) {
    this.app = express();
    this.app.use(express.json());

    this.app.get('/metadata', async (req, res) => {
      try {
        const metadata = await registry.getMetadata();
        if (!metadata) {
          return res.status(404).json({ error: 'Metadata not found' });
        }
        return res.json(metadata);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return res.status(500).json({ error: errorMessage });
      }
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

    this.app.get('/addresses', async (req, res) => {
      try {
        const addresses = await registry.getAddresses();
        if (!addresses) {
          return res.status(404).json({ error: 'Addresses not found' });
        }
        return res.json(addresses);
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
