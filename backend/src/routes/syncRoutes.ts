import { Router } from 'express';
import * as SyncController from '../controller/syncController';

const syncRouter = Router();

syncRouter.get('/reserves', SyncController.getReserves);
syncRouter.get('/latestReserves', SyncController.getLatestReserves);

export default syncRouter;