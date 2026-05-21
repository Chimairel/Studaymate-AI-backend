import { Request, Response } from "express";
import { analyzeEssay, chatWithCoach, scoreEssay } from "../services/ai/aiService";
import { EssayRepository } from "../repositories/essay.repository";

export class CoachController {
  private essayRepository = new EssayRepository();

  public analyze = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { content, essayType, essayId } = req.body ?? {};

    try {
      const result = await analyzeEssay(content, essayType || "Argumentative");

      // If an essayId was provided, update the essay in the database
      if (essayId) {
        const essay = await this.essayRepository.findById(essayId);
        if (essay && essay.userId === userId) {
          await this.essayRepository.update(essayId, {
            score: result.scores,
            feedback: result.feedback,
            status: "analyzed",
            content, // Sync final contents in editor upon analysis
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("CoachController analyze error", error);
      return res.status(500).json({ success: false, message: error.message || "Failed to analyze essay" });
    }
  };

  public chat = async (req: Request, res: Response) => {
    const { message, essayContent, chatHistory, essayType } = req.body ?? {};

    try {
      const reply = await chatWithCoach(message, essayContent, chatHistory, essayType);

      return res.status(200).json({
        success: true,
        data: {
          reply,
        },
      });
    } catch (error: any) {
      console.error("CoachController chat error", error);
      return res.status(500).json({ success: false, message: error.message || "Failed to chat with AI coach" });
    }
  };

  public score = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { content, essayType, essayId } = req.body ?? {};

    try {
      const scores = await scoreEssay(content, essayType || "Argumentative");

      if (essayId) {
        const essay = await this.essayRepository.findById(essayId);
        if (essay && essay.userId === userId) {
          const currentScore = essay.rawScore || {};
          
          await this.essayRepository.update(essayId, {
            score: {
              ...currentScore,
              ...scores,
            },
            content,
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          scores,
        },
      });
    } catch (error: any) {
      console.error("CoachController score error", error);
      return res.status(500).json({ success: false, message: error.message || "Failed to score essay" });
    }
  };
}

export const coachController = new CoachController();
