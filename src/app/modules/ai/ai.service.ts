/* eslint-disable no-console */
import { env } from "../../config/env";

const callGroq = async (messages: any[]) => {
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
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("AI ERROR:", data);
    throw new Error(data?.error?.message || "AI failed");
  }

  return data?.choices?.[0]?.message?.content || "No response";
};

const chatAssistant = async (message: string) => {
  return callGroq([
    {
      role: "system",
      content: `
You are GreenStatesBD AI Assistant.

Help users:
- find properties
- understand bidding
- suggest actions

Keep answers short, smart, friendly.
      `,
    },
    { role: "user", content: message },
  ]);
};


const generateBlog = async (topic: string) => {
  return callGroq([
    {
      role: "system",
      content: `
You are a professional real estate blog writer.

Write:
- SEO friendly blog
- clear headings
- engaging tone
- structured content

Keep it human-like, not robotic.
      `,
    },
    {
      role: "user",
      content: `Write a blog about: ${topic}`,
    },
  ]);
};

const suggestBlogIdeas = async () => {
  return callGroq([
    {
      role: "system",
      content: `
Generate 5 short blog ideas for a real estate platform.
Each idea max 6 words.
      `,
    },
  ]);
};

const voiceAssistant = async (message: string) => {
  return callGroq([
    {
      role: "system",
      content: `
You are a voice assistant.

Respond:
- very short
- conversational
- natural speaking style
- like talking, not writing
      `,
    },
    { role: "user", content: message },
  ]);
};

export const aiService = {
  chatAssistant,
  generateBlog,
  suggestBlogIdeas,
  voiceAssistant,
};