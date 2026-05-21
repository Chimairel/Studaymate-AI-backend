import { Request, Response } from "express";
import { EssayService } from "../services/essay/essay.service";

export class EssayController {
  private essayService = new EssayService();

  public create = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { title, content, type } = req.body ?? {};

    const result = await this.essayService.createEssay(userId, { title, content, type });
    return res.status(result.code).json(result);
  };

  public update = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const { title, content, type, score, feedback, wordCount, charCount, subScores } = req.body ?? {};

    const result = await this.essayService.updateEssay(userId, id, { title, content, type, score, feedback, wordCount, charCount, subScores });
    return res.status(result.code).json(result);
  };

  public getOne = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const result = await this.essayService.getEssay(userId, id);
    return res.status(result.code).json(result);
  };

  public delete = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const result = await this.essayService.deleteEssay(userId, id);
    return res.status(result.code).json(result);
  };

  public getAll = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { type, sort, page, limit } = req.query;

    const filters = {
      type: type ? String(type) : undefined,
      sort: sort ? String(sort) : undefined,
      page: page ? parseInt(String(page), 10) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
    };

    const result = await this.essayService.getAllEssays(userId, filters);
    
    if (result.status === "success") {
      // Map return values to standard paginated envelope:
      // Paginated list: { "success": true, "data": [...], "total": 24, "page": 1, "limit": 10 }
      return res.status(result.code).json({
        success: true,
        data: (result as any).essays,
        total: (result as any).total,
        page: (result as any).page,
        limit: (result as any).limit,
      });
    }

    return res.status(result.code).json(result);
  };

  public updateFeedback = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const feedbackId = req.params.feedbackId as string;
    const { accepted } = req.body ?? {};

    if (accepted === undefined) {
      return res.status(400).json({ success: false, message: "Field 'accepted' is required" });
    }

    const result = await this.essayService.updateFeedbackItem(
      userId,
      id,
      feedbackId,
      Boolean(accepted)
    );
    return res.status(result.code).json(result);
  };
}

export const essayController = new EssayController();
