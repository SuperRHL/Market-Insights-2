const finnhub = require('finnhub');

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || "";
const finnhubClient = new finnhub.DefaultApi()

const desiredSymbols = ["EUR/USD", "USD/JPY", "GBP/USD", "USD/CHF", "AUD/USD"];

export const fetchMarketStatus = async (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    finnhubClient.forexSymbols("OANDA", (error: any, data: any, response: any) => {
      if (error) {
        reject(`Failed to fetch market status: ${error}`)
      } else {
        const filteredData = data.filter((item: any) => desiredSymbols.includes(item.displaySymbol));
        resolve(filteredData.map((item: any) => item.displaySymbol));
      }
    });
  });
}
