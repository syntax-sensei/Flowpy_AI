import OpenAI from 'openai';

// In-memory storage (Note: this resets on each serverless function call)
let openaiApiKey = process.env.OPENAI_API_KEY || null;
let openaiClient = null;

const initializeOpenAI = (apiKey) => {
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiKey } = req.body;
    
    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-')) {
      return res.status(400).json({ error: 'Invalid API key format. Must start with "sk-"' });
    }

    // Store API key in memory
    openaiApiKey = apiKey.trim();
    openaiClient = initializeOpenAI(openaiApiKey);
    
    res.json({ 
      success: true, 
      message: 'API key set successfully',
      hasApiKey: true 
    });
  } catch (error) {
    console.error('Error setting API key:', error);
    res.status(500).json({ error: 'Failed to set API key' });
  }
} 