import type { Request, Response } from "express";
import * as VolumeService from "../services/volumeService";

export async function getVolumes(req: Request, res: Response) {
    try {
        const volumes = await VolumeService.getVolumes();
        res.json(volumes);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getVolumeFromTimestamp(req: Request, res: Response) {
    try {
        const timestamp = parseInt(req.params.timestamp);
        const volumes = await VolumeService.getVolumeFromTimestamp(timestamp);
        res.json(volumes);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getVolumeLastWeeks(req: Request, res: Response) {
    try {
        const weeks = parseInt(req.params.weeks);
        const volumes = await VolumeService.getVolumeLastWeeks(weeks);
        res.json(volumes);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getVolumeLastDays(req: Request, res: Response) {
    try {
        const days = parseInt(req.params.days);
        const volumes = await VolumeService.getVolumeLastDays(days);
        res.json(volumes);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getVolumeLastHours(req: Request, res: Response) {
    try {
        const hours = parseInt(req.params.hours);
        const volumes = await VolumeService.getVolumeLastHours(hours);
        res.json(volumes);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
