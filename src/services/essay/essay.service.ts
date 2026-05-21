import { EssayRepository, EssayFilters } from "../../repositories/essay.repository";
import { updateStreakOnActivity } from "../../utils/streak";

function calculateWordCount(content?: string): number {
  if (!content) return 0;
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export class EssayService {
  private essayRepository = new EssayRepository();

  async createEssay(userId: string, data: { title: string; content?: string; type: string }) {
    try {
      const content = data.content || "";
      const wordCount = calculateWordCount(content);

      const created = await this.essayRepository.create({
        userId,
        title: data.title,
        content,
        type: data.type,
        wordCount,
        status: "draft",
      });

      // Update user streak on save
      await updateStreakOnActivity(userId);

      return {
        code: 201,
        status: "success",
        data: this.essayRepository.mapEssayForClient(created),
      };
    } catch (error) {
      console.error("CreateEssay Error", error);
      return { code: 500, status: "error", message: "Unable to create essay" };
    }
  }

  async updateEssay(
    userId: string,
    essayId: string,
    data: { title?: string; content?: string; type?: string; score?: any; feedback?: any[]; wordCount?: number; charCount?: number; subScores?: any }
  ) {
    try {
      const existing = await this.essayRepository.findById(essayId);
      if (!existing) {
        return { code: 404, status: "error", message: "Essay not found" };
      }
      if (existing.userId !== userId) {
        return { code: 403, status: "error", message: "Unauthorized access to essay" };
      }

      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined) {
        updateData.content = data.content;
        updateData.wordCount = data.wordCount || calculateWordCount(data.content);
      }
      if (data.type !== undefined) updateData.type = data.type;
      if (data.wordCount !== undefined && data.content === undefined) updateData.wordCount = data.wordCount;
      
      // Persist analysis results: rebuild score object from subScores + score if provided
      if (data.score !== undefined || data.subScores !== undefined) {
        const scoreObj: any = {};
        if (typeof data.score === 'number') scoreObj.overall = data.score;
        if (data.subScores) {
          if (typeof data.subScores.structure === 'number') scoreObj.structure = data.subScores.structure;
          if (typeof data.subScores.argument === 'number') scoreObj.argument = data.subScores.argument;
          if (typeof data.subScores.clarity === 'number') scoreObj.style = data.subScores.clarity; // map clarity -> style for DB
          if (typeof data.subScores.grammar === 'number') scoreObj.grammar = data.subScores.grammar;
          if (typeof data.subScores.evidence === 'number') scoreObj.vocabulary = data.subScores.evidence; // map evidence -> vocabulary for DB
        }
        updateData.score = scoreObj;
      }
      
      if (data.feedback !== undefined) {
        updateData.feedback = data.feedback;
        updateData.status = "analyzed";
      }

      const updated = await this.essayRepository.update(essayId, updateData);

      // Update user streak on save
      await updateStreakOnActivity(userId);

      return {
        code: 200,
        status: "success",
        data: this.essayRepository.mapEssayForClient(updated),
      };
    } catch (error) {
      console.error("UpdateEssay Error", error);
      return { code: 500, status: "error", message: "Unable to update essay" };
    }
  }

  async getEssay(userId: string, essayId: string) {
    try {
      const essay = await this.essayRepository.findById(essayId);
      if (!essay) {
        return { code: 404, status: "error", message: "Essay not found" };
      }
      if (essay.userId !== userId) {
        return { code: 403, status: "error", message: "Unauthorized access to essay" };
      }

      return {
        code: 200,
        status: "success",
        data: this.essayRepository.mapEssayForClient(essay),
      };
    } catch (error) {
      console.error("GetEssay Error", error);
      return { code: 500, status: "error", message: "Unable to retrieve essay" };
    }
  }

  async deleteEssay(userId: string, essayId: string) {
    try {
      const existing = await this.essayRepository.findById(essayId);
      if (!existing) {
        return { code: 404, status: "error", message: "Essay not found" };
      }
      if (existing.userId !== userId) {
        return { code: 403, status: "error", message: "Unauthorized access to essay" };
      }

      await this.essayRepository.delete(essayId);

      return {
        code: 200,
        status: "success",
        success: true,
        message: "Essay deleted successfully",
      };
    } catch (error) {
      console.error("DeleteEssay Error", error);
      return { code: 500, status: "error", message: "Unable to delete essay" };
    }
  }

  async getAllEssays(userId: string, filters: EssayFilters) {
    try {
      const result = await this.essayRepository.findAll(userId, filters);
      const mappedEssays = result.essays.map(essay => this.essayRepository.mapEssayForClient(essay));

      return {
        code: 200,
        status: "success",
        essays: mappedEssays,
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      console.error("GetAllEssays Error", error);
      return { code: 500, status: "error", message: "Unable to retrieve essays" };
    }
  }

  async updateFeedbackItem(
    userId: string,
    essayId: string,
    feedbackId: string,
    accepted: boolean
  ) {
    try {
      const essay = await this.essayRepository.findById(essayId);
      if (!essay) {
        return { code: 404, status: "error", message: "Essay not found" };
      }
      if (essay.userId !== userId) {
        return { code: 403, status: "error", message: "Unauthorized access to essay" };
      }

      const feedbackList = (essay.feedback as any[]) || [];
      const feedbackIndex = feedbackList.findIndex((item: any) => item.id === feedbackId || item._id === feedbackId);

      if (feedbackIndex === -1) {
        // If they don't have UUIDs, fallback to matching by array index if feedbackId is a number
        const numId = parseInt(feedbackId, 10);
        if (!isNaN(numId) && numId >= 0 && numId < feedbackList.length) {
          feedbackList[numId].accepted = accepted;
        } else {
          return { code: 404, status: "error", message: "Feedback item not found" };
        }
      } else {
        feedbackList[feedbackIndex].accepted = accepted;
      }

      const updated = await this.essayRepository.update(essayId, { feedback: feedbackList });

      return {
        code: 200,
        status: "success",
        data: this.essayRepository.mapEssayForClient(updated),
      };
    } catch (error) {
      console.error("UpdateFeedbackItem Error", error);
      return { code: 500, status: "error", message: "Unable to update feedback item" };
    }
  }
}
