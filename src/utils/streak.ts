import { UserRepository } from "../repositories/user.repository";

export async function updateStreakOnActivity(userId: string) {
  const userRepository = new UserRepository();
  
  try {
    const user = await userRepository.findById(userId);
    if (!user) return;

    const now = new Date();
    const lastActive = user.lastActiveDate;

    let newStreak = user.streak;

    if (!lastActive) {
      // First activity
      newStreak = 1;
    } else {
      // Normalize dates to midnight to check calendar days difference
      const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
      
      const diffTime = Math.abs(todayDate.getTime() - lastActiveDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Active on consecutive days
        newStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1;
      }
      // If diffDays === 0 (active today), streak remains the same
    }

    await userRepository.update(userId, {
      streak: newStreak,
      lastActiveDate: now,
    });
  } catch (error) {
    console.error("Failed to update user streak:", error);
  }
}
