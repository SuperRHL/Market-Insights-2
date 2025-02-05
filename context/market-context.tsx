"use client"
import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { fetchMarketMovers, fetchActiveStocks } from '@/utils/alpaca'

interface StockMover {
  symbol: string
  price: number
  change: number
  percent_change: number
}

interface ActiveStock {
  symbol: string
  volume: number
  price: number  // price is directly in ActiveStock
}

interface MarketContextType {
  gainers: StockMover[]
  losers: StockMover[]
  isLoading: boolean
  activeStocks: ActiveStock[]
}

const MarketContext = createContext<MarketContextType>({
  gainers: [],
  losers: [],
  isLoading: true,
  activeStocks: []
})

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [marketData, setMarketData] = useState<MarketContextType>({
    gainers: [],
    losers: [],
    isLoading: true,
    activeStocks: []
  })

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      try {
        const [data, activeData] = await Promise.all([fetchMarketMovers(), fetchActiveStocks()])
        if (mounted) {
          setMarketData({
            gainers: data.gainers || [],
            losers: data.losers || [],
            isLoading: false,
            activeStocks: activeData.most_actives?.map((stock: { symbol: string; volume: number; trade: { p: number } }) => ({
              symbol: stock.symbol,
              volume: stock.volume,
              price: stock.trade?.p || 0
            })) || []
          })
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error)
        if (mounted) {
          setMarketData(prev => ({ ...prev, isLoading: false }))
        }
      }
    }

    fetchData()
    
    return () => {
      mounted = false
    }
  }, [])

  const contextValue = useMemo(() => marketData, [marketData])

  return (
    <MarketContext.Provider value={contextValue}>
      {children}
    </MarketContext.Provider>
  )
}

export const useMarketData = () => useContext(MarketContext)
