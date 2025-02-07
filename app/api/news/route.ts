import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const runtime = 'nodejs';

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('https://www.nasdaq.com/feed/rssoutbound?category=Nasdaq', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    if (!data) {
      throw new Error('Empty response received');
    }

    const $ = cheerio.load(data, { xmlMode: true })
    const items = $('item').map((_, item) => {
      const $item = $(item)
      const description = $item.find('description').text()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&quot;/g, '"') // Fix quotes
        .replace(/&#039;/g, "'") // Fix apostrophes
        .replace(/\n/g, ' ') // Remove newlines
        .trim()
      
      return {
        title: $item.find('title').text()
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'"),
        description: description.length > 150 ? description.substring(0, 150) + '...' : description,
        link: $item.find('link').text()
      }
    }).get().slice(0, 10)

    return NextResponse.json(items)
  } catch (error) {
    console.error('News fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
