import { ChainName, WarpCoreConfig } from '@hyperlane-xyz/sdk';
import express, { Express, Router } from 'express';
import { IRegistry, WarpRouteFilterParams } from './IRegistry.js';

export class HttpRegistry {
  app: Express;
  registry: IRegistry;

  constructor(registry: IRegistry) {
    this.registry = registry;

    this.app = express();
    const router = Router();
    this.app.use(express.json());

    // Get all registry content
    router.get('/content', async (req, res) => {
      try {
        const content = await registry.listRegistryContent();
        res.json(content);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ error: errorMessage });
      }
    });

    // Get all chains
    router.get('/chains', async (req, res) => {
      try {
        const chains = await registry.getChains();
        res.json(chains);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ error: errorMessage });
      }
    });

    // Get metadata
    router.get('/metadata', async (req, res) => {
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

    // Get addresses
    router.get('/addresses', async (req, res) => {
      try {
        const addresses = await registry.getAddresses();
        if (!addresses) {
          return res.status(404).json({ error: 'Chain addresses not found' });
        }
        return res.json(addresses);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return res.status(500).json({ error: errorMessage });
      }
    });

    // Get chain addresses
    router.get('/addresses/:chain', async (req, res) => {
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

    // Get chain logo URI
    router.get('/logo/:chain', async (req, res) => {
      try {
        const chainName = req.params.chain as ChainName;
        const logoUri = await registry.getChainLogoUri(chainName);
        if (!logoUri) {
          return res.status(404).json({ error: 'Chain logo not found' });
        }
        return res.json({ logoUri });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return res.status(500).json({ error: errorMessage });
      }
    });

    // Get warp route
    router.get('/warp-route/:id', async (req, res) => {
      try {
        const routeId = req.params.id;
        const route = await registry.getWarpRoute(routeId);
        if (!route) {
          return res.status(404).json({ error: 'Warp route not found' });
        }
        return res.json(route);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return res.status(500).json({ error: errorMessage });
      }
    });

    // Get filtered warp routes
    router.get('/warp-routes', async (req, res) => {
      try {
        const filter: WarpRouteFilterParams = {
          symbol: req.query.symbol as string,
          chainName: req.query.chainName as ChainName,
        };
        const routes = await registry.getWarpRoutes(filter);
        return res.json(routes);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return res.status(500).json({ error: errorMessage });
      }
    });

    // Add warp route
    router.post('/warp-route', async (req, res) => {
      try {
        const config: WarpCoreConfig = req.body;
        await registry.addWarpRoute(config);
        return res.status(201).json({ message: 'Warp route added successfully' });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return res.status(500).json({ error: errorMessage });
      }
    });

    this.app.use('/api', router);
  }

  serve(registry: IRegistry) {
    this.registry = registry;
  }

  start(port = process.env.PORT || 3000) {
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
}
