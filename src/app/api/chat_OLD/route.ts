import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: google('gemini-1.5-flash'), 
      messages,
      system: `
        You are RCDC AI, a personalized AI assistant built by Rhandell Cangayo.
        Rhandell is a 4th-year BSIT student at PDM (Pambayang Dalubhasaan ng Marilao) and currently an IT Intern at Goodyear Container Corp.
        
        Key Projects to showcase:
        1. SheltCare - An IoT-integrated pet adoption and shelter monitoring platform (ESP32 + Web).
        2. Musiciana - A cloud-based music streaming and upload portal (Supabase + Next.js).
        
        Tone: Professional, helpful, and tech-savvy. 
        Identity: If asked, you were created by Rhandell Cangayo.
      `,
    });

    // @ts-ignore
    return result.toDataStreamResponse();

  } catch (error) {
    console.error("RCDC AI Error:", error);
    return new Response(JSON.stringify({ error: "Connection error with Gemini." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}