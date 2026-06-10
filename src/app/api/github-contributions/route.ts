import { NextResponse } from 'next/server';

const repoUsername = 'cangayorhandell15';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const year = Number(url.searchParams.get('year')) || new Date().getFullYear();
  const username = url.searchParams.get('username') || repoUsername;
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;
  const apiUrl = `https://github.com/users/${username}/contributions?from=${from}&to=${to}`;

  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `GitHub fetch failed: ${response.statusText}`, status: response.status },
      { status: response.status },
    );
  }

  const html = await response.text();
  const contributions: Array<{ date: string; count: number }> = [];

  const countMatches = Array.from(html.matchAll(/data-count="(\d+)"\s+data-date="(\d{4}-\d{2}-\d{2})"/g));
  if (countMatches.length > 0) {
    for (const match of countMatches) {
      const count = Number(match[1]);
      const date = match[2];
      contributions.push({ count, date });
    }
  } else {
    const tooltipRegex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*>[\s\S]*?<tool-tip[^>]*>([\s\S]*?)<\/tool-tip>/g;
    for (const match of html.matchAll(tooltipRegex)) {
      const date = match[1];
      const tooltipText = match[2].trim();
      let count = 0;

      const countMatch = tooltipText.match(/(\d+) contribution/);
      if (countMatch) {
        count = Number(countMatch[1]);
      }

      contributions.push({ count, date });
    }
  }

  const totalContributions = contributions.reduce((sum, item) => sum + item.count, 0);

  return NextResponse.json({
    username,
    year,
    totalContributions,
    contributions,
    fetchedAt: new Date().toISOString(),
  });
}
