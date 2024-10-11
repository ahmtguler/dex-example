import { Router } from 'express';
import * as MintController from '../controller/mintController';

const mintRouter = Router();

mintRouter.get('/', MintController.getMints);
mintRouter.get('/:recipient', MintController.getMintsByRecipient);

export default mintRouter;