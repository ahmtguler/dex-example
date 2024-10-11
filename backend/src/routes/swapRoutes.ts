import { Router } from 'express';
import * as SwapController from '../controller/swapController';

const swapRouter = Router();

swapRouter.get('/', SwapController.getSwaps);
swapRouter.get('/:recipient', SwapController.getSwapsByRecipient);

export default swapRouter;