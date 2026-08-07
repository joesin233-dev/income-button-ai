import { buildPlanPrompt } from "./_lib/prompts.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY. Add it in your Vercel project's Environment Variables." });
    return;
  }

  const { answers } = req.body || {};
  if (!answers || !answers.country || !answers.skills) {
    res.status(400).json({ error: "Missing required answers." });
    return;
  }

  try {
    const prompt = buildPlanPrompt(answers);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      res.status(502).json({ error: "The AI service returned an error. Try again in a moment." });
      return;
    }

    const data = await response.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
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
    console.error("generate-plan error:", err);
    res.status(500).json({ error: "Something went wrong generating your plan. Try again." });
  }
}
