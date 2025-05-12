import { Router, Request, Response } from 'express';
import { ChainService } from '../services/chainService.js';
import { ChainMetadataSchema, ChainName, ZChainName } from '@hyperlane-xyz/sdk';

interface ChainRequestParams {
  chain: ChainName;
}

export function createChainRouter(chainService: ChainService) {
  const router = Router();

  router.get('/:chain/metadata', async (req: Request<ChainRequestParams>, res: Response) => {
    const metadata = await chainService.getChainMetadata(req.params.chain);
    res.json(metadata);
  });

  router.post('/:chain/metadata', async (req: Request<ChainRequestParams>, res: Response) => {
    const chain = ZChainName.parse(req.params.chain);
    const _metadata = ChainMetadataSchema.parse(req.body);
    const metadata = await chainService.setChainMetadata(chain, _metadata);
    res.json(metadata);
  });

  router.get('/:chain/addresses', async (req: Request<ChainRequestParams>, res: Response) => {
    const addresses = await chainService.getChainAddresses(req.params.chain);
    res.json(addresses);
  });

  return router;
}
