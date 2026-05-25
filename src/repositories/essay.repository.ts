import { prisma } from "../lib/prisma";
// @ts-ignore
import crypto from "crypto";

export interface EssayFilters {
  type?: string;
  sort?: string; // "latest" | "oldest" | "title_asc" | "title_desc" | "score_desc"
  page?: number;
  limit?: number;
}

export class EssayRepository {
  private parseEssayJsonFields(essay: any) {
    if (!essay) return essay;

    if (typeof essay.feedback === "string") {
      try {
        essay.feedback = JSON.parse(essay.feedback);
      } catch {
        essay.feedback = [];
      }
    }

    if (essay.score && typeof essay.score === "string") {
      try {
        essay.score = JSON.parse(essay.score);
      } catch {
        essay.score = null;
      }
    }

    // Preserve the raw parsed score object for merging inside stats and coaches
    essay.rawScore = essay.score;

    return essay;
  }

  public mapEssayForClient(essay: any) {
    if (!essay) return essay;

    const wordCount = essay.wordCount || 0;
    const charCount = essay.content ? essay.content.length : 0;

    // 1. Get raw score components
    const scoreObj = essay.rawScore || essay.score || {};
    let scoreNum = 0;
    if (scoreObj && typeof scoreObj === "object" && typeof scoreObj.overall === "number") {
      scoreNum = scoreObj.overall;
    }

    // 2. Map subScores (structure, argument, clarity, grammar, evidence)
    const subScores = {
      structure: (scoreObj && typeof scoreObj === "object" && typeof scoreObj.structure === "number") ? scoreObj.structure : 0,
      argument: (scoreObj && typeof scoreObj === "object" && typeof scoreObj.argument === "number") ? scoreObj.argument : 0,
      clarity: (scoreObj && typeof scoreObj === "object")
        ? (typeof scoreObj.clarity === "number" ? scoreObj.clarity : (typeof scoreObj.style === "number" ? scoreObj.style : 0))
        : 0,
      grammar: (scoreObj && typeof scoreObj === "object" && typeof scoreObj.grammar === "number") ? scoreObj.grammar : 0,
      evidence: (scoreObj && typeof scoreObj === "object")
        ? (typeof scoreObj.evidence === "number" ? scoreObj.evidence : (typeof scoreObj.vocabulary === "number" ? scoreObj.vocabulary : 0))
        : 0,
    };

    // 3. Map feedback array
    const rawFeedback = essay.feedback || [];
    const list = Array.isArray(rawFeedback) ? rawFeedback : [];
    const mappedFeedback = list.map((item: any) => {
      const msg = item.message || item.issue || "";
      let itemType = String(item.type || "style").toLowerCase();
      if (itemType === "clarity") itemType = "clarity";
      else if (itemType === "structure") itemType = "structure";
      else if (itemType === "grammar") itemType = "grammar";
      else itemType = "style";

      return {
        id: item.id || item._id || crypto.randomUUID(),
        type: itemType,
        message: msg,
        original: item.original || undefined,
        suggestion: item.suggestion || undefined,
        accepted: typeof item.accepted === "boolean" ? item.accepted : false,
      };
    });

    return {
      id: essay.id,
      userId: essay.userId,
      title: essay.title,
      content: essay.content,
      type: essay.type,
      wordCount,
      charCount,
      score: scoreNum,
      subScores,
      feedback: mappedFeedback,
      status: essay.status,
      isFavorite: Boolean(essay.isFavorite),
      createdAt: essay.createdAt,
      updatedAt: essay.updatedAt,
    };
  }

  async create(data: {
    userId: string;
    title: string;
    content: string;
    type: string;
    wordCount: number;
    score?: any;
    feedback?: any[];
    status?: string;
  }) {
    const created = await prisma.essay.create({
      data: {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
        wordCount: data.wordCount,
        score: data.score !== undefined ? data.score : null,
        feedback: data.feedback || [],
        status: data.status || "draft",
      },
    });
    return this.parseEssayJsonFields(created);
  }

  async update(id: string, data: any) {
    const updateData: any = { ...data };

    const updated = await prisma.essay.update({
      where: { id },
      data: updateData,
    });
    return this.parseEssayJsonFields(updated);
  }

  async delete(id: string) {
    return prisma.essay.delete({
      where: { id },
    });
  }

  async findById(id: string) {
    const essay = await prisma.essay.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return this.parseEssayJsonFields(essay);
  }

  async findAll(userId: string, filters: EssayFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (filters.type) {
      where.type = filters.type;
    }

    let orderBy: any = { createdAt: "desc" }; // default

    if (filters.sort && filters.sort !== "score_desc") {
      switch (filters.sort) {
        case "oldest":
          orderBy = { createdAt: "asc" };
          break;
        case "title_asc":
          orderBy = { title: "asc" };
          break;
        case "title_desc":
          orderBy = { title: "desc" };
          break;
        case "latest":
        default:
          orderBy = { createdAt: "desc" };
          break;
      }
    }

    let essays;
    let total;

    if (filters.sort === "score_desc") {
      // In-memory sort needed because Prisma does not support ordering by JSON fields.
      // 1. Fetch all matching essays for user (ordered by latest)
      const allEssays = await prisma.essay.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      // 2. Parse and sort in-memory based on score.overall
      const parsedAll = allEssays.map((essay) => this.parseEssayJsonFields(essay));
      parsedAll.sort((a, b) => {
        const scoreA = a.score && typeof a.score === "object" ? (a.score.overall || 0) : 0;
        const scoreB = b.score && typeof b.score === "object" ? (b.score.overall || 0) : 0;
        return scoreB - scoreA;
      });

      // 3. Paginate
      total = parsedAll.length;
      essays = parsedAll.slice(skip, skip + limit);
    } else {
      // Direct SQL sort
      const rawEssays = await prisma.essay.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      });
      const count = await prisma.essay.count({ where });

      total = count;
      essays = rawEssays.map((essay) => this.parseEssayJsonFields(essay));
    }

    return {
      essays,
      total,
      page,
      limit,
    };
  }

  async findRecent(userId: string, limit: number = 5) {
    const essays = await prisma.essay.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return essays.map((essay) => this.parseEssayJsonFields(essay));
  }


  async aggregateStats(userId: string) {
    const essays = await prisma.essay.findMany({
      where: { userId },
      select: {
        wordCount: true,
        score: true,
      },
    });

    let totalWords = 0;
    let totalScore = 0;
    let scoredCount = 0;

    for (const essay of essays) {
      totalWords += essay.wordCount || 0;
      if (essay.score) {
        const scoreObj = typeof essay.score === "string" ? JSON.parse(essay.score) : essay.score;
        if (scoreObj && typeof scoreObj.overall === "number") {
          totalScore += scoreObj.overall;
          scoredCount++;
        }
      }
    }

    const avgScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;
    const totalEssays = essays.length;

    return {
      totalWords,
      avgScore,
      totalEssays,
    };
  }

  async findWeeklyWordCounts(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const essays = await prisma.essay.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
        wordCount: true,
      },
    });

    // Map word counts by day of week
    const counts: { [key: string]: number } = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { weekday: "short" }); // e.g. "Mon"
      counts[dateStr] = 0;
    }

    for (const essay of essays) {
      const day = essay.createdAt.toLocaleDateString("en-US", { weekday: "short" });
      if (counts[day] !== undefined) {
        counts[day] += essay.wordCount || 0;
      }
    }

    return Object.keys(counts).reverse().map((day) => ({
      day,
      words: counts[day],
    }));
  }

  async findScoreTrend(userId: string, limit: number = 7) {
    const essays = await prisma.essay.findMany({
      where: {
        userId,
        status: "analyzed",
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        title: true,
        score: true,
        createdAt: true,
      },
    });

    const trend = [];
    for (const essay of essays) {
      if (essay.score) {
        try {
          const scoreObj = typeof essay.score === "string" ? JSON.parse(essay.score) : essay.score;
          if (scoreObj && typeof scoreObj.overall === "number") {
            trend.push({
              title: essay.title,
              score: scoreObj.overall,
              date: essay.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            });
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    return trend.reverse();
  }
}
