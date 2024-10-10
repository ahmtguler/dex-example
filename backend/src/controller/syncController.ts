import type { Request, Response } from "express";
import * as SyncService from "../services/syncService";

export async function getReserves(req: Request, res: Response) {
    try {
        const reserves = await SyncService.getReserves();
        res.json(reserves);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getLatestReserves(req: Request, res: Response) {
    try {
        const reserve = await SyncService.getLatestReserves();
        res.json(reserve);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
