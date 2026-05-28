import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../../config/env";
import crypto from "crypto";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY || "mock-api-key");

const MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro"
];

function getMockFeedbackAndScores(essayType: string) {
  return {
    feedback: [
      {
        id: crypto.randomUUID(),
        type: "Clarity",
        issue: "The thesis statement in your introduction is slightly vague.",
        suggestion: "Refine your main argument to explicitly mention the key points you will discuss.",
        accepted: false,
      },
      {
        id: crypto.randomUUID(),
        type: "Structure",
        issue: "Transition between the second and third body paragraphs is abrupt.",
        suggestion: "Add a transitional sentence at the end of paragraph two to bridge the concepts together.",
        accepted: false,
      },
      {
        id: crypto.randomUUID(),
        type: "Grammar",
        issue: "Minor subject-verb agreement issue in the conclusion.",
        suggestion: "Ensure that 'the collection of essays' is followed by 'is' instead of 'are'.",
        accepted: false,
      },
      {
        id: crypto.randomUUID(),
        type: "Style",
        issue: "Frequent use of passive voice reduces the impact of your analysis.",
        suggestion: "Rewrite sentences like 'The data was analyzed by the team' to active voice: 'The team analyzed the data'.",
        accepted: false,
      },
    ],
    scores: {
      overall: 85,
      structure: 88,
      argument: 82,
      grammar: 90,
      style: 80,
      vocabulary: 85,
    },
  };
}

function getSpecificErrorMessage(error: any): string {
  const errMsg = (error?.message || String(error)).toLowerCase();
  const errStatus = error?.status || error?.statusCode;
  const errCode = error?.code;

  if (
    errStatus === 429 ||
    errCode === "RESOURCE_EXHAUSTED" ||
    errMsg.includes("429") ||
    errMsg.includes("quota") ||
    errMsg.includes("exhausted") ||
    errMsg.includes("limit exceeded") ||
    errMsg.includes("rate limit") ||
    errMsg.includes("too many requests")
  ) {
    return "API Quota Exceeded: The AI API rate limit or quota has been reached. Please check your Gemini account billing or wait a moment before trying again.";
  }

  if (
    (errStatus === 400 && (errMsg.includes("key") || errMsg.includes("api_key") || errMsg.includes("invalid"))) ||
    errMsg.includes("api_key_invalid") ||
    errMsg.includes("invalid api key") ||
    errMsg.includes("key not valid") ||
    errMsg.includes("api key not found") ||
    errMsg.includes("api key invalid") ||
    (errMsg.includes("400") && errMsg.includes("key"))
  ) {
    return "Invalid API Key: The configured Gemini API key is invalid or unauthorized. Please verify the GEMINI_API_KEY environment variable in your backend .env file.";
  }

  if (
    errMsg.includes("fetch failed") ||
    errMsg.includes("network") ||
    errMsg.includes("connect") ||
    errMsg.includes("timeout") ||
    errMsg.includes("enotfound") ||
    errMsg.includes("eai_again") ||
    errMsg.includes("socket") ||
    errMsg.includes("offline") ||
    errMsg.includes("dns")
  ) {
    return "Network Problem: Unable to connect to the Gemini API servers. Please check your internet connection and try again.";
  }

  if (errMsg.includes("safety") || errMsg.includes("blocked") || errMsg.includes("candidate")) {
    return "Safety/Content Policy: The response was blocked by safety settings. Please try rephrasing your prompt or essay content.";
  }

  return `Service Error: ${error?.message || String(error)}`;
}

export async function analyzeEssay(content: string, essayType: string) {
  if (!ENV.GEMINI_API_KEY || ENV.GEMINI_API_KEY === "mock-api-key") {
    console.warn("⚠️ Using Mock StudyMate AI Analysis: GEMINI_API_KEY is not configured.");
    return getMockFeedbackAndScores(essayType);
  }

  let lastError: any;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const systemPrompt = `You are StudyMate, an expert academic writing coach. Analyze the given essay and return ONLY a valid JSON object with no preamble, no markdown, and no extra text. The JSON must follow this exact structure:
{
  "feedback": [
    {
      "type": "Clarity or Structure or Grammar or Style",
      "issue": "Brief description of the problem",
      "suggestion": "Specific, actionable improvement",
      "original": "The exact original word or phrase from the essay that has the issue (must match a literal substring in the essay, e.g. 'Financail'). Set to null or omit if it is a general style/structural comment."
    }
  ],
  "scores": {
    "overall": integer 0 to 100,
    "structure": integer 0 to 100,
    "argument": integer 0 to 100,
    "grammar": integer 0 to 100,
    "style": integer 0 to 100,
    "vocabulary": integer 0 to 100
  }
}
Provide 3 to 6 feedback items. Be specific and constructive. Essay type: ${essayType}.`;

      const response = await model.generateContent([
        { text: systemPrompt },
        { text: `Essay Content:\n${content}` },
      ]);

      const text = response.response.text();
      const parsed = JSON.parse(text);

      // Ensure feedback items have unique IDs for acceptance/dismissal tracking
      if (parsed.feedback && Array.isArray(parsed.feedback)) {
        parsed.feedback = parsed.feedback.map((item: any) => ({
          id: crypto.randomUUID(),
          accepted: false,
          ...item,
        }));
      }

      return parsed;
    } catch (error) {
      console.warn(`Model ${modelName} failed in analyzeEssay, falling back...`, error);
      lastError = error;
    }
  }

  console.error("AI analyzeEssay Error: All generative models failed.", lastError);
  const specificError = getSpecificErrorMessage(lastError);
  throw new Error(specificError);
}export async function chatWithCoach(
  message: string,
  essayContent: string,
  chatHistory: any[] = [],
  essayType: string = "Argumentative"
): Promise<string> {
  if (!ENV.GEMINI_API_KEY || ENV.GEMINI_API_KEY === "mock-api-key") {
    console.warn("⚠️ Using Mock StudyMate Coach Chat: GEMINI_API_KEY is not configured.");
    return `Hello! As your StudyMate coach, I've read your draft. You are doing a wonderful job with this ${essayType} essay! Focus on strengthening your thesis and using active transitions between your main arguments. What specific paragraph should we polish next?`;
  }

  let lastError: any;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: `You are StudyMate, a friendly and expert academic writing coach. The student is working on a ${essayType} essay. Their current draft is provided below as context.

TOPIC GUIDELINES:
- VALID TOPICS: Academic writing, essay construction, thesis statements, grammar, vocabulary, editing, structuring arguments, brainstorming essay topics, and writing concepts.
- INVALID TOPICS: Mathematics (e.g. algebra, calculus, solving equations), science questions, coding/programming, general trivia, cooking recipes, sports, politics, or other unrelated homework help.

RULES:
1. SCOPE: Help them improve their essay by answering their questions clearly, suggesting specific edits, explaining writing concepts, or providing encouragement.
2. HANDLING INVALID TOPICS: For any INVALID TOPIC (like math, science, coding, trivia, etc.), politely decline to answer. Explain that you are an AI writing coach dedicated to helping them with their writing and essays, and pivot back to how they can improve their current ${essayType} essay.
3. CONCISENESS: Keep responses concise and focused — 2 to 4 sentences unless more detail is needed.

Essay context:
---
${essayContent}
---`,
      });

      // Format chat history to match Gemini SDK expectations
      let formattedHistory = (chatHistory || []).map((msg: any) => {
        const role = msg.role === "user" ? "user" : "model";
        let textContent = "";
        if (typeof msg.parts === "string") {
          textContent = msg.parts;
        } else if (Array.isArray(msg.parts) && msg.parts[0]?.text) {
          textContent = msg.parts[0].text;
        } else if (msg.content) {
          textContent = msg.content;
        }
        return {
          role,
          parts: [{ text: textContent }],
        };
      });

      // Gemini requires the history to start with a 'user' message
      while (formattedHistory.length > 0 && formattedHistory[0].role !== "user") {
        formattedHistory.shift();
      }

      // Gemini requires alternating roles
      const cleanHistory: typeof formattedHistory = [];
      for (const msg of formattedHistory) {
        if (cleanHistory.length === 0) {
          cleanHistory.push(msg);
        } else {
          const lastMsg = cleanHistory[cleanHistory.length - 1];
          if (lastMsg.role === msg.role) {
            lastMsg.parts[0].text += "\n" + msg.parts[0].text;
          } else {
            cleanHistory.push(msg);
          }
        }
      }

      // Gemini requires the last message in history to be from the model (so the next message sent by the user alternates)
      while (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role !== "model") {
        cleanHistory.pop();
      }

      const chat = model.startChat({
        history: cleanHistory.slice(-10), // keep the last 10 messages for context
      });

      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (error: any) {
      console.warn(`Model ${modelName} failed in chatWithCoach, falling back...`, error);
      lastError = error;
    }
  }

  // If we reach here, all models failed
  console.error("AI chatWithCoach Error: All generative models failed.", lastError);
  const errorMsg = getSpecificErrorMessage(lastError);
  return `StudyMate Coach Error: ${errorMsg}\n\n(Please check your connection, API key, or quota usage, and try again!)`;
}

export async function scoreEssay(content: string, essayType: string) {
  const fullAnalysis = await analyzeEssay(content, essayType);
  return fullAnalysis.scores || getMockFeedbackAndScores(essayType).scores;
}
