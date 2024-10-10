import type { Request, Response } from "express";
import * as BurnService from "../services/burnService";

export async function getBurns(req: Request, res: Response) {
    try {
        const burns = await BurnService.getBurns();
        res.json(burns);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getBurnsByRecipient(req: Request, res: Response) {
    try {
        const recipient = req.params.recipient;
        const burns = await BurnService.getBurnsByRecipient(recipient);
        res.json(burns);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
