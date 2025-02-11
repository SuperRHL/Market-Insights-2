const ALPACA_API_KEY = process.env.NEXT_PUBLIC_ALPACA_API_KEY
const ALPACA_SECRET_KEY = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY
const ALPACA_BASE_URL = process.env.NEXT_PUBLIC_ALPACA_BASE_URL

if (!ALPACA_API_KEY || !ALPACA_SECRET_KEY || !ALPACA_BASE_URL) {
  throw new Error('Missing Alpaca API configuration')
}

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    'APCA-API-KEY-ID': ALPACA_API_KEY,
    'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY
  }
};

export async function fetchMarketMovers() {
  try {
    const response = await fetch(`${ALPACA_BASE_URL}/screener/stocks/movers?top=5`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to fetch market movers: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function fetchActiveStocks() {
  try {
    const response = await fetch(`${ALPACA_BASE_URL}/screener/stocks/most-actives?by=volume&top=5`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to fetch active stocks: ${response.status}`);
    }
    
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function fetchCryptoQuotes() {
  try {
    const response = await fetch('https://data.alpaca.markets/v1beta3/crypto/us/latest/quotes?symbols=BTC/USD,ETH/USD,SOL/USD,XRP/USD,DOGE/USD', options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to fetch crypto quotes: ${response.status}`);
    }
    
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
