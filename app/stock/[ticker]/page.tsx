import React from 'react';
import { StockChart } from '@/components/stock-chart';
import { StockNews } from '@/components/stock-news';
import CompanyOverviewCard from '@/components/company-overview';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { typography } from "@/styles/typography";
import { TrendingUp, ArrowRight, BarChart, Activity } from 'lucide-react';

async function fetchIndicator(ticker: string, indicator: string) {
  const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
  const url = `https://api.polygon.io/v1/indicators/${indicator}/${ticker}?timespan=day&adjusted=true&window=50&series_type=close&order=desc&limit=2&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${indicator} data: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.status === "OK" && data.results.values && data.results.values.length >= 2) {
      const today = data.results.values[0].value;
      const yesterday = data.results.values[1].value;
      const percentChange = ((today - yesterday) / yesterday) * 100;
      return { value: today, percentChange };
    } else {
      console.error(`Unexpected ${indicator} data structure:`, data);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ${indicator}:`, error);
    return null;
  }
}

export default async function StockPage({ params }: { params: { ticker: string } }) {
  const { ticker } = params;

  const [sma, ema, macd, rsi] = await Promise.all([
    fetchIndicator(ticker, 'sma'),
    fetchIndicator(ticker, 'ema'),
    fetchIndicator(ticker, 'macd'),
    fetchIndicator(ticker, 'rsi'),
  ]);

  const indicators = [
    { title: 'SMA (50)', ...sma, icon: TrendingUp },
    { title: 'EMA (50)', ...ema, icon: ArrowRight },
    { title: 'MACD', ...macd, icon: BarChart },
    { title: 'RSI', ...rsi, icon: Activity },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className={typography.h2}>{ticker} Stock Overview</h1>
      
      {/* Stock Chart */}
      <Card>
        <CardContent>
          <StockChart ticker={ticker} />
        </CardContent>
      </Card>

      {/* Technical Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {indicators.map((indicator, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {indicator.title}
              </CardTitle>
              <indicator.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {indicator.value !== undefined ? indicator.value.toFixed(2) : 'N/A'}
              </div>
              {indicator.percentChange !== undefined && (
                <p className={`text-xs ${indicator.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {indicator.percentChange >= 0 ? '▲' : '▼'} {Math.abs(indicator.percentChange).toFixed(2)}%
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Company Overview */}
      <CompanyOverviewCard ticker={ticker} />

      {/* News Section */}
      <StockNews ticker={ticker} />
    </div>
  );
}
