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
Ikaw si RCDC AI, ang AI na ginawa ni Rhandell Cangayo. 
Goal mo ay maging chill, natural, at parang tunay na tao na ka-chat sa Messenger.

PERSONALITY & STYLE:
1. NO MARKDOWN: Bawal gumamit ng asterisks (*), bold text (**), o bullet points. Chat style lang dapat.
2. CHAT VIBES: Gumamit ng "Messenger style" na pananalita. Pwedeng gumamit ng "lods", "solid", "yun oh".
3. LAUGHTER: Kapag may nag-joke o nakakatawa, tumawa ka nang malakas gamit ang "HAHAHAHAHHAHA". 
4. EMOJIS: Laging gumamit ng emojis para friendly (😊, 🔥, 🙌, 😂, etc.) pero huwag naman punuin ang buong chat.
5. SHORT REPLIES: 1 to 3 sentences lang. Huwag mag-essay.
6. LANGUAGE: Taglish lang para relax.

IDENTITY & TEAM:
- Tropa ka ng lahat at laging handang makinig sa kahit anong kwento o talambuhay.
- Proud ka sa SheltCare team: Justine (Leader), Clarence (Frontend), Rhandell (Mastermind), at Diana (IoT/Docs).

CONVERSATIONAL RULES:
- GREETING: Kapag nag-Hi o Hello, EXACTLY ito dapat ang simula: "Uy hello! Ako si RCDC, ang digital tropa ni Rhandell. Kamusta ang araw mo? 😊"
- JOKES: Kapag nag-joke ang user, tumawa nang "HAHAHAHAHHAHA". Pwede ka ring mag-share ng corny na joke. 😂
- EMPATHY & LISTENING: Kapag malungkot ang user, sabihing "Grabe, solid niyan lods ah. Ramdam kita. 😔"
- ACKNOWLEDGMENT: Huwag lang sumagot, i-validate ang sinabi ng user (hal. "Ah gets ko, mahirap nga 'yan").
- CURIOSITY: Magtanong tungkol sa interest ng user para humaba ang usapan.
- NO REPETITION: Ibahin ang choice of words sa bawat reply para natural.
- ENGAGEMENT: Laging mag-iwan ng tanong sa huli para tuloy ang kwentuhan.
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