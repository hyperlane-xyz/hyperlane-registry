import { Router, Request, Response } from 'express';
import { WarpService } from '../services/warpService.js';
import { z } from 'zod';
import { validateRequest } from '../middleware/validateRequest.js';

const warpRouteParamsSchema = z.object({
  id: z.string(),
});

export function createWarpRouter(warpService: WarpService) {
  const router = Router();

  // get warp route
  router.get(
    '/:id',
    validateRequest({ params: warpRouteParamsSchema }),
    async (req: Request, res: Response) => {
      const warpRoute = await warpService.getWarpRoute(req.params.id);
      res.json(warpRoute);
    },
  );

  return router;
}
