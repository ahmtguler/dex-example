import { Router } from 'express';
import * as BurnController from '../controller/burnController';

const burnRouter = Router();

burnRouter.get('/', BurnController.getBurns);
burnRouter.get('/:recipient', BurnController.getBurnsByRecipient);

export default burnRouter;
