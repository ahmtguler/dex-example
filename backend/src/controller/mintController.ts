import type { Request, Response } from "express";
import * as MintService from "../services/mintService";

export async function getMints(req: Request, res: Response) {
    try {
        const mints = await MintService.getMints();
        res.json(mints);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getMintsByRecipient(req: Request, res: Response) {
    try {
        const recipient = req.params.recipient;
        const mints = await MintService.getMintsByRecipient(recipient);
        res.json(mints);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}