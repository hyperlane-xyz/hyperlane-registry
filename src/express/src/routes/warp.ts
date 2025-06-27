import { Router, Request, Response } from 'express';
import { WarpService } from '../services/warpService.js';
import { z } from 'zod';
import { validateRequestParam } from '../middleware/validateRequest.js';

export function createWarpRouter(warpService: WarpService) {
  const router = Router();

  // get warp route
  router.get(
    '/:id',
    validateRequestParam('id', z.string()),
    async (req: Request, res: Response) => {
      const warpRoute = await warpService.getWarpRoute(req.params.id);
      res.json(warpRoute);
    },
  );

  return router;
}
