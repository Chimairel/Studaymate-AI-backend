# StudyMate AI - Backend Setup Guide

This guide provides step-by-step instructions to install and run the **StudyMate AI Express Node.js Backend Server** on your local machine.

All backend cloud database credentials and API keys are fully pre-configured below so it works out-of-the-box!

---

## 🚀 Backend Setup Instructions

### Step 1: Create Environment File
1. In the root of the **`studymate-ai-backend`** directory, create a file named **`.env`**.
2. Copy and paste the following **exact** variables into your `.env` file:

```env
PORT=5000
DATABASE_URL="postgresql://neondb_owner:npg_C6ZJep4AiYov@ep-sparkling-violet-ao4uh5cf.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:npg_C6ZJep4AiYov@ep-sparkling-violet-ao4uh5cf.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="studymate_super_secure_secret_key_123!"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
GEMINI_API_KEY="AIzaSyAh3KUVN5wkqILQfBQe-ZOHraKafd43-EQ"
PRISMA_CLIENT_ENGINE_TYPE="library"
```

---

### Step 2: Install Node Dependencies
Open a terminal in the **`studymate-ai-backend`** directory and install the required modules:
```bash
npm install
```

---

### Step 3: Run Database Migrations & Client Generation
Execute the following commands to push the schema changes to the Neon PostgreSQL cloud database and generate the Prisma Client bindings:
```bash
# Push database models to Neon PostgreSQL
npx prisma db push

# Generate typed local Prisma Client
npx prisma generate
```

---

### Step 4: Run the Development Server
Start the development server:
```bash
npm run dev
```

*The API server will start successfully on **[http://localhost:5000](http://localhost:5000)**.*
*Endpoints (e.g. login, sign up, essay drafting, and AI coaching recommendations) are now active and ready for frontend API requests!*
