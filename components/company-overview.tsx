"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { typography } from "@/styles/typography"
import { Building2, Briefcase, DollarSign, Globe, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

type CompanyOverview = {
  ticker: string,
  name: string,
  description: string,
  sic_description: string,
  homepage_url: string,
  market_cap: number,
  locale: string,
}

async function fetchCompanyOverview(ticker: string): Promise<CompanyOverview> {
  const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY_2;
  const res = await fetch(`https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${apiKey}`)
  if (!res.ok) throw new Error('Failed to fetch company overview')
  const data = await res.json()
  return data.results
}

function formatMarketCap(marketCap: number | undefined): string {
  if (marketCap === undefined) return 'N/A';
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  return `$${marketCap.toLocaleString()}`;
}

function toSentenceCase(str: string | null | undefined): string {
  if (!str || typeof str !== 'string') {
    return str as string || '';
  }
  return str.toLowerCase().replace(/^\w|\s\w/g, function (letter) {
    return letter.toUpperCase();
  });
}

export default function CompanyOverviewCard({ ticker }: { ticker: string }) {
  const [overview, setOverview] = useState<CompanyOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadOverview() {
      try {
        const data = await fetchCompanyOverview(ticker);
        setOverview(data);
      } catch (err) {
        setError('Failed to fetch company overview');
      } finally {
        setIsLoading(false);
      }
    }
    loadOverview();
  }, [ticker]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error || !overview) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className={`${typography.p} text-red-500`}>{error || 'Failed to load company overview'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className={typography.h3}>{overview.name} Overview</CardTitle>
        {overview.homepage_url && (
          <Button variant="outline" asChild>
            <a href={overview.homepage_url} target="_blank" rel="noopener noreferrer">
              Visit
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <p className={typography.p}><strong>Industry:</strong> {toSentenceCase(overview.sic_description)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <p className={typography.p}><strong>Locale:</strong> {overview.locale.toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className={typography.p}>
              <strong>Market Cap:</strong> {formatMarketCap(overview.market_cap)}
            </p>
          </div>
        </div>
        <div>
          <p className={typography.p}>
            {overview.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
