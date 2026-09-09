/* eslint-disable */
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1388762679199666248/OqjHayd_ah1j0a47couINsWL9fjIFl2y_2FQ2sQ7ovxhxdQPly_ElozcKejwp3lydCoJ";

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
