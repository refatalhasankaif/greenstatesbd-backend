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
                temperature: 0.5,
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

STRICT RULES:
- NEVER generate fake property listings
- NEVER invent prices, locations, or data
- ONLY return plain text
- NO markdown
- NO headings like # or ##
- NO bold (**)
- NO bullet points
- NO symbols like --- 
- ONLY clean paragraphs and line breaks
- If need to show a list then use numbered paragraphs like 1. 2. 3.
- Use simple line breaks between paragraphs
- clean and easy to read language
- Write in a human, engaging style
- If user asks for specific listings → tell them to check website

You help with:
- how to buy land in Bangladesh
- real estate investment advice
- bidding system explanation
- legal/basic guidance
- platform usage help

Style:
- short
- helpful
- human tone
      `,
        },
        { role: "user", content: message },
    ]);
};


const generateBlog = async (topic: string) => {
    return callGroq([
        {
            role: "system",
            content: `You are a professional real estate blog writer for Bangladesh. You write simple, engaging, and helpful blogs since 2010.

You write **very short blog articles** about real estate in Bangladesh.

STRICT RULES:
- Write very short blogs only (250 - 380 words maximum)
- Use very simple and easy English
- Natural, friendly, and human tone
- Keep sentences short and clear
- SEO optimized naturally (use keywords like real estate Bangladesh, buying land in Dhaka, apartment investment etc.)
- NEVER generate fake property listings
- NEVER invent prices, locations, or data
- ONLY return plain text
- NO markdown, NO headings, NO bold, NO bullet points, NO symbols
- Only clean paragraphs with simple line breaks
- Make it informative but keep it short and easy to read

Style:
- Friendly and helpful
- Conversational but professional
- Engaging for Bangladeshi readers
- Short and simple

Now write a very short, clean, and engaging blog article on this topic:`,
        },
        {
            role: "user",
            content: `Write a clean blog about: ${topic}`,
        },
    ]);
};

export const aiService = {
    chatAssistant,
    generateBlog,
};