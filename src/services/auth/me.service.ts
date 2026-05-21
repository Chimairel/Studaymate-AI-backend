import { UserRepository } from "../../repositories/user.repository";

export async function GetMeService(userId: string) {
  const userRepository = new UserRepository();

  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      return { code: 444, status: "error", message: "User not found" };
    }

    return {
      code: 200,
      status: "success",
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          bio: user.bio,
          preferences: user.preferences,
          streak: user.streak,
          createdAt: user.createdAt,
        },
      },
    };
  } catch (error) {
    console.error("GetMeService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve profile" };
  }
}
