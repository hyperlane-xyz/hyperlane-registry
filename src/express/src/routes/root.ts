import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { RootService } from '../services/rootService.js';
import { validateRequest } from '../middleware/validateRequest.js';

const warpRoutesQuerySchema = z
  .object({
    symbol: z.string().optional(),
    chainName: z.string().optional(),
  })
  .strict();

export function createRootRouter(rootService: RootService) {
  const router = Router();

  // get metadata
  router.get('/metadata', async (req: Request, res: Response) => {
    const metadata = await rootService.getMetadata();
    res.json(metadata);
  });

  // get addresses
  router.get('/addresses', async (req: Request, res: Response) => {
    const addresses = await rootService.getAddresses();
    res.json(addresses);
  });

  // get chains
  router.get('/chains', async (req: Request, res: Response) => {
    const chains = await rootService.getChains();
    res.json(chains);
  });

  // list registry content
  router.get('/list-registry-content', async (req: Request, res: Response) => {
    const content = await rootService.listRegistryContent();
    res.json(content);
  });

  // get warp routes
  router.get(
    '/warp-routes',
    validateRequest({ query: warpRoutesQuerySchema }),
    async (req: Request, res: Response) => {
      const filter = req.query;
      const warpRoutes = await rootService.getWarpRoutes(filter);
      res.json(warpRoutes);
    },
  );

  return router;
}
