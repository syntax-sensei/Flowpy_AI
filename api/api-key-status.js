import OpenAI from 'openai';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const hasApiKey = !!process.env.OPENAI_API_KEY;
  
  res.json({ 
    hasApiKey,
    message: hasApiKey ? 'API key is configured' : 'API key not set'
  });
}