// chat.js (fixed)
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

// allow only your frontend origin (adjust if needed)
app.use(
  cors({
    origin: "https://hoanggiaminh2k13.github.io",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json({ limit: "1mb" })); // parse JSON bodies

const API_KEYS = [
  process.env.GEMINI_KEY_1,
  process.env.GEMINI_KEY_2,
  process.env.GEMINI_KEY_3,
  process.env.GEMINI_KEY_4,
  process.env.GEMINI_KEY_5,
  process.env.GEMINI_KEY_6,
  process.env.GEMINI_KEY_7
].filter(Boolean);

let currentKeyIndex = 0;

const MODEL = "gemini-2.5-flash";
const BOT_NAME = "MathemAItics";

function preprocessMath(answer) {
  if (!answer) return "";
  return answer
    .replace(/√\((.*?)\)/g, "\\sqrt{$1}")
    .replace(/([0-9a-zA-Z()]+)\s*\/\s*([0-9a-zA-Z()]+)/g, "\\frac{$1}{$2}")
    .replace(/π/g, "\\pi")
    .replace(/([a-zA-Z0-9])\^2/g, "$1^2")
    .replace(/([a-zA-Z0-9])\^3/g, "$1^3");
}

/**
 * Call Gemini (Generative Language) with provided "contents" array.
 * Retries across API_KEYS on failure.
 */
async function callGeminiAPI(contents) {
  if (!API_KEYS.length) throw new Error("No API keys configured.");

  // try up to API_KEYS.length times rotating index
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    const key = API_KEYS[currentKeyIndex];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

      const response = await axios.post(
        url,
        { contents }, // keep the same shape your frontend/backend used
        { headers: { "Content-Type": "application/json" }, timeout: 30_000 }
      );

      const data = response.data;
      if (response.status === 200 && data?.candidates?.length) {
        return data;
      }

      console.warn("API returned no candidates, rotating key. Key:", key, "data:", data);
    } catch (err) {
      console.error("Request error with key:", key, err?.message || err);
    }

    // rotate to next key
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  }

  throw new Error("All API keys failed.");
}

// Basic in-memory docs store (optional endpoint below to upload docs)
let serverDocs = []; // if you want server-side docs persistence

app.post("/uploadDocs", (req, res) => {
  try {
    const incoming = req.body.docs;
    if (!Array.isArray(incoming)) {
      return res.status(400).json({ error: "docs must be an array" });
    }
    serverDocs = incoming.map(d => ({ id: d.id, text: d.text }));
    console.log("📚 uploadDocs -> serverDocs length:", serverDocs.length);
    return res.json({ ok: true, count: serverDocs.length });
  } catch (err) {
    console.error("uploadDocs error:", err);
    return res.status(500).json({ error: "upload failed" });
  }
});

// Main endpoint used by the frontend
app.post("/api/ask", async (req, res) => {
  try {
    // Defensive parsing: frontend might send chatHistory/relevantChunks as strings
    let { question } = req.body;
    let { chatHistory, relevantChunks } = req.body;

    // Attempt to parse if strings
    if (typeof chatHistory === "string") {
      try {
        chatHistory = JSON.parse(chatHistory);
      } catch (e) {
        // leave as-is; we'll coerce to empty array below
      }
    }
    if (typeof relevantChunks === "string") {
      try {
        relevantChunks = JSON.parse(relevantChunks);
      } catch (e) {
        // leave as-is; we'll coerce to empty array below
      }
    }

    if (!question || typeof question !== "string") question = String(question || "").trim();

    if (!Array.isArray(chatHistory)) chatHistory = [];
    if (!Array.isArray(relevantChunks)) relevantChunks = [];
    
    console.log("Received relevantChunks count:", relevantChunks);

    // build context including the relevant chunks (if any)
    const refsText =
      relevantChunks.length > 0 ? `Here are some math references given to you:\n\n${relevantChunks.join("\n\n")}\n\n` : "";

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
  9. Only answer questions that are about or related to math.
  10. Don't jump to the answer too fast; guide the student step-by-step.
  
${refsText}
`.trim();

    // Build contents for Gemini. Use chatHistory if present, then the user prompt including context.
    const contents = [
      ...chatHistory
        .filter(m => m && typeof m === "object" && "role" in m && "content" in m)
        .map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
      {
        role: "user",
        parts: [{ text: `${context}\n\nUser question: ${question}` }]
      }
    ];

    // Debug log the final prompt length (avoid printing very long text)
    console.log("Sending contents to Gemini. messages:", contents.length);

    const data = await callGeminiAPI(contents);

    const answerRaw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    const answer = preprocessMath(answerRaw);

    return res.json({ answer });
  } catch (err) {
    console.error("Error in /api/ask:", err?.message || err);
    return res.status(500).json({ error: "Failed to fetch AI response" });
  }
});

app.get("/", (req, res) => res.send("Server is alive and running!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));

// optional self-ping to keep Render awake (adjust PING_URL or remove if you don't want it)
const PING_URL = process.env.PING_URL || "https://glowing-waffle.onrender.com";
const PING_INTERVAL = 14 * 60 * 1000;
setInterval(async () => {
  try {
    await axios.get(PING_URL);
    console.log("🔁 Pinged self to stay awake");
  } catch (err) {
    console.error("Ping failed:", err?.message || err);
  }
}, PING_INTERVAL);
