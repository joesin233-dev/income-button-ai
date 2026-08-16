import { buildBusinessStarterPrompt } from "./_lib/prompts.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing GEMINI_API_KEY. Add it in your Vercel project's Environment Variables." });
    return;
  }

  const { opportunity, answers } = req.body || {};
  if (!opportunity || !answers) {
    res.status(400).json({ error: "Missing opportunity or answers." });
    return;
  }

  try {
    const prompt = buildBusinessStarterPrompt(opportunity, answers);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      res.status(502).json({ error: "The AI service returned an error. Try again in a moment." });
      return;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error("Failed to parse AI response as JSON:", clean);
      res.status(502).json({ error: "The AI response couldn't be read. Try again." });
      return;
    }

    res.status(200).json(parsed);
  } catch (err) {
    console.error("generate-business-starter error:", err);
    res.status(500).json({ error: "Something went wrong generating your business starter kit. Try again." });
  }
}
