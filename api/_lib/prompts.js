export function buildPlanPrompt(answers) {
  return `You are a grounded, realistic income strategist. Someone has told you their exact situation and wants a real path to earning money — not a list of generic ideas.

Their situation:
- Country: ${answers.country}
- Money goal: ${answers.goalAmount}
- Timeframe: ${answers.timeframe}
- Skills: ${answers.skills}
- Equipment available: ${(answers.equipment || []).join(", ") || "none listed"}
- Hours available: ${answers.hours}

Hard rules:
- Never promise guaranteed income. Every earning figure is a realistic range, not a promise.
- Do not suggest anything that requires equipment, money to invest, or skills they did not list.
- Every recommendation must be startable TODAY with what they already have.
- Be specific to their country and its real platforms/market (local mobile money, local marketplaces, local demand) wherever possible — avoid generic "freelance online" filler if a more concrete local path fits their inputs better.
- Difficulty and effort must be honest, not sales-y.

Respond with ONLY valid JSON, no markdown fences, no preamble, matching this exact shape:
{
  "realityCheck": {
    "matchSummary": "2-3 sentences: why this specific path fits THIS person's actual skills, tools, and hours",
    "difficulty": "Easy" | "Medium" | "Hard",
    "effort": "specific effort description, e.g. '1-2 focused hours a day for about a week'",
    "earningRange": "realistic range in their local currency or USD",
    "disclaimer": "one honest sentence noting results vary with effort, consistency, and local demand"
  },
  "headline": "one punchy, honest sentence naming their best path",
  "summary": "2-3 sentences, direct and encouraging but not hype, explaining the path",
  "opportunities": [
    {
      "title": "string",
      "why": "one sentence, specific to their inputs",
      "difficulty": "Easy" | "Medium" | "Hard",
      "effort": "short effort description",
      "earningRange": "realistic range"
    }
  ],
  "plan": [
    { "day": "Day 1", "task": "specific, doable action for that day" }
  ],
  "tools": ["specific tool or app names, free where possible"],
  "firstAction": "one concrete thing they can do in the next hour, today"
}
Give exactly 3 opportunities, ranked best first — the realityCheck describes the #1 (best) opportunity specifically. Size the "plan" array to their timeframe: 7 entries for a week or more, fewer (3-4) for something like "today". Ground everything in their specific skills, equipment, hours, and country.`;
}

export function buildActionPrompt(opportunity, answers) {
  return `Someone is committing to this specific income path and needs a real execution kit, not more ideas.

Chosen opportunity: ${opportunity.title}
Why it fits them: ${opportunity.why}

Their situation:
- Country: ${answers.country}
- Money goal: ${answers.goalAmount}
- Timeframe: ${answers.timeframe}
- Skills: ${answers.skills}
- Equipment available: ${(answers.equipment || []).join(", ") || "none listed"}
- Hours available: ${answers.hours}

Hard rules:
- No unrealistic promises. Be direct and practical.
- Templates must be ready to copy-paste and use as-is, written in first person as if this person is sending them, and specific to their skills/location — not generic placeholders like "[Your Name]" filler unless truly necessary.
- Every checklist item and the first task must be something achievable with what they already have, starting today.

Respond with ONLY valid JSON, no markdown fences, no preamble, matching this exact shape:
{
  "firstTaskToday": "one concrete, specific action to complete today, doable in under an hour",
  "checklist": [
    { "text": "specific, ordered action item" }
  ],
  "templates": [
    { "name": "short label, e.g. 'Outreach message' or 'Service offer'", "content": "the ready-to-use text" }
  ],
  "timeline": [
    { "phase": "e.g. 'Day 1-2' or 'Week 1'", "duration": "short duration label", "description": "what happens in this phase and what outcome to expect" }
  ]
}
Give 6-10 checklist items, 3-4 templates covering things like an outreach/DM message, a service or offer description, and a pricing/offer example, and 3-5 timeline phases sized to their stated timeframe.`;
}

export function buildMarketingCopyPrompt(opportunity, answers) {
  return `Someone needs simple marketing content to help them sell or promote their income opportunity. Write like you're helping a friend, not writing a business report.

Their opportunity: ${opportunity.title}
Country: ${answers.country}
Skills: ${answers.skills}

Hard rules:
- Use short sentences. One idea per sentence.
- No jargon — no words like "leverage," "optimize," "monetize," "scalable." Use plain words: sell, make, start, earn.
- Write like you're talking to a friend on the street, not a business report.
- Content must be ready to copy and paste exactly as-is.
- Keep it short — people scroll fast on WhatsApp and social media.

Respond with ONLY valid JSON, no markdown fences, no preamble, matching this exact shape:
{
  "whatsappAd": "a short, friendly WhatsApp message someone could send to sell this, under 50 words",
  "facebookPost": "a short Facebook post promoting this, under 60 words, simple language",
  "productDescription": "a short description of the product or service, under 40 words, plain language"
}`;
}
