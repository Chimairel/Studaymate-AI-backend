import { UserRepository } from "../../repositories/user.repository";
import bcrypt from "bcrypt";

export async function SignupUserService(name: string, email: string, password: string) {
  const userRepository = new UserRepository();

  try {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return { code: 409, status: "error", message: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await userRepository.create({ name, email, password: hashedPassword });

    return {
      code: 200,
      status: "success",
      message: "Created account successfully!",
      data: { 
        user: {
          id: created.id,
          name: created.name,
          email: created.email,
        }
      },
    };
  } catch (error) {
    console.error("SignupUserService error", error);
    return { code: 500, status: "error", message: "Unable to create account" };
  }
}
