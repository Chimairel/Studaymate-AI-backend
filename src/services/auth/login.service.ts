import { UserRepository } from "../../repositories/user.repository";
import bcrypt from "bcrypt";
import { signToken } from "../../lib/jwt";

export async function LoginCredentialsService(email: string, password: string) {
  const userRepository = new UserRepository();

  try {
    const user = await userRepository.findByEmail(email);
    
    if (!user || !user.password) {
      return { code: 400, status: "error", message: "Invalid Credentials" };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { code: 400, status: "error", message: "Invalid Credentials" };
    }

    // Generate JWT access token
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Update lastActiveDate on login
    await userRepository.update(user.id, {
      lastActiveDate: new Date(),
    });

    return {
      code: 200,
      status: "success",
      message: "Login successful",
      data: {
        token,
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
    console.error("LoginCredentialService Error", error);
    return { code: 500, status: "error", message: "Unable to login account" };
  }
}
