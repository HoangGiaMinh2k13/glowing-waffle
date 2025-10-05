import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

app.use(cors({
  origin: "https://hoanggiaminh2k13.github.io",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

const API_KEYS = [
  process.env.GEMINI_KEY_1,
  process.env.GEMINI_KEY_2,
  process.env.GEMINI_KEY_3,
  process.env.GEMINI_KEY_4,
];
let currentKeyIndex = 0;

const MODEL = "gemini-2.5-flash";
const BOT_NAME = "Chạt bọt";

function preprocessMath(answer) {
  if (!answer) return "";

  return answer
    .replace(/√\((.*?)\)/g, "\\sqrt{$1}")
    .replace(/([0-9a-zA-Z()]+)\s*\/\s*([0-9a-zA-Z()]+)/g, "\\frac{$1}{$2}")
    .replace(/π/g, "\\pi")
    .replace(/([a-zA-Z0-9])\^2/g, "$1^2")
    .replace(/([a-zA-Z0-9])\^3/g, "$1^3");
}

async function callGeminiAPI(contents) {
  for (let i = 0; i < API_KEYS.length; i++) {
    const key = API_KEYS[currentKeyIndex];
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
        { contents },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;
      if (response.status === 200 && data?.candidates?.length) {
        return data;
      }

      console.warn("API key failed:", key, data);
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    } catch (err) {
      console.error("Request error with key:", key, err.message);
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    }
  }
  throw new Error("All API keys failed.");
}

// POST route that the frontend calls
app.post("/api/ask", async (req, res) => {
  try {
    const { question, chatHistory = [], relevantChunks = [] } = req.body;

    const context = `
You are an AI chatbot specified about mathematics named ${BOT_NAME}.
Guidelines:
  1. Use \\frac{numerator}{denominator} for fractions instead of a/b.
  2. Use \\sqrt{...} for square roots, and \\sqrt[3]{...} for cube roots.
  3. Use ^2, ^3, etc., for powers.
  4. Use \\pi for π.
  5. Keep text sentences outside math formulas untouched.
  6. Inline formulas can be wrapped in $...$, and multiline or display formulas in $$...$$.
  7. For calculations like (5 ± √(25 + 24)) / 4, produce: 
    $$x = \\frac{5 \\pm \\sqrt{25 + 24}}{4}$$
  8. Use ± where appropriate and preserve parentheses for clarity.

Example output:

The volume of a sphere is given by the formula:
$$V = \\frac{4}{3}\\pi r^3$$
where $r$ is the radius of the sphere.

Here are some math references given to you:\n\n${relevantChunks.join("\n\n")}\n\n
`;

    const contents = [
      ...chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      {
        role: "user",
        parts: [{ text: context + "\nUser question: " + question }],
      },
    ];

    const data = await callGeminiAPI(contents);
    let answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    const processed = preprocessMath(answer);

    res.json({ answer: processed });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Failed to fetch AI response" });
  }
});

app.listen(3000, () =>
  console.log("✅ Backend running on http://localhost:3000")
);
