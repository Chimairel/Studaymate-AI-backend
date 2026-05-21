import { UserRepository } from "../../repositories/user.repository";

export async function UpdateMeService(userId: string, data: {
  firstName?: string;
  lastName?: string;
  bio?: string;
  preferences?: {
    realtimeFeedback?: boolean;
    grammarHighlights?: boolean;
    weeklyReport?: boolean;
    darkMode?: boolean;
    defaultEssayMode?: string;
  };
}) {
  const userRepository = new UserRepository();

  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      return { code: 444, status: "error", message: "User not found" };
    }

    const updateFields: any = {};
    if (data.firstName !== undefined) updateFields.firstName = data.firstName;
    if (data.lastName !== undefined) updateFields.lastName = data.lastName;
    if (data.bio !== undefined) updateFields.bio = data.bio;

    if (data.preferences !== undefined) {
      const existingPrefs = (typeof user.preferences === "string" 
        ? JSON.parse(user.preferences) 
        : user.preferences) || {};
        
      updateFields.preferences = {
        ...existingPrefs,
        ...data.preferences,
      };
    }

    const updated = await userRepository.update(userId, updateFields);

    return {
      code: 200,
      status: "success",
      message: "Profile updated successfully",
      data: {
        user: {
          id: updated.id,
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          role: updated.role,
          bio: updated.bio,
          preferences: updated.preferences,
          streak: updated.streak,
          createdAt: updated.createdAt,
        },
      },
    };
  } catch (error) {
    console.error("UpdateMeService error", error);
    return { code: 500, status: "error", message: "Unable to update profile" };
  }
}
