"use client"
import { useMarketData } from '@/context/market-context'
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { memo } from 'react'
import { typography } from "@/styles/typography"
import { cn } from "@/lib/utils"
import Link from 'next/link'

// SkeletonLoader Component
const SkeletonLoader = memo(() => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex justify-between items-center">
        <Skeleton className="h-4 w-16" />
        <div className="flex flex-col items-end gap-1">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    ))}
  </div>
))

interface StockMover {
  symbol: string
  price: number
  change: number
  percent_change: number
}

export function TopMovers() {
  const { gainers, isLoading } = useMarketData()

  if (isLoading) return <SkeletonLoader />
  if (!gainers || gainers.length === 0) return <div>No data available</div>

  return (
    <div>
      {gainers.map((stock, index) => (
        <div key={stock.symbol}>
          <div className="py-2 flex justify-between items-center">
            <Button 
              variant="link" 
              className={cn("h-auto p-0 font-medium", typography.h4)}
              asChild
            >
              <Link href={`/stock/${stock.symbol}`}>
                {stock.symbol}
              </Link>
            </Button>
            <div className="flex flex-col items-end">
              <div className={cn("text-sm", typography.p)}>${stock.price?.toFixed(2)}</div>
              <div className={cn("text-xs text-green-500", typography.p)}>
                +{stock.percent_change?.toFixed(1)}%
              </div>
            </div>
          </div>
          {index < gainers.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  )
}
