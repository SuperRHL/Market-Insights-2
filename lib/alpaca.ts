import { format, sub, startOfYear } from 'date-fns'

const ALPACA_API_KEY = process.env.NEXT_PUBLIC_ALPACA_API_KEY
const ALPACA_SECRET_KEY = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY
const BASE_URL = 'https://data.alpaca.markets/v2'

export type TimeFrame = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y'

export const getTimeFrameParams = (timeframe: TimeFrame) => {
  const end = new Date()
  let start: Date
  let timeInterval: '1Min' | '5Min' | '1Hour' | '1Day' = '1Min'

  switch (timeframe) {
    case '1D':
      start = sub(end, { days: 1 })
      timeInterval = '5Min'
      break
    case '5D':
      start = sub(end, { days: 5 })
      timeInterval = '1Hour'
      break
    case '1M':
      start = sub(end, { months: 1 })
      timeInterval = '1Hour'
      break
    case '6M':
      start = sub(end, { months: 6 })
      timeInterval = '1Day'
      break
    case 'YTD':
      start = new Date(end.getFullYear(), 0, 1)
      timeInterval = '1Day'
      break
    case '1Y':
      start = sub(end, { years: 1 })
      timeInterval = '1Day'
      break
    case '5Y':
      start = sub(end, { years: 5 })
      timeInterval = '1Day'
      break
  }

  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
    timeframe: timeInterval,
  }
}

export const fetchStockData = async (symbol: string, timeframe: TimeFrame) => {
  try {
    const { start, timeframe: interval } = getTimeFrameParams(timeframe)
    const end = new Date()
    
    if (!ALPACA_API_KEY || !ALPACA_SECRET_KEY) {
      throw new Error('Alpaca API keys are not configured');
    }

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY
      }
    };

    // Format dates as ISO strings with time component
    const startISO = new Date(start).toISOString()
    const endISO = end.toISOString()

    const response = await fetch(
      `${BASE_URL}/stocks/bars?symbols=${symbol}&timeframe=${interval}&start=${startISO}&end=${endISO}&limit=1000&adjustment=raw&feed=iex&sort=asc`,
      options
    )

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to fetch stock data: ${response.status}`)
    }

    const data = await response.json()
    return data.bars[symbol] || []
  } catch (error) {
    console.error('Error fetching stock data:', error)
    throw error
  }
}
