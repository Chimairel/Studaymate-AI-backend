export async function LogoutUserService() {
  try {
    return {
      code: 200,
      status: "success",
      message: "Logout successful",
    };
  } catch (error) {
    console.error("LogoutUserService error", error);
    return { code: 500, status: "error", message: "Unable to logout account" };
  }
}
