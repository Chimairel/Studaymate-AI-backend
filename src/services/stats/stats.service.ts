import { EssayRepository } from "../../repositories/essay.repository";
import { UserRepository } from "../../repositories/user.repository";

export class StatsService {
  private essayRepository = new EssayRepository();
  private userRepository = new UserRepository();

  async getDashboard(userId: string) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return { code: 444, status: "error", message: "User not found" };
      }

      const aggregates = await this.essayRepository.aggregateStats(userId);
      const recentEssays = await this.essayRepository.findRecent(userId, 5);
      const mappedRecent = recentEssays.map(essay => this.essayRepository.mapEssayForClient(essay));

      return {
        code: 200,
        status: "success",
        data: {
          totalEssays: aggregates.totalEssays,
          avgScore: aggregates.avgScore,
          streak: user.streak || 0,
          totalWords: aggregates.totalWords,
          recentEssays: mappedRecent,
        },
      };
    } catch (error) {
      console.error("GetDashboard Error", error);
      return { code: 500, status: "error", message: "Unable to retrieve dashboard statistics" };
    }
  }

  async getProgress(userId: string) {
    try {
      const weeklyWords = await this.essayRepository.findWeeklyWordCounts(userId);
      const scoreTrend = await this.essayRepository.findScoreTrend(userId, 7);

      return {
        code: 200,
        status: "success",
        data: {
          weeklyWords,
          scoreTrend,
        },
      };
    } catch (error) {
      console.error("GetProgress Error", error);
      return { code: 500, status: "error", message: "Unable to retrieve progress statistics" };
    }
  }

  async getAchievements(userId: string) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return { code: 444, status: "error", message: "User not found" };
      }

      const aggregates = await this.essayRepository.aggregateStats(userId);
      const essays = await this.essayRepository.findAll(userId, { limit: 100 });

      const streak = user.streak || 0;
      const totalWords = aggregates.totalWords;
      const totalEssays = aggregates.totalEssays;

      let maxOverall = 0;
      let maxVocab = 0;

      for (const essay of essays.essays) {
        if (essay.score) {
          const scoreObj = typeof essay.score === "string" ? JSON.parse(essay.score as string) : essay.score;
          if (scoreObj && typeof scoreObj === "object") {
            if (typeof scoreObj.overall === "number" && scoreObj.overall > maxOverall) maxOverall = scoreObj.overall;
            if (typeof scoreObj.vocabulary === "number" && scoreObj.vocabulary > maxVocab) maxVocab = scoreObj.vocabulary;
          }
        }
      }

      const achievements = [
        {
          id: "first_draft",
          title: "First Draft",
          description: "Write your first essay on StudyMate.",
          icon: "pencil",
          unlocked: totalEssays >= 1,
          progress: totalEssays >= 1 ? 100 : 0,
        },
        {
          id: "word_smith",
          title: "Word Smith",
          description: "Write 1,000 words in total across your essays.",
          icon: "book",
          unlocked: totalWords >= 1000,
          progress: Math.min(100, Math.round((totalWords / 1000) * 100)),
        },
        {
          id: "streak_builder",
          title: "Streak Builder",
          description: "Reach a 3-day active writing streak.",
          icon: "fire",
          unlocked: streak >= 3,
          progress: Math.min(100, Math.round((streak / 3) * 100)),
        },
        {
          id: "academic_master",
          title: "Academic Master",
          description: "Achieve an overall score of 90 or above on any essay.",
          icon: "trophy",
          unlocked: maxOverall >= 90,
          progress: maxOverall >= 90 ? 100 : Math.round((maxOverall / 90) * 100),
        },
        {
          id: "prolific_writer",
          title: "Prolific Writer",
          description: "Create and draft 5 or more essays.",
          icon: "archive",
          unlocked: totalEssays >= 5,
          progress: Math.min(100, Math.round((totalEssays / 5) * 100)),
        },
        {
          id: "vocab_spec",
          title: "Vocabulary Specialist",
          description: "Achieve a vocabulary sub-score of 90 or above.",
          icon: "award",
          unlocked: maxVocab >= 90,
          progress: maxVocab >= 90 ? 100 : Math.round((maxVocab / 90) * 100),
        },
      ];

      return {
        code: 200,
        status: "success",
        data: achievements,
      };
    } catch (error) {
      console.error("GetAchievements Error", error);
      return { code: 500, status: "error", message: "Unable to retrieve achievements" };
    }
  }
}
export const statsService = new StatsService();
