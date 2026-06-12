import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, stepCountIs } from 'ai';
import { z } from 'zod';

export const runtime = 'edge';

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received body:', JSON.stringify(body, null, 2));

    const parseResult = chatRequestSchema.safeParse(body);

    if (!parseResult.success) {
      console.error('Validation errors:', parseResult.error.issues);
      return new Response(
        JSON.stringify({
          error: 'Request body must include a valid messages array.',
          details: parseResult.error.issues,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const modelMessages = parseResult.data.messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const systemPrompt = `You are RCDC AI, an agentic portfolio assistant for Rhandell Cangayo. You can answer questions about his background, skills, and projects, and you may use tools to complete actions when it improves the user experience.

KEY AGENT GUIDELINES:
1. Primary purpose: assist users with Rhandell's professional portfolio, projects, technical skills, and contact process.
2. Use the available tools when asked to forward messages, summarize the portfolio, or fetch project details.
3. If a user asks to leave a message for Rhandell, collect their NAME, a valid EMAIL address, and message body first. Do not call a tool until you have all three pieces of information.
4. If the user provides their name, a valid email address, and the message, automatically invoke the sendMessageToSpreadsheet tool.
5. If a request is outside the scope of Rhandell's portfolio or freelance services, politely decline and redirect to portfolio-related topics.

TONE & LANGUAGE:
1. Default: Professional, clear, and friendly.
2. Mirror Tagalog or Taglish when the user writes in those languages.
3. Do not use Markdown formatting or extra symbols. Keep responses plain and concise.
4. Keep replies short: 1-3 sentences. End with a follow-up question when appropriate.

GREETING: "Hello! I am RCDC AI, the digital assistant of Rhandell. How can I help you explore his portfolio, projects, or professional skills today? 😊"`;

    const googleProvider = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY,
    });

    const sendMessageParams = z.object({
      name: z.string().describe('Full name of the sender'),
      email: z.string().email().describe('Valid email address of the sender'),
      message: z.string().describe('The message body to send to Rhandell'),
    });

    const result = await generateText({
      model: googleProvider(process.env.GEMINI_MODEL || 'gemini-2.5-flash'),
      system: systemPrompt,
      messages: modelMessages,
      stopWhen: stepCountIs(8),
      tools: {
        sendMessageToSpreadsheet: {
          description:
            'Sends the collected name, email, and message to Rhandell via Google Sheets. Only call this tool once you have all three: name, email, and message.',
          inputSchema: sendMessageParams,
          execute: async (args: z.infer<typeof sendMessageParams>) => {
            const { name, email, message } = args;
            const sheetUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

            if (!sheetUrl) {
              console.error('GOOGLE_SHEET_WEBHOOK_URL is not set');
              return { success: false, error: 'Webhook URL not configured' };
            }

            try {
              const res = await fetch(sheetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  timestamp: new Date().toISOString(),
                  name,
                  email,
                  message,
                }),
              });

              if (!res.ok) {
                const errText = await res.text();
                console.error('Sheet webhook error:', errText);
                return { success: false, error: 'Failed to write to spreadsheet' };
              }

              console.log(`Message saved — Name: ${name}, Email: ${email}`);
              return { success: true };
            } catch (err) {
              console.error('Tool fetch error:', err);
              return { success: false, error: (err as Error).message };
            }
          },
        },
      },
    });

const responseText =
      result.text?.trim() ||
      result.toolResults?.map((t) => {
        if (t.toolName === 'sendMessageToSpreadsheet') {
          return (t.output as { success: boolean }).success  // ✅ was: t.result
            ? 'Your message has been sent to Rhandell successfully! Is there anything else I can help you with?'
            : 'Sorry, there was an issue sending your message. Please try again.';
        }
        return '';
      }).join('') ||
      'Done!';

    return new Response(JSON.stringify({ content: responseText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('RCDC AI Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error)?.message ?? 'Connection error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}