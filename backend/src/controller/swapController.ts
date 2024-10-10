import type { Request, Response } from "express";
import * as SwapService from "../services/swapService";

export async function getSwaps(req: Request, res: Response) {
    try {
        const swaps = await SwapService.getSwaps();
        res.json(swaps);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getSwapsByRecipient(req: Request, res: Response) {
    try {
        const recipient = req.params.recipient;
        const swaps = await SwapService.getSwapsByRecipient(recipient);
        res.json(swaps);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}