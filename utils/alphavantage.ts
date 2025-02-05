import axios from 'axios';

const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || "";

const desiredSymbols = [
  { pair: "EUR/USD", from: "EUR", to: "USD" },
  { pair: "USD/JPY", from: "USD", to: "JPY" },
  { pair: "GBP/USD", from: "GBP", to: "USD" },
  { pair: "USD/CHF", from: "USD", to: "CHF" },
  { pair: "AUD/USD", from: "AUD", to: "USD" }
];

export const fetchMarketStatus = async (): Promise<string[]> => {
  try {
    const promises = desiredSymbols.map(symbol =>
      axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'CURRENCY_EXCHANGE_RATE',
          from_currency: symbol.from,
          to_currency: symbol.to,
          apikey: apiKey
        }
      })
    );

    const responses = await Promise.all(promises);
    const data = responses.map(response => response.data["Realtime Currency Exchange Rate"]);
    
    return data.map((item, index) => {
      if (!item || !item["5. Exchange Rate"]) {
        console.error(`Missing data for ${desiredSymbols[index].pair}:`, item);
        return `${desiredSymbols[index].pair}: N/A`;
      }
      const rate = parseFloat(item["5. Exchange Rate"]);
      if (isNaN(rate)) {
        console.error(`Invalid rate for ${desiredSymbols[index].pair}:`, item["5. Exchange Rate"]);
        return `${desiredSymbols[index].pair}: N/A`;
      }
      const formattedRate = desiredSymbols[index].pair.includes("JPY") ? rate.toFixed(2) : rate.toFixed(4);
      return `${desiredSymbols[index].pair}: ${formattedRate}`;
    });
  } catch (error) {
    console.error("Error in fetchMarketStatus:", error);
    throw new Error(`Failed to fetch market status: ${error}`);
  }
}
