/* Deploying
git add .
git commit -m "Update homepage or styles"
git push
*/

const MODEL = "gemini-2.5-flash";
const BOT_NAME = "Chạt bọt";
const PAGE_TITLE = `Let's chat to ${BOT_NAME}`;
const PAGE_HEADING = `Your ${BOT_NAME}`;

let docs = window.docs || [];
let currentKeyIndex = 0; // Starting from the first API key

async function callGeminiAPI(contents, question, chatHistory, relevantChunks) {
  const response = await fetch("https://glowing-waffle.onrender.com/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      chatHistory,
      relevantChunks
    })
  });

  if (!response.ok) throw new Error("Backend request failed");
  return await response.json(); // Backend returns { answer: ... }
}

function retrieveRelevantChunks(question, maxChunks = 3) {
  if (!docs.length) return [];

  const qWords = question.toLowerCase().split(/\W+/);

  const chunks = docs.flatMap(doc =>
    doc.text.split(/\n\s*\n/).map(ch => ({ id: doc.id, chunk: ch }))
  );

  const scored = chunks.map(({ id, chunk }) => {
    let score = 0;
    qWords.forEach(w => {
      if (w && chunk.toLowerCase().includes(w)) score++;
    });
    return { id, chunk, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map(s => `File ${s.id}: ${s.chunk.trim().slice(0, 800)}`)
    .filter(s => s.trim().length > 0 && s.score > 0);
}

function preprocessMath(answer) {
  if (!answer) return "";

  // Replace √(...) → \sqrt{...}
  answer = answer.replace(/√\((.*?)\)/g, "\\sqrt{$1}");

  // Replace a / b → \frac{a}{b} (basic numbers/variables)
  answer = answer.replace(/([0-9a-zA-Z()]+)\s*\/\s*([0-9a-zA-Z()]+)/g, "\\frac{$1}{$2}");

  // π → \pi
  answer = answer.replace(/π/g, "\\pi");

  // Superscripts ², ³ remain as-is
  // Optional: convert ^2 or ^3 to LaTeX if you want
  answer = answer.replace(/([a-zA-Z0-9])\^2/g, "$1^2");
  answer = answer.replace(/([a-zA-Z0-9])\^3/g, "$1^3");

  return answer;
}

document.addEventListener("DOMContentLoaded", async () => {
  document.title = PAGE_TITLE;
  document.getElementById("pageHeading").innerText = PAGE_HEADING;

  const chatbox = document.getElementById("chatbox");
  const questionInput = document.getElementById("question");
  const sendBtn = document.getElementById("sendBtn");

  let chatHistory = [];

  async function sendMessage() {
    const question = questionInput.value.trim();
    if (!question) return;

    chatbox.innerHTML += `<div class="msg user"><b>You:</b> ${question}</div>`;
    questionInput.value = "";
    chatbox.scrollTop = chatbox.scrollHeight;

    chatHistory.push({ role: "user", content: question });
    if (chatHistory.length > 12) chatHistory.shift();

    try {
      const relevant = retrieveRelevantChunks(question, 3);
      const context = relevant.length
        ? `
        You are an AI chatbot specified about mathematics named ${BOT_NAME}.
        Guidelines:
          1. Use \frac{numerator}{denominator} for fractions instead of a/b.
          2. Use \sqrt{...} for square roots, and \sqrt[3]{...} for cube roots.
          3. Use ^2, ^3, etc., for powers.
          4. Use \pi for π.
          5. Keep text sentences outside math formulas untouched.
          6. Inline formulas can be wrapped in $...$, and multiline or display formulas in $$...$$.
          7. For calculations like (5 ± √(25 + 24)) / 4, produce: 
            $$x = \frac{5 \pm \sqrt{25 + 24}}{4}$$
          8. Use ± where appropriate and preserve parentheses for clarity.

          Example output:

          The volume of a sphere is given by the formula:
          $$V = \frac{4}{3}\pi r^3$$
          where $r$ is the radius of the sphere.
        
        Here are some math references given to you:\n\n${relevant.join("\n\n")}\n\n
        `
        : "";

      const contents = [
        ...chatHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
        {
          role: "user",
          parts: [{
            text: (context ? context + "\n" : "") + "User question: " + question
          }]
        }
      ];

      const data = await callGeminiAPI(contents);
      console.log("Gemini response:", data);

      let answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

      console.log("Raw Gemini answer:", answer);

      answer = preprocessMath(answer);

      console.log("Processed Gemini answer:", answer);

      chatHistory.push({ role: "model", content: answer });
      if (chatHistory.length > 12) chatHistory.shift();

      const formattedAnswer = marked.parse(answer);

      const botDiv = document.createElement("div");
      botDiv.className = "msg bot";
      botDiv.innerHTML = `<b>${BOT_NAME}:</b><div class="bot-content">${formattedAnswer}</div>`;
      chatbox.appendChild(botDiv);

      renderMathInElement(botDiv, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false
      });

    } catch (err) {
      chatbox.innerHTML += `<div class="error"><b>Error:</b> ${err.message}</div>`;
    }

    chatbox.scrollTop = chatbox.scrollHeight;
  }

  sendBtn.addEventListener("click", sendMessage);
  questionInput.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });
});
