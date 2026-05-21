import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../../config/env";
import crypto from "crypto";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY || "mock-api-key");

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

export async function analyzeEssay(content: string, essayType: string) {
  if (!ENV.GEMINI_API_KEY || ENV.GEMINI_API_KEY === "mock-api-key") {
    console.warn("⚠️ Using Mock EssayMind AI Analysis: GEMINI_API_KEY is not configured.");
    return getMockFeedbackAndScores(essayType);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const systemPrompt = `You are EssayMind, an expert academic writing coach. Analyze the given essay and return ONLY a valid JSON object with no preamble, no markdown, and no extra text. The JSON must follow this exact structure:
{
  "feedback": [
    {
      "type": "Clarity or Structure or Grammar or Style",
      "issue": "Brief description of the problem",
      "suggestion": "Specific, actionable improvement"
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
    console.error("AI analyzeEssay Error:", error);
    // Graceful fallback to mock response so app doesn't crash on bad API key / network
    return getMockFeedbackAndScores(essayType);
  }
}

export async function chatWithCoach(
  message: string,
  essayContent: string,
  chatHistory: any[] = [],
  essayType: string = "Argumentative"
): Promise<string> {
  if (!ENV.GEMINI_API_KEY || ENV.GEMINI_API_KEY === "mock-api-key") {
    console.warn("⚠️ Using Mock EssayMind Coach Chat: GEMINI_API_KEY is not configured.");
    return `Hello! As your EssayMind coach, I've read your draft. You are doing a wonderful job with this ${essayType} essay! Focus on strengthening your thesis and using active transitions between your main arguments. What specific paragraph should we polish next?`;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are EssayMind, a friendly and expert writing coach. The student is working on a ${essayType} essay. Their current draft is provided below as context. Help them improve their essay by answering their questions clearly, suggesting specific edits, explaining writing concepts, or providing encouragement. Keep responses concise and focused — 2 to 4 sentences unless more detail is needed.
Essay context:
---
${essayContent}
---`,
    });

    // Format chat history to match Gemini SDK expectations
    const formattedHistory = (chatHistory || []).map((msg: any) => {
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

    const chat = model.startChat({
      history: formattedHistory.slice(-10), // keep the last 10 messages for context
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error("AI chatWithCoach Error:", error);
    return "I'm having a little trouble connecting to my cognitive services right now, but please review your introduction paragraph and make sure your main claim is clear and well-supported!";
  }
}

export async function scoreEssay(content: string, essayType: string) {
  const fullAnalysis = await analyzeEssay(content, essayType);
  return fullAnalysis.scores || getMockFeedbackAndScores(essayType).scores;
}
