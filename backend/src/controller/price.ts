import type { Request, Response } from "express";
import * as PriceService from "../services/priceService";

export async function getPrices(req: Request, res: Response) {
    try {
        const prices = await PriceService.getPrices();
        res.json(prices);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getPriceFromTimestamp(req: Request, res: Response) {
    try {
        const timestamp = parseInt(req.params.timestamp);
        const prices = await PriceService.getPriceFromTimestamp(timestamp);
        res.json(prices);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getPriceLastWeeks(req: Request, res: Response) {
    try {
        const weeks = parseInt(req.params.weeks);
        const prices = await PriceService.getPriceLastWeeks(weeks);
        res.json(prices);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getPriceLastDays(req: Request, res: Response) {
    try {
        const days = parseInt(req.params.days);
        const prices = await PriceService.getPriceLastDays(days);
        res.json(prices);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getPriceLastHours(req: Request, res: Response) {
    try {
        const hours = parseInt(req.params.hours);
        const prices = await PriceService.getPriceLastHours(hours);
        res.json(prices);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}