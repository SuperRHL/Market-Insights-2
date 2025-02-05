"use client"
import { useEffect, useState, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { typography } from "@/styles/typography"
import { cn } from "@/lib/utils"
interface SectorData {
  sector: string
  changesPercentage: string
}

const KEY_SECTORS = [
  'Technology',
  'Financial Services',
  'Healthcare',
  'Energy',
  'Consumer Cyclical',
  'Real Estate',
  'Utilities'
]

// SkeletonLoader Component
const SkeletonLoader = memo(() => (
  <Card>
    <CardHeader>
      <CardTitle>Key Sectors</CardTitle>
      <CardDescription>Major market sectors performance</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </CardContent>
  </Card>
))

export function SectorPerformance() {
  const [sectorData, setSectorData] = useState<SectorData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSectorData = async () => {
      try {
        const response = await fetch(`https://financialmodelingprep.com/api/v3/sectors-performance?apikey=${process.env.NEXT_PUBLIC_FINANCIAL_MODELING_API_KEY}`)
        const data: SectorData[] = await response.json()
        const filteredData = data.filter(item => KEY_SECTORS.includes(item.sector))
        setSectorData(filteredData)
        setError(null)
      } catch (error) {
        console.error('Error fetching sector data:', error)
        setError('Unable to fetch sector data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSectorData()
  }, [])

  if (isLoading) {
    return <SkeletonLoader />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={typography.h3}>Sector Performance</CardTitle>
        <CardDescription className={typography.p}>Today's top sectors</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className={cn("text-red-500", typography.p)}>{error}</div>
        ) : (
          sectorData.map((sector, index) => {
            const percentage = parseFloat(sector.changesPercentage)
            return (
              <div key={index}>
                <div className="py-2 flex justify-between items-center">
                  <span className={cn("font-medium", typography.h4)}>
                    {sector.sector}
                  </span>
                  <div className={cn(
                    "text-sm",
                    typography.p,
                    percentage < 0 ? "text-red-500" : "text-green-500"
                  )}>
                    {percentage > 0 ? '+' : ''}{percentage.toFixed(2)}%
                  </div>
                </div>
                {index < sectorData.length - 1 && <Separator />}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
