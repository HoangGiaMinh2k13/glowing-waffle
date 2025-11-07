/* Deploying
git add .
git commit -m "Update homepage or styles"
git push
*/

const MODEL = "gemini-2.5-flash";
const BOT_NAME = "MathemAItics";
const PAGE_TITLE = `Let's chat to ${BOT_NAME}`;
const PAGE_HEADING = `Your ${BOT_NAME}`;

// === Document setup ===
if (!Array.isArray(window.docs)) {
  window.docs = [];
}

let currentKeyIndex = 0;

// === Typing indicator ===
function showTyping() {
  if (document.querySelector(".typing-indicator")) return;

  const typingDiv = document.createElement("div");
  typingDiv.className = "msg bot";
  typingDiv.innerHTML = `
    <div class="typing-indicator">
      <span></span><span></span><span></span>
    </div>
  `;
  const chatbox = document.getElementById("chatbox");
  chatbox.appendChild(typingDiv);
  chatbox.scrollTo({ top: chatbox.scrollHeight, behavior: "smooth" });
}

function hideTyping() {
  const typing = document.querySelector(".typing-indicator");
  if (typing) typing.parentElement.remove();
}

// === Typewriter effect ===
async function typeTextHTML(container, html, speed = 10) {
  return new Promise(resolve => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const nodes = Array.from(temp.childNodes);
    let i = 0;

    function showNext() {
      if (i < nodes.length) {
        container.appendChild(nodes[i].cloneNode(true));
        i++;
        setTimeout(showNext, speed);
      } else {
        resolve();
      }
    }

    showNext();
  });
}

// === Gemini API ===
async function callGeminiAPI(question, chatHistory, relevantChunks) {
  try {
    const response = await fetch("https://glowing-waffle.onrender.com/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, chatHistory, relevantChunks })
    });
    if (!response.ok) throw new Error(`Backend request failed: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error("❌ API error:", err);
    throw err;
  }
}

// === Document retriever ===
function retrieveRelevantChunks(question, maxChunks = 3) {
  if (!window.docs.length) return [];

  const qWords = question.toLowerCase().split(/\W+/);

  const chunks = window.docs.flatMap(doc =>
    doc.text.split(/\n\s*\n/).map(ch => ({ id: doc.id, chunk: ch }))
  );

  const scored = chunks.map(({ id, chunk }) => {
    const lower = chunk.toLowerCase();
    const score = qWords.reduce((acc, w) => acc + (w && lower.includes(w) ? 1 : 0), 0);
    return { id, chunk, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map(s => `File ${s.id}: ${s.chunk.trim().slice(0, 800)}`);
}

// === Math preprocessor ===
function preprocessMath(answer = "") {
  return answer
    .replace(/√\((.*?)\)/g, "\\sqrt{$1}")
    .replace(/([0-9a-zA-Z()]+)\s*\/\s*([0-9a-zA-Z()]+)/g, "\\frac{$1}{$2}")
    .replace(/π/g, "\\pi")
    .replace(/([a-zA-Z0-9])\^2/g, "$1^2")
    .replace(/([a-zA-Z0-9])\^3/g, "$1^3");
}

// === Main logic ===
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ main.js loaded");
  document.title = PAGE_TITLE;
  document.getElementById("pageHeading").innerText = PAGE_HEADING;

  const chatbox = document.getElementById("chatbox");
  const questionInput = document.getElementById("question");
  const sendBtn = document.getElementById("sendBtn");
  let chatHistory = [];

  async function sendMessage() {
    const question = questionInput.value.trim();
    if (!question) return;

    // User bubble
    chatbox.innerHTML += `<div class="msg user"><b>You:</b> ${question}</div>`;
    questionInput.value = "";
    chatbox.scrollTo({ top: chatbox.scrollHeight, behavior: "smooth" });

    chatHistory.push({ role: "user", content: question });
    if (chatHistory.length > 12) chatHistory.shift();

    showTyping();

    try {
      const relevant = retrieveRelevantChunks(question, 3);

      const data = await callGeminiAPI(question, chatHistory, relevant);
      hideTyping();

      let answer =
        data?.answer ||
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response.";
      answer = preprocessMath(answer);

      chatHistory.push({ role: "model", content: answer });
      if (chatHistory.length > 12) chatHistory.shift();

      const formattedAnswer = marked.parse(answer);

      // === Create bot bubble and animate ===
      const botDiv = document.createElement("div");
      botDiv.className = "msg bot";
      botDiv.innerHTML = `<b>${BOT_NAME}:</b><div class="bot-content"></div>`;
      chatbox.appendChild(botDiv);

      const botContent = botDiv.querySelector(".bot-content");

      // Animate typing (render after complete)
      await typeTextHTML(botContent, formattedAnswer, 10);

      renderMathInElement(botDiv, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false
      });

      chatbox.scrollTo({ top: chatbox.scrollHeight, behavior: "smooth" });
    } catch (err) {
      hideTyping();
      chatbox.innerHTML += `<div class="msg bot error"><b>Error:</b> ${err.message}</div>`;
      chatbox.scrollTo({ top: chatbox.scrollHeight, behavior: "smooth" });
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  questionInput.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });
});
