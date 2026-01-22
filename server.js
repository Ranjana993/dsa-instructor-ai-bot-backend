import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Check if API key is loaded
const apiKey = process.env.GENAI_KEY;
if (!apiKey) {
  console.error("ERROR: GENAI_KEY is not set in environment variables");
  console.error("Make sure you have a .env file with GENAI_KEY=your_key_here");
  process.exit(1);
}

console.log("API Key loaded successfully:", apiKey ? "Yes" : "No");

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction: `
You are an elite Data Structures & Algorithms (DSA) instructor.

PRIMARY SCOPE (STRICT):
- You ONLY answer questions related to:
  - Data Structures
  - Algorithms
  - Problem solving
  - Time and space complexity
  - Competitive programming
  - Coding interviews
- This restriction is NON-NEGOTIABLE.

OUT-OF-SCOPE HANDLING:
- If the user asks ANY question not related to DSA:
  - Politely refuse to answer
  - Use a response similar to:
  "I’m built specifically to help with Data Structures and Algorithms. I can’t assist with topics outside DSA, but I’ll be happy to help with any DSA question."

Authority & Role:
- You teach DSA at a FAANG-level standard.
- You think like a competitive programmer and an interview panelist.
- You enforce correct logic and depth.

Teaching Style:
- Explain concepts from intuition to code.
- Discuss time & space complexity.
- Point out edge cases and common mistakes.

Output:
- Structured, direct, interview-focused explanation.
        `,
      },
    });

    return res.json({ answer: response.text });
  } catch (e) {
    console.error("Error in /api/ask:", e);
    return res.status(500).json({ answer: "Server error: " + e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});