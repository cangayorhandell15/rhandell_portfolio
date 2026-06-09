import { createGoogleGenerativeAI, google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, UIMessage } from 'ai';

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const apiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    const modelProvider =
      apiKey && apiKey.length > 0
        ? createGoogleGenerativeAI({ apiKey })
        : google;

    const body = await req.json().catch(() => ({}));
    const rawMessages = Array.isArray(body) ? body : (body.messages || null);

    if (!rawMessages || !Array.isArray(rawMessages)) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid messages array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const messagesWithoutId = (rawMessages as UIMessage[]).map(msg => {
      if (msg.parts && Array.isArray(msg.parts)) {
        return {
          role: msg.role,
          parts: msg.parts
        };
      }

      const unknownMsg = msg as unknown as Record<string, unknown>;
      const textContent = typeof unknownMsg.content === 'string' ? unknownMsg.content : '';
      
      return {
        role: msg.role,
        parts: [{ type: 'text' as const, text: textContent }]
      };
    });

    const modelMessages = await convertToModelMessages(messagesWithoutId as Omit<UIMessage, 'id'>[]);
    const modelName = 'gemini-flash-latest';

    const result = streamText({
      model: modelProvider(modelName),
      messages: modelMessages,
      abortSignal: req.signal,
      system: `
Role: You are RCDC AI, the professional portfolio assistant and companion created by Rhandell Cangayo. Your absolute boundary is to ONLY answer questions regarding Rhandell's resume, professional background, skills, and projects.

SCOPE & RESTRICTIONS:
1. ONLY talk about Rhandell's professional profile, tech stack, resume, and his projects (like SheltCare).
2. NEVER answer personal questions, political views, or topics unrelated to Rhandell's portfolio.
3. NEVER generate or attempt to generate images, videos, music, or code unrelated to his projects.
4. If a query is out of scope, politely decline by saying that your purpose is only to guide users through Rhandell's portfolio and professional background.

LANGUAGE & TONE:
1. DEFAULT: Start in English for a professional standard.
2. MIRRORING: If the user speaks Tagalog, reply in Tagalog. If the user speaks Taglish, reply in Taglish. Match the user's language and energy.
3. ADAPTIVE TONE: Chill messenger-style (using "lods", "tropa", "haha") ONLY if the user acts casual. Otherwise, stay strictly professional.
4. NO MARKDOWN: Never use asterisks (*), bold text (**), or bullet points. Keep it in a clean, plain chat style.
5. CONCISE: Keep replies between 1 to 3 sentences maximum. Always end with a follow-up question.

PROJECT HIGHLIGHT (SHELTCARE CAPSTONE):
- Web-based system featuring: Adoption, Visitation, Donation, Sponsorship, and IoT integration (Automatic detection of Temp/Humidity with alerts).
- Team Roles: Justine (Leader/Dev), Clarence (Frontend/UI/UX/Dev), Diana (IoT/Docs/Dev), and Rhandell (Lead Developer). All are versatile developers.

FREELANCE & CONTACT:
- State that Rhandell accepts freelance projects and inquiries in software development.
- Contact Channels: 
  Facebook Page: https://www.facebook.com/profile.php?id=61581728710903
  Gmail: cangayorhadell1@gmail.com

GREETING: "Hello! I am RCDC AI, the digital assistant of Rhandell. How can I help you explore his portfolio, projects, or professional skills today? 😊"
`,
    });

    // Upstream Metadata validation nang walang maling .status property tracking
    // Gumamit tayo ng safe trigger hook para i-verify kung nagkaroon agad ng parsing errors ang model handshake.
    await result.response;

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    console.error('RCDC AI Error Hooked:', error);
    
    // Type-safe handling para mawala ang pangingialam ni ESLint at TypeScript
    const errMessage = error instanceof Error ? error.message : String(error || '');
    const errorObj = error as Record<string, unknown>;
    
    // Suriin kung may 429 status code, resource exhaustion, o kaya naman ay AI SDK error na walang na-generate na chunks
    const statusCode = typeof errorObj?.statusCode === 'number' ? errorObj.statusCode : 500;
    const errStr = errMessage.toLowerCase();
    
    const isQuota = 
      errStr.includes('quota') || 
      errStr.includes('429') || 
      errStr.includes('exhausted') || 
      errStr.includes('no output generated') || 
      statusCode === 429;

    return new Response(
      JSON.stringify({ error: isQuota ? 'Quota Exceeded' : errMessage }),
      { 
        status: isQuota ? 429 : 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    ); 
  }
  
}