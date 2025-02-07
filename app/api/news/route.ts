import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const runtime = 'nodejs';

let cachedData: any = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const URLS = [
  'https://www.nasdaq.com/feed/rssoutbound?category=Nasdaq',
  'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^IXIC,^GSPC&region=US&lang=en-US'
];

async function fetchWithTimeout(url: string, timeout: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET() {
  try {
    // Return cached data if valid
    if (cachedData && Date.now() - lastFetch < CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    // Try each URL with reduced timeout
    let data = null;
    for (const url of URLS) {
      try {
        data = await fetchWithTimeout(url, 5000); // 5 second timeout
        if (data) break;
      } catch (e) {
        console.error(`Failed to fetch from ${url}:`, e);
        continue;
      }
    }

    if (!data) {
      throw new Error('All data sources failed');
    }

    const $ = cheerio.load(data, { xmlMode: true });
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

    // Cache the results
    cachedData = items;
    lastFetch = Date.now();

    return NextResponse.json(items);
  } catch (error) {
    console.error('News fetch error:', error);
    // Return cached data if available, even if expired
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
