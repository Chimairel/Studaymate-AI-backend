import { UserRepository } from "../../repositories/user.repository";
import bcrypt from "bcrypt";
import { signToken } from "../../lib/jwt";

export async function SignupUserService(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role?: string,
  bio?: string
) {
  const userRepository = new UserRepository();

  try {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return { code: 409, status: "error", message: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "College Student",
      bio: bio || "",
    });

    // Generate JWT token so the user is auto-logged-in after signup
    const token = signToken({
      sub: created.id,
      email: created.email,
      role: created.role,
    });

    return {
      code: 200,
      status: "success",
      message: "Created account successfully!",
      data: {
        token,
        user: {
          id: created.id,
          firstName: created.firstName,
          lastName: created.lastName,
          email: created.email,
          role: created.role,
          bio: created.bio,
          preferences: created.preferences,
          streak: created.streak,
          createdAt: created.createdAt,
        },
      },
    };
  } catch (error) {
    console.error("SignupUserService error", error);
    return { code: 500, status: "error", message: "Unable to create account" };
  }
}
