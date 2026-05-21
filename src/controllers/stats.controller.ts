import { Request, Response } from "express";
import { statsService } from "../services/stats/stats.service";

export class StatsController {
  public dashboard = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await statsService.getDashboard(userId);
    return res.status(result.code).json(result);
  };

  public progress = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await statsService.getProgress(userId);
    return res.status(result.code).json(result);
  };

  public achievements = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await statsService.getAchievements(userId);
    return res.status(result.code).json(result);
  };
}

export const statsController = new StatsController();
