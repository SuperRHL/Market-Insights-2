import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { typography } from "@/styles/typography";
import { format } from 'date-fns';

type NewsItem = {
  id: number;
  headline: string;
  author: string;
  created_at: string;
  summary: string;
  url: string;
  source: string;
  symbols: string[];
};

async function fetchNewsData(ticker: string) {
  const ALPACA_API_KEY = process.env.NEXT_PUBLIC_ALPACA_API_KEY;
  const ALPACA_SECRET_KEY = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY;
  
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'APCA-API-KEY-ID': ALPACA_API_KEY,
      'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY
    }
  };

  const url = `https://data.alpaca.markets/v1beta1/news?sort=desc&symbols=${ticker}&limit=10&`;
  
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error('Failed to fetch news data');
    }
    const data = await response.json();
    return data.news;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function StockNews({ ticker }: { ticker: string }) {
  const newsItems: NewsItem[] = await fetchNewsData(ticker);

  return (
    <Card>
      <CardHeader>
        <CardTitle className={typography.h3}>Latest News</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {newsItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <div className="space-y-2">
                <h4 className={`${typography.h4} mb-2`}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {item.headline}
                  </a>
                </h4>
                <p className={`${typography.p} text-sm text-muted-foreground mb-2`}>
                  {format(new Date(item.created_at), 'PPP')} | {item.author}
                </p>
                <p className={`${typography.p} text-sm mb-2`}>{item.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {item.symbols.map((symbol) => (
                    <Link key={symbol} href={`/stock/${symbol}`} passHref>
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                        {symbol}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
              {index < newsItems.length - 1 && <Separator className="my-4" />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
