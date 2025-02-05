"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useEffect, useState, memo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { typography } from "@/styles/typography"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ForexQuote {
  symbol: string
  price: number
  change: number
  changesPercentage: number
}

const FOREX_PAIRS = [
  'EURUSD',
  'GBPUSD',
  'USDJPY',
  'USDCAD'
]

const SkeletonLoader = memo(() => (
  <Card>
    <CardHeader>
      <CardTitle className={typography.h3}>Forex Market Status</CardTitle>
      <CardDescription className={typography.p}>Current exchange rates</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </CardContent>
  </Card>
))

export function ForexMarketStatusCard() {
  const [forexData, setForexData] = useState<ForexQuote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForexPair = async (pair: string) => {
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/quote/${pair}?apikey=${process.env.NEXT_PUBLIC_FINANCIAL_MODELING_API_KEY}`
      )
      // Added error handling for non-ok responses
      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${pair}`)
      }
      const data = await response.json()
      if (!data || data.length === 0) {
        throw new Error(`No data found for ${pair}`)
      }
      return data[0] // API returns an array with a single quote
    }

    const fetchAllPairs = async () => {
      try {
        const promises = FOREX_PAIRS.map(pair => fetchForexPair(pair))
        const results = await Promise.all(promises)
        setForexData(results)
        setError(null)
      } catch (error) {
        console.error('Failed to fetch forex data:', error)
        setError('Unable to fetch forex data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllPairs()
  }, [])

  if (isLoading) {
    return <SkeletonLoader />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={typography.h3}>Forex</CardTitle>
        <CardDescription className={typography.p}>Market status</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className={cn("text-red-500", typography.p)}>{error}</div>
        ) : (
          forexData.map((quote, index) => (
            <div key={index}>
              <div className="py-2 flex justify-between items-center">
                <Button 
                  variant="link" 
                  className={cn("h-auto p-0", typography.h4)}
                >
                  {quote.symbol.slice(0, 3)}/{quote.symbol.slice(3)}
                </Button>
                <div className="flex flex-col items-end">
                  <div className={cn("text-sm", typography.p)}>
                    ${quote.price.toFixed(4)}
                  </div>
                  <div className={cn(
                    "text-xs",
                    typography.p,
                    quote.changesPercentage < 0 ? "text-red-500" : "text-green-500"
                  )}>
                    {quote.change > 0 ? '+' : ''}{quote.changesPercentage.toFixed(2)}%
                  </div>
                </div>
              </div>
              {index < forexData.length - 1 && <Separator />}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
