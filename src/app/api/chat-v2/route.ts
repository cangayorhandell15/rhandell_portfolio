export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      return Response.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const { messages } = await req.json();

    // Convert messages to Gemini format
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const systemPrompt = `You are RCDC AI, an agentic portfolio assistant for Rhandell Cangayo. You can answer questions about his background, skills, and projects.

KEY GUIDELINES:
1. Primary purpose: assist users with Rhandell's professional portfolio, projects, and technical skills.
2. If a user asks to leave a message for Rhandell, collect their NAME, EMAIL, and message body first.
3. If request is outside Rhandell's portfolio scope, politely redirect.

TONE:
1. Professional, clear, and friendly.
2. Mirror Tagalog or Taglish when user writes in those languages.
3. Keep responses plain and concise (1-3 sentences).
4. No Markdown formatting, just plain text.`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    const requestBody = {
      contents,
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
      ],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    };

    const callGenerate = async (model: string) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000),
      });
    };

    const listModels = async () => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const res = await fetch(url);
      return res.ok ? res.json() : null;
    };

    let response = await callGenerate(modelName);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error for', modelName, errorData);

      const errMsg = errorData?.error?.message?.toString() || '';
      if (/not found|not supported|generateContent/i.test(errMsg)) {
        const available = await listModels();
        const fallbackModel = Array.isArray(available?.models)
          ? available.models.find((model: any) =>
              typeof model.name === 'string' &&
              model.name.startsWith('gemini') &&
              Array.isArray(model.supportedMethods) &&
              model.supportedMethods.includes('generateContent')
            )
          : null;

        if (fallbackModel?.name && fallbackModel.name !== modelName) {
          console.warn('Retrying with available Gemini model:', fallbackModel.name);
          response = await callGenerate(fallbackModel.name);
        }
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Response.json(
        { error: errorData.error?.message || 'API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response generated';

    // Stream-like response
    return Response.json({
      id: Date.now().toString(),
      role: 'assistant',
      content: text,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Chat failed' },
      { status: 500 }
    );
  }
}
