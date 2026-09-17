/* eslint-disable */
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL ?? "";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, idea } = req.body;

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `**New Free Validation Submission!**\n**Name:** ${name || 'N/A'}\n**Email:** ${email || 'N/A'}\n**Idea:**\n${idea}`
        })
    });
  } catch {
    // Fire and forget
  }

  return res.status(200).json({ success: true });
}
