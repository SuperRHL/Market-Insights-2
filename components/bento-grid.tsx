import { MarketProvider } from "@/context/market-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CryptoCard } from "./crypto-card"
import { NewsSection } from "./news-section"
import { TopLosers } from "./top-losers"
import { TopMovers } from "./top-movers"
import { useEffect, useState } from "react"
import { fetchMarketStatus } from "@/utils/finnhub"
import { ForexMarketStatusCard } from "./forex-card"
import { SectorPerformance } from "./sector-performance"
import { typography } from "@/styles/typography"
import { StockChart } from "./stock-chart"

export function BentoGrid() {
  const [marketStatus, setMarketStatus] = useState<string[] | null>(null)

  useEffect(() => {
    const getMarketStatus = async () => {
      try {
        const status = await fetchMarketStatus()
        setMarketStatus(status)
      } catch (error) {
        console.error(error)
      }
    }

    getMarketStatus()
  }, [])

  return (
    <MarketProvider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Large feature card */}
        <Card className="md:col-span-2 md:row-span-2">
          <CardHeader>
            <CardTitle className={typography.h3}>Market Overview</CardTitle>
            <CardDescription className={typography.p}>Real-time market insights and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <StockChart />
          </CardContent>
        </Card>

        {/* Regular cards */}
        <Card>
          <CardHeader>
            <CardTitle className={typography.h3}>Top Gainers</CardTitle>
            <CardDescription className={typography.p}>Biggest price increases</CardDescription>
          </CardHeader>
          <CardContent>
            <TopMovers />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className={typography.h3}>Top Losers</CardTitle>
            <CardDescription className={typography.p}>Biggest price drops</CardDescription>
          </CardHeader>
          <CardContent>
            <TopLosers />
          </CardContent>
        </Card>

        {/* Three vertical cards - stack on mobile, side by side on desktop */}
        <div className="space-y-4 md:space-y-4">
          <CryptoCard />
          <ForexMarketStatusCard />
          <SectorPerformance />
        </div>

        {/* News card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className={typography.h3}>Market News</CardTitle>
            <CardDescription className={typography.p}>Latest updates and headlines</CardDescription>
          </CardHeader>
          <CardContent>
            <NewsSection />
          </CardContent>
        </Card>
      </div>
    </MarketProvider>
  )
}
