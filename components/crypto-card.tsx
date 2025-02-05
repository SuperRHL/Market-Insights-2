"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useEffect, useState, memo } from "react"
import { fetchCryptoQuotes } from "@/utils/alpaca"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { typography } from "@/styles/typography"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CryptoQuote {
  symbol: string
  ask: number
  bid: number
}

// SkeletonLoader Component
const SkeletonLoader = memo(() => (
  <Card>
    <CardHeader>
      <CardTitle className={typography.h3}>Popular Crypto</CardTitle>
      <CardDescription className={typography.p}>Live cryptocurrency prices</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </CardContent>
  </Card>
))

export function CryptoCard() {
  const [quotes, setQuotes] = useState<CryptoQuote[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCryptoQuotes()
        const formattedQuotes = Object.entries(data.quotes).map(([symbol, quote]: [string, any]) => ({
          symbol,
          ask: quote.ap,
          bid: quote.bp
        }))
        setQuotes(formattedQuotes)
      } catch (error) {
        console.error('Failed to fetch crypto quotes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <SkeletonLoader />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={typography.h3}>Crypto</CardTitle>
        <CardDescription className={typography.p}>Top cryptocurrencies</CardDescription>
      </CardHeader>
      <CardContent>
        {quotes.slice(0, 5).map((quote, index) => (
          <div key={quote.symbol}>
            <div className="py-2 flex justify-between items-center">
              <Button 
                variant="link" 
                className={cn("h-auto p-0", typography.h4)}
              >
                {quote.symbol.replace('/USD', '')}
              </Button>
              <div className="flex flex-col items-end">
                <div className={cn("text-sm", typography.p)}>
                  ${quote.ask?.toFixed(2)}
                </div>
                <div className={cn("text-xs text-muted-foreground", typography.p)}>
                  Spread: ${((quote.ask - quote.bid)).toFixed(2)}
                </div>
              </div>
            </div>
            {index < 4 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
