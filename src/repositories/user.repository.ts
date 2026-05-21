import { prisma } from "../lib/prisma";

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async create(data: any) {
    const defaultPreferences = {
      realtimeFeedback: true,
      grammarHighlights: true,
      weeklyReport: false,
      darkMode: false,
      defaultEssayMode: "Argumentative",
    };

    return prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
        preferences: data.preferences || defaultPreferences,
      },
    });
  }

  async update(id: string, data: any) {
    if (data.email) {
      data.email = data.email.toLowerCase();
    }
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
