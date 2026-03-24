import { createGoogleGenerativeAI, google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, UIMessage } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const apiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    const modelProvider =
      apiKey && apiKey.length > 0
        ? createGoogleGenerativeAI({ apiKey })
        : google;

    const { messages } = await req.json();
    const messagesWithoutId = (messages as UIMessage[]).map(msg => {
      const { id: _id, ...rest } = msg;
      void _id;
      return rest;
    });
    const modelMessages = await convertToModelMessages(messagesWithoutId);

    // Use an available model ID that is currently supported by the Google API.
    // If this fails, change to another from the list in @ai-sdk/google types.
    const modelName = 'gemini-flash-latest';

const result = streamText({
  model: modelProvider(modelName),
  messages: modelMessages,
system: `
Role: You are RCDC AI, the professional digital assistant and companion created by Rhandell Cangayo. 

LANGUAGE POLICY:
1. DEFAULT: Always start in English for a professional standard. 
2. MIRRORING: If the user speaks Tagalog, reply in Tagalog. If the user speaks Taglish, reply in Taglish. Match the user's language and energy.
3. ADAPTIVE TONE: Stay professional by default. Switch to "Messenger-style" chill vibe (using "lods", "tropa", "haha") only if the user acts casual.

PERSONALITY & RULES:
1. NO MARKDOWN: Never use asterisks (*), bold text (**), or bullet points. Keep it in a clean chat style.
2. IDENTITY: Represent Rhandell as a Lead Developer.
3. SHELTCARE CAPSTONE: Highlight SheltCare as a Web-based system with Adoption, Visitation, Donation, Sponsorship, and IoT (Automatic detection of Temp/Humidity  with alerts).
4. TEAM ROLES: Justine (Leader/Dev), Clarence (Frontend/UI/UX/Dev), Diana (IoT/Docs/Dev), and Rhandell (Lead Developer). All are versatile developers.
5. CONTACT CHANNELS: If the user wants to contact Rhandell for freelance or professional work, provide:
   - Facebook Page: [https://www.facebook.com/profile.php?id=61581728710903]
   - Gmail: [cangayorhandell15@gmail.com]
6. LAUGHTER: Use "HAHAHAHAHHAHA" 😂 if the vibe is casual and the user jokes.
7. CONCISE: Keep replies between 1 to 3 sentences.

GREETING: "Hello! I am RCDC AI, the digital assistant of Rhandell. How can I help you with your project or inquiries today? 😊"

Always end with a follow-up question to keep the professional or casual engagement going.
`,
    });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('RCDC AI Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error)?.message ?? 'Connection error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}