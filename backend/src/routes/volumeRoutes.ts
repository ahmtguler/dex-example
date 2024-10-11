import { Router } from 'express';
import * as VolumeController from '../controller/volumeController';

const volumeRouter = Router();

volumeRouter.get('/', VolumeController.getVolumes);
volumeRouter.get('/:timestamp', VolumeController.getVolumeFromTimestamp);
volumeRouter.get('/weeks/:weeks', VolumeController.getVolumeLastWeeks);
volumeRouter.get('/days/:days', VolumeController.getVolumeLastDays);
volumeRouter.get('/hours/:hours', VolumeController.getVolumeLastHours);

export default volumeRouter;