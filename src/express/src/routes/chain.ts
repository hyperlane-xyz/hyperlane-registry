import { Router, Request, Response } from 'express';
import { ChainMetadataSchema, ZChainName } from '@hyperlane-xyz/sdk';
import { z } from 'zod';
import { validateRequest } from '../middleware/validateRequest.js';
import { ChainService } from '../services/chainService.js';

const chainParamsSchema = z.object({
  chain: ZChainName,
});

export function createChainRouter(chainService: ChainService) {
  const router = Router();

  router.get(
    '/:chain/metadata',
    validateRequest({ params: chainParamsSchema }),
    async (req: Request, res: Response) => {
      const metadata = await chainService.getChainMetadata(req.params.chain);
      res.json(metadata);
    },
  );

  router.post(
    '/:chain/metadata',
    validateRequest({
      params: chainParamsSchema,
      body: ChainMetadataSchema,
    }),
    async (req: Request, res: Response) => {
      const metadata = await chainService.setChainMetadata(req.params.chain, req.body);
      res.json(metadata);
    },
  );

  router.get(
    '/:chain/addresses',
    validateRequest({ params: chainParamsSchema }),
    async (req: Request, res: Response) => {
      const addresses = await chainService.getChainAddresses(req.params.chain);
      res.json(addresses);
    },
  );

  return router;
}
