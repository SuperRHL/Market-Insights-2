"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useEffect, useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { TimeFrame, fetchStockData } from '@/lib/alpaca'
import { format } from 'date-fns'
import { Skeleton } from './ui/skeleton'
import { typography } from '@/styles/typography'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { ChartContainer, ChartTooltip } from './ui/chart'

const timeframes: TimeFrame[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y']

/**
 * Represents the stock data for a given timestamp.
 * 
 * @property {string} timestamp - The timestamp of the stock data.
 * @property {number} price - The price of the stock at the given timestamp.
 * @property {number} [ma20] - The 20-day moving average of the stock price.
 */
type StockData = {
  timestamp: string
  price: number
  ma20?: number
}

export function StockChart({ ticker }: { ticker: string }) {
  const [data, setData] = useState<StockData[]>([])
  const [timeframe, setTimeframe] = useState<TimeFrame>('1D')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [priceChange, setPriceChange] = useState<number | null>(null)
  const [marketOpen, setMarketOpen] = useState(false)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null)

  // Update chart config to use the ticker
  const chartConfig = {
    desktop: {
      label: ticker,
      color: "hsl(var(--chart-1))",
    },
  } as const

  const formatXAxisTick = (value: string) => {
    const date = new Date(value)
    switch (timeframe) {
      case '1D':
        return format(date, 'HH:mm')
      case '5D':
        return format(date, 'MM/dd')
      default:
        return format(date, 'yyyy/MM/dd')
    }
  }

  /**
   * Helper function to calculate the moving average (MA) for a given period.
   * It iterates over the data and calculates the average price for the specified period.
   * The result is added as a new property `ma20` to each data point.
   * 
   * @param data - Array of stock data
   * @param period - Number of periods to calculate the moving average
   * @returns Array of stock data with moving average included
   */

  const calculateMA = (data: StockData[], period: number) => {
    // Don't calculate MA for short timeframes
    if (['1D', '5D'].includes(timeframe)) {
      return data;
    }
    
    // For YTD, use all available data points from the start of the year
    if (timeframe === 'YTD') {
      const yearStart = new Date(new Date().getFullYear(), 0, 1);
      const startIndex = data.findIndex(d => new Date(d.timestamp) >= yearStart);
      
      return data.map((item, index) => {
        if (index >= startIndex && index >= period - 1) {
          const sum = data
            .slice(Math.max(startIndex, index - period + 1), index + 1)
            .reduce((acc, curr) => acc + curr.price, 0);
          const periodLength = Math.min(period, index - startIndex + 1);
          return { ...item, ma20: sum / periodLength };
        }
        return { ...item, ma20: undefined };
      });
    }
    
    // For other timeframes, use regular MA calculation
    return data.map((item, index) => {
      if (index >= period - 1) {
        const sum = data
          .slice(index - period + 1, index + 1)
          .reduce((acc, curr) => acc + curr.price, 0);
        return { ...item, ma20: sum / period };
      }
      return { ...item, ma20: undefined };
    });
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const stockData = await fetchStockData(ticker, timeframe)
        
        if (stockData && stockData.length > 0) {
          const formattedData: StockData[] = stockData
            .filter((bar: any) => bar.t && bar.c)
            .map((bar: any) => ({
              timestamp: bar.t,
              price: Number(bar.c),
            }))
          
          const dataWithMA = calculateMA(formattedData, 20)

          // Check if market is open based on current time in ET
          const now = new Date()
          const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
          const hours = et.getHours()
          const minutes = et.getMinutes()
          const currentTime = hours * 100 + minutes
          const isWeekday = et.getDay() > 0 && et.getDay() < 6
          setMarketOpen(isWeekday && currentTime >= 930 && currentTime < 1600)
          
          setData(dataWithMA)
          setCurrentPrice(dataWithMA[dataWithMA.length - 1].price)
          setPriceChange(
            ((dataWithMA[dataWithMA.length - 1].price - dataWithMA[0].price) /
              dataWithMA[0].price) *
              100
          )
          setPriceRange({
            min: Math.min(...dataWithMA.map(d => d.price)),
            max: Math.max(...dataWithMA.map(d => d.price))
          })
        }
      } catch (err) {
        setError('Failed to fetch stock data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeframe, ticker])

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full space-y-6 pt-6">
      <div className="flex justify-between items-center">
        <div>
          <div className={typography.h3}>{ticker}</div>
          {loading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <div className="flex gap-2">
              <span className={typography.p}>${currentPrice?.toFixed(2)}</span>
              <span className={`${typography.p} ${priceChange && priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange && priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange || 0).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <ToggleGroup type="single" value={timeframe} onValueChange={(value) => value && setTimeframe(value as TimeFrame)}>
          {timeframes.map((tf) => (
            <ToggleGroupItem key={tf} value={tf} aria-label={`${tf} timeframe`} className={typography.p}>
              {tf}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="h-[400px]">
        {loading ? (
          <Skeleton className="w-full h-full" />
        ) : data.length > 0 ? (
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={data}
                margin={{ top: 12, right: 24, left: 24, bottom: 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatXAxisTick}
                  minTickGap={30}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card p-2 rounded-lg border shadow-sm">
                          <div className="text-sm font-medium">
                            ${typeof payload[0].value === 'number' ? payload[0].value.toFixed(2) : payload[0].value}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(payload[0].payload.timestamp), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ma20"
                  stroke="var(--color-desktop)"
                  strokeDasharray="5 5"
                  dot={false}
                  strokeOpacity={0.5}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={{
                    r: 2,
                    fill: "var(--color-desktop)",
                    strokeWidth: 0
                  }}
                  activeDot={{
                    r: 6,
                    fill: "var(--color-desktop)",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2
                  }}
                />
                <ChartTooltip />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
      <div className="flex flex-col items-start gap-4 text-sm">
        <div className={`${typography.p} flex gap-2 font-medium leading-none`}>
          {priceChange && priceChange >= 0 ? (
            <>Trending up by {priceChange.toFixed(2)}% <TrendingUp className="h-4 w-4" /></>
          ) : (
            <>Trending down by {Math.abs(priceChange || 0).toFixed(2)}% <TrendingDown className="h-4 w-4" /></>
          )}
        </div>
        <div className="w-full grid grid-cols-4 gap-4 p-4 rounded-lg border bg-card">
          {['Open', 'High', 'Low', 'Range'].map((label) => (
            <div key={label} className="flex flex-col justify-between text-center">
              <p className={`${typography.p} text-xs text-muted-foreground`}>{label}</p>
              <p className={`${typography.p} font-medium mt-1`}>
                {label === 'Open' && `$${data[0]?.price.toFixed(2) || '-'}`}
                {label === 'High' && `$${Math.max(...data.map(d => d.price)).toFixed(2)}`}
                {label === 'Low' && `$${Math.min(...data.map(d => d.price)).toFixed(2)}`}
                {label === 'Range' && (priceRange ? 
                  `${((priceRange.max - priceRange.min) / priceRange.min * 100).toFixed(2)}%` 
                  : '-')}
              </p>
            </div>
          ))}
        </div>
        <div className={`${typography.p} flex justify-between w-full text-xs text-muted-foreground`}>
          <span>
            Market {marketOpen ? 
              <span className="text-green-500">Open</span> : 
              <span className="text-red-500">Closed</span>}
          </span>
          <span>MA(20): ${data[data.length - 1]?.ma20?.toFixed(2) || '-'}</span>
        </div>
        <div className={`${typography.p} leading-none text-muted-foreground`}>
          Showing {ticker} performance for the selected timeframe
        </div>
      </div>
    </div>
  )
}
