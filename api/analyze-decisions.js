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
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const prompt = `You are an expert flowchart analyst. Analyze this process description and identify ONLY the most critical ambiguous decision points that would significantly impact the flowchart logic.

Process: ${description}

IMPORTANT GUIDELINES:
1. Only ask questions if there's genuine ambiguity that would change the flowchart structure
2. Don't ask obvious questions or questions about implementation details
3. Focus on business logic decisions that affect the flow
4. Provide 2-4 highly relevant, specific options that cover the main scenarios
5. Make options mutually exclusive and comprehensive

For each critical ambiguous decision point, provide:
1. A clear, specific question about the business logic
2. 2-4 specific options that would result in different flowchart paths
3. Include an "Other (specify)" option for edge cases

Respond in this exact JSON format:
{
  "questions": [
    {
      "id": "q1",
      "question": "What constitutes a 'successful payment'?",
      "options": [
        {"id": "a", "text": "Full payment received"},
        {"id": "b", "text": "Partial payment accepted (minimum 50%)"},
        {"id": "c", "text": "Payment authorization received (not necessarily settled)"},
        {"id": "d", "text": "Other (specify)"}
      ]
    }
  ]
}

If the process is clear and unambiguous, return: {"questions": []}

Only ask questions that would genuinely change the flowchart structure.`;

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

    const responseText = completion.choices[0].message.content.trim();
    let questions = [];
    
    try {
      const parsed = JSON.parse(responseText);
      questions = parsed.questions || [];
    } catch (parseError) {
      console.error('Failed to parse questions:', parseError);
      questions = [];
    }

    res.json({ questions });
  } catch (error) {
    console.error('Error analyzing decisions:', error);
    res.status(500).json({ error: `Error analyzing process: ${error.message}` });
  }
} 