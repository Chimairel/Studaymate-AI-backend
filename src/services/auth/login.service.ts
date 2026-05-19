import { UserRepository } from "../../repositories/user.repository";
import bcrypt from "bcrypt";

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

    return {
      code: 200,
      status: "success",
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    };
  } catch (error) {
    console.error("LoginCredentialService Error", error);
    return { code: 500, status: "error", message: "Unable to login account" };
  }
}
