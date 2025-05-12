import { Router, Request, Response } from 'express';
import { WarpCoreConfig } from '@hyperlane-xyz/sdk';
import { WarpRouteId } from '../../../types.js';
import { WarpService } from '../services/warpService.js';

interface WarpRouteParams {
  id: WarpRouteId;
}

interface WarpRouteResponse {
  data: WarpCoreConfig;
}

export function createWarpRouter(warpService: WarpService) {
  const router = Router();

  // get warp route
  router.get('/:id', async (req: Request<WarpRouteParams>, res: Response<WarpRouteResponse>) => {
    const warpRoute = await warpService.getWarpRoute(req.params.id);
    res.json({ data: warpRoute });
  });

  return router;
}
