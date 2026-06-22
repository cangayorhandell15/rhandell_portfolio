import { NextResponse } from 'next/server';

const PROJECTS_TO_CHECK = [
  { name: 'Portfolio', url: 'https://rhandell-portfolio.vercel.app' },
  { name: 'Musiciana', url: 'https://rhandell-musiciana-tjxh.vercel.app' }
];

export async function GET() {
  try {
    // Sabay-sabay nating i-pi-ping ang mga links gamit ang Promise.all
    const statusResults = await Promise.all(
      PROJECTS_TO_CHECK.map(async (project) => {
        const startTime = Date.now();
        try {
          // Gumamit ng HEAD method para mabilis at walang mabigat na data payload
          const res = await fetch(project.url, { 
            method: 'HEAD', 
            cache: 'no-store' 
          });
          
          const latency = Date.now() - startTime;
          
          return {
            name: project.name,
            url: project.url,
            status: res.ok ? 'online' : 'offline',
            latency: latency,
            code: res.status
          };
        } catch {
          // FIX: Tinanggal ang unused 'error' variable sa catch block (Inayos ang '@typescript-eslint/no-unused-vars')
          return {
            name: project.name,
            url: project.url,
            status: 'offline',
            latency: 0,
            code: 500,
            note: 'Server cannot be reached'
          };
        }
      })
    );

    return NextResponse.json(statusResults, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate', // Para laging sariwa ang data
      }
    });
  } catch (err) {
    // FIX: Pinapalitan ang 'error: any' ng type-safe error validation (Inayos ang '@typescript-eslint/no-explicit-any')
    const errorMessage = err instanceof Error ? err.message : 'Unknown backend telemetry error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}