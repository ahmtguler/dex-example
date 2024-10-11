import { Router } from 'express';
import * as PriceController from '../controller/priceController';

const priceRouter = Router();

priceRouter.get('/', PriceController.getPrices);
priceRouter.get('/:timestamp', PriceController.getPriceFromTimestamp);
priceRouter.get('/weeks/:weeks', PriceController.getPriceLastWeeks);
priceRouter.get('/days/:days', PriceController.getPriceLastDays);
priceRouter.get('/hours/:hours', PriceController.getPriceLastHours);

export default priceRouter;
