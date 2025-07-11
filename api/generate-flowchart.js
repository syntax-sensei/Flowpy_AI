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
    const { description, answers } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    let enhancedDescription = description;
    if (answers && Object.keys(answers).length > 0) {
      enhancedDescription += "\n\nUser clarifications:";
      Object.entries(answers).forEach(([questionId, answerId]) => {
        enhancedDescription += `\n- Question ${questionId}: ${answerId}`;
      });
    }

    const prompt = `You are an expert Mermaid flowchart designer. Create a clear, professional flowchart based on the process description and user clarifications.

Process with clarifications:
${enhancedDescription}

CRITICAL REQUIREMENTS FOR VALID MERMAID SYNTAX:
1. Use ONLY simple node IDs: A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z
2. Node labels must be simple text without special characters (no colons, dashes, quotes, or symbols)
3. Use [text] for rectangular nodes and {text} for diamond decision nodes
4. Use --> for arrows with proper spacing
5. Use |text| for arrow labels
6. Start with "flowchart TD" (top-down direction)
7. Each line must follow the pattern: ID[Label] --> ID[Label] or ID{Label} --> ID[Label]
8. Keep labels short and descriptive (max 40 characters)
9. Avoid any special characters in labels except spaces
10. Ensure all brackets and parentheses are properly matched

VALID SYNTAX EXAMPLES:
flowchart TD
    A[Start Process] --> B{Check Condition}
    B -->|Yes| C[Perform Action]
    B -->|No| D[Skip Action]
    C --> E[End Process]
    D --> E

flowchart TD
    A[Customer Order] --> B{Payment Valid}
    B -->|Yes| C[Process Order]
    B -->|No| D[Reject Order]
    C --> E[Send Confirmation]
    D --> F[Send Error Message]
    E --> G[End]
    F --> G

Respond with ONLY the Mermaid code, no explanations or markdown formatting.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    let code = completion.choices[0].message.content.trim();
    
    // Log the original response for debugging
    console.log('Original GPT-4 response:', JSON.stringify(code));
    
    // Remove markdown code blocks
    if (code.startsWith('```mermaid')) {
      code = code.replace(/^```mermaid\n/, '').replace(/\n```$/, '');
    } else if (code.startsWith('```')) {
      code = code.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    console.log('After markdown removal:', JSON.stringify(code));
    
    // Clean up the code to ensure valid Mermaid syntax
    code = code.trim();
    
    // Split into lines for better processing
    let lines = code.split('\n').filter(line => line.trim());
    
    // Ensure first line is flowchart declaration
    if (!lines[0] || (!lines[0].includes('flowchart TD') && !lines[0].includes('flowchart LR'))) {
      lines.unshift('flowchart TD');
    }
    
    // Process each line individually to preserve structure
    lines = lines.map((line, index) => {
      if (index === 0) {
        // Keep the flowchart declaration as-is
        return line.trim();
      }
      
      // Clean up node labels in content lines
      let cleanedLine = line
        .replace(/\[([^\]]*)\]/g, (match, content) => {
          const cleanedContent = content
            .replace(/[:;"'`]/g, '') // Remove specific problematic characters
            .replace(/[^\w\s\-().]/g, '') // Keep basic chars, parentheses, dots
            .trim()
            .substring(0, 40); // Limit to 40 characters
          return `[${cleanedContent}]`;
        })
        // Clean up decision nodes
        .replace(/\{([^}]*)\}/g, (match, content) => {
          const cleanedContent = content
            .replace(/[:;"'`]/g, '') // Remove specific problematic characters
            .replace(/[^\w\s\-().?]/g, '') // Keep basic chars, parentheses, dots, question marks
            .trim()
            .substring(0, 40); // Limit to 40 characters
          return `{${cleanedContent}}`;
        })
        // Clean up arrow labels
        .replace(/\|([^|]*)\|/g, (match, content) => {
          const cleanedContent = content
            .replace(/[^\w\s\-]/g, '') // Remove special characters
            .trim()
            .substring(0, 20); // Shorter limit for labels
          return `|${cleanedContent}|`;
        })
        // Ensure arrows are properly formatted
        .replace(/\s*-->\s*/g, ' --> ');
      
      return cleanedLine.trim();
    });
    
    // Rejoin the lines
    code = lines.join('\n');
    
    // Log the final processed code
    console.log('Final processed code:', JSON.stringify(code));
    
    // Validate basic structure
    if (!code.includes('-->')) {
      // Log the code for debugging
      console.error('Code missing arrows:', code);
      
      // Try a simple fallback
      if (code.includes('flowchart TD') || code.includes('flowchart LR')) {
        // Return the code as-is if it looks like valid Mermaid
        res.json({ mermaidCode: code });
        return;
      }
      
      throw new Error('Generated flowchart is missing connections. Please try again.');
    }

    res.json({ mermaidCode: code });
  } catch (error) {
    console.error('Error generating flowchart:', error);
    res.status(500).json({ error: `Error generating flowchart: ${error.message}` });
  }
} 