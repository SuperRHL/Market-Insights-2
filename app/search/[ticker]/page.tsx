'use client';
import React, { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { typography } from '@/styles/typography';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, SearchX, AlertCircle } from "lucide-react";

// Loading skeleton component
function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="h-9 w-28" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// No results component
function NoResults({ query }: { query: string }) {
  const decodedQuery = decodeURIComponent(query);
  return (
    <Card className="w-full p-6">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <SearchX className="h-12 w-12 text-muted-foreground" />
        <h2 className={typography.h3}>No matching results</h2>
        <p className={`${typography.p} text-muted-foreground`}>
          No stocks found matching "{decodedQuery}". Try another search term.
        </p>
      </div>
    </Card>
  );
}

function ApiLimitError() {
  return (
    <Card className="w-full p-6">
      <CardHeader>
        <CardTitle className={`${typography.h3} flex items-center gap-2`}>
          <AlertCircle className="h-6 w-6 text-red-500" />
          API Limit Reached
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`${typography.p} mb-4`}>
          We've reached our API request limit. Please wait a moment and try again.
        </p>
        <p className={`${typography.p} text-muted-foreground`}>
          This usually resolves within a minute. Thank you for your patience.
        </p>
      </CardContent>
    </Card>
  );
}

async function fetchSearchResults(ticker: string) {
  const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
  const url = `https://api.polygon.io/v3/reference/tickers?type=CS&market=stocks&search=${ticker}&active=true&order=asc&limit=10&sort=ticker&apiKey=${apiKey}`;

  const response = await fetch(url);
  if (response.status === 429) {
    throw new Error('API limit reached');
  }
  if (!response.ok) {
    throw new Error(`Status: ${response.status}`);
  }
  const result = await response.json();
  return result.results;
}

export default function TickerPage({ params }: { params: { ticker: string } }) {
  const { ticker } = params;
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiLimitReached, setIsApiLimitReached] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setIsApiLimitReached(false);
        const results = await fetchSearchResults(ticker);
        
        // Check for exact match and redirect
        const exactMatch = results.find((result: any) => result.ticker.toUpperCase() === ticker.toUpperCase());
        if (exactMatch) {
          router.push(`/stock/${exactMatch.ticker}`);
          return;
        }

        setSearchResults(results);
      } catch (error: any) {
        if (error.message === 'API limit reached') {
          setIsApiLimitReached(true);
        } else {
          setError('Failed to fetch search results');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ticker, router]);

  if (isApiLimitReached) {
    return <ApiLimitError />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className={typography.h2}>Search results for "{decodeURIComponent(ticker)}"</h1>
        <span className={typography.p}>
          {searchResults.length} results
        </span>
      </div>

      <Suspense fallback={<SearchSkeleton />}>
        {isLoading ? (
          <SearchSkeleton />
        ) : error ? (
          <Card className="w-full p-6">
            <CardContent>
              <p className={`${typography.p} text-red-500`}>{error}</p>
            </CardContent>
          </Card>
        ) : searchResults.length === 0 ? (
          <NoResults query={ticker} />
        ) : (
          <div className="space-y-4">
            {searchResults.map((result: any) => (
              <Card key={result.ticker} className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h2 className={typography.h3}>{result.name}</h2>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{result.ticker}</Badge>
                      </div>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/stock/${result.ticker}`}>
                        View Details
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}
