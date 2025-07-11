import OpenAI from 'openai';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key not configured. Please set your OpenAI API key in Vercel environment variables.' });
    }

    const openai = new OpenAI({ apiKey });
    const { mermaidCode, question } = req.body;

    if (!mermaidCode || !question) {
      return res.status(400).json({ error: 'Mermaid code and question are required' });
    }

    const prompt = `You are an expert process analyst. Given the following flowchart in Mermaid syntax, answer the user's question as clearly and concisely as possible. If the answer is not present in the flowchart, say so.

Flowchart:

${mermaidCode}

Question: ${question}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    const answer = completion.choices[0].message.content.trim();
    res.json({ answer });
  } catch (error) {
    console.error('Error asking flowchart:', error);
    res.status(500).json({ error: `Failed to get answer: ${error.message}` });
  }
} 