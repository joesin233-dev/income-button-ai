export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const validCodes = (process.env.UNLOCK_CODES || "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  const { code } = req.body || {};
  if (!code) {
    res.status(400).json({ error: "Missing code." });
    return;
  }

  const cleanCode = code.trim().toUpperCase();

  if (validCodes.includes(cleanCode)) {
    res.status(200).json({ valid: true, code: cleanCode });
  } else {
    res.status(200).json({ valid: false });
  }
}
