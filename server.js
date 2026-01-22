import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const corsOptions = {
  origin: "https://dsa-instructor-ai-bot.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(bodyParser.json());

const apiKey = process.env.GENAI_KEY;

const ai = apiKey
  ? new GoogleGenAI({ apiKey })
  : null;

app.post("/api/ask", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: "GENAI_KEY not configured on server",
    });
  }

  try {
    const { question } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction: `
You are an elite Data Structures & Algorithms (DSA) instructor.
Only answer DSA-related questions.
        `,
      },
    });

    res.json({ answer: response.text });
  } catch (e) {
    console.error("Error in /api/ask:", e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "DSA Instructor API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
