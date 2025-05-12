import { Router, Request, Response } from 'express';
import { RootService } from '../services/rootService.js';

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

  return router;
}
