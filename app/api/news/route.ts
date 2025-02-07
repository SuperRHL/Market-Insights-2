import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const runtime = 'nodejs';

export async function GET() {
  try {
    const response = await fetch('https://www.nasdaq.com/feed/rssoutbound?category=Nasdaq')
    const data = await response.text()
    
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
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
