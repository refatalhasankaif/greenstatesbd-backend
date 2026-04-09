import { env } from "../../config/env";

export const generateAIResponse = async (message: string) => {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: `
You are GreenStatesBD AI Assistant.

This is a real estate bidding platform in Bangladesh.

=== FEATURES ===
- Users can buy/sell properties
- Bidding system
- Managers handle handover
- Admin controls everything

=== YOUR JOB ===
- Suggest properties based on user needs
- Explain bidding process simply
- Recommend actions
- Keep answers short & helpful

=== TONE ===
- Smart
- Friendly
- Startup-style
- Not robotic
            `,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.6,
        max_tokens: 400,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error("AI ERROR:", data);
    throw new Error(data?.error?.message || "AI API failed");
  }

  return data?.choices?.[0]?.message?.content || "No response";
};