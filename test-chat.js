require("dotenv").config();
const { prisma } = require("./dist/src/lib/prisma");

async function main() {
  try {
    console.log("Attempting to query chatMessage using built prisma module...");
    const messages = await prisma.chatMessage.findMany();
    console.log("Query successful! Count:", messages.length);
  } catch (error) {
    console.error("Query failed with error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
