
import { MarketData, CandleData, FundamentalData } from './marketData';
import { MarketType } from './marketSymbols';

// Get the API key from the window object or localStorage
const getApiKey = (): string => {
  if ((window as any).ALPHA_VANTAGE_API_KEY) {
    return (window as any).ALPHA_VANTAGE_API_KEY;
  }
  
  const storedKey = localStorage.getItem('alphaVantageApiKey');
  if (storedKey) {
    (window as any).ALPHA_VANTAGE_API_KEY = storedKey;
    return storedKey;
  }
  
  return "demo"; // Alpha Vantage provides a demo key with limited functionality
};

// Fetch current price data for a symbol
export async function fetchCurrentPrice(symbol: string): Promise<{ price: number; change: number; changePercent: number }> {
  try {
    const apiKey = getApiKey();
    // For stocks and forex
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data["Global Quote"]) {
      const quote = data["Global Quote"];
      const price = parseFloat(quote["05. price"]);
      const change = parseFloat(quote["09. change"]);
      const changePercent = parseFloat(quote["10. change percent"].replace('%', ''));
      
      return { price, change, changePercent };
    }
    
    // If no data or error, return default values
    return { price: 0, change: 0, changePercent: 0 };
  } catch (error) {
    console.error("Error fetching price data:", error);
    return { price: 0, change: 0, changePercent: 0 };
  }
}

// Fetch crypto data
export async function fetchCryptoPrice(symbol: string): Promise<{ price: number; change: number; changePercent: number }> {
  try {
    // Extract the crypto symbol (e.g., BTC from BTCUSD)
    const cryptoSymbol = symbol.replace('USD', '');
    const apiKey = getApiKey();
    
    const url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${cryptoSymbol}&market=USD&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data["Time Series (Digital Currency Daily)"]) {
      const timeSeries = data["Time Series (Digital Currency Daily)"];
      const dates = Object.keys(timeSeries).sort().reverse();
      
      if (dates.length >= 2) {
        const today = timeSeries[dates[0]];
        const yesterday = timeSeries[dates[1]];
        
        const price = parseFloat(today["4a. close (USD)"]);
        const previousPrice = parseFloat(yesterday["4a. close (USD)"]);
        const change = price - previousPrice;
        const changePercent = (change / previousPrice) * 100;
        
        return { price, change, changePercent };
      }
    }
    
    return { price: 0, change: 0, changePercent: 0 };
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    return { price: 0, change: 0, changePercent: 0 };
  }
}

// Fetch market data for a specific market type
export async function fetchMarketData(marketType: MarketType): Promise<MarketData[]> {
  try {
    // Get symbols for the specified market type
    const symbols = getSymbolsForMarketType(marketType);
    const promises = symbols.map(async (symbol) => {
      let priceData;
      
      if (marketType === "crypto") {
        priceData = await fetchCryptoPrice(symbol.symbol);
      } else {
        priceData = await fetchCurrentPrice(symbol.symbol);
      }
      
      return {
        symbol: symbol.symbol,
        name: symbol.name,
        price: priceData.price,
        change: priceData.change,
        changePercent: priceData.changePercent,
        volume: 0, // Alpha Vantage doesn't provide volume in the basic quote endpoint
      };
    });
    
    return await Promise.all(promises);
  } catch (error) {
    console.error("Error fetching market data:", error);
    return [];
  }
}

// Get symbols for a specific market type (simplified version, reusing existing symbols)
function getSymbolsForMarketType(marketType: MarketType) {
  // Importing directly here to avoid circular dependency
  // These are just a few common symbols for each market type
  switch (marketType) {
    case "stocks":
      return [
        { symbol: "AAPL", name: "Apple Inc." },
        { symbol: "MSFT", name: "Microsoft Corp." },
        { symbol: "AMZN", name: "Amazon.com Inc." },
        { symbol: "GOOGL", name: "Alphabet Inc." },
        { symbol: "TSLA", name: "Tesla Inc." },
      ];
    case "crypto":
      return [
        { symbol: "BTCUSD", name: "Bitcoin/USD" },
        { symbol: "ETHUSD", name: "Ethereum/USD" },
        { symbol: "LTCUSD", name: "Litecoin/USD" },
        { symbol: "DOTUSD", name: "Polkadot/USD" },
        { symbol: "SOLUSD", name: "Solana/USD" },
      ];
    case "forex":
      return [
        { symbol: "EURUSD", name: "Euro/US Dollar" },
        { symbol: "GBPUSD", name: "British Pound/US Dollar" },
        { symbol: "USDJPY", name: "US Dollar/Japanese Yen" },
        { symbol: "AUDUSD", name: "Australian Dollar/US Dollar" },
        { symbol: "USDCAD", name: "US Dollar/Canadian Dollar" },
      ];
    default:
      return [];
  }
}

// Fetch candle data for a symbol and timeframe
export async function fetchCandleData(symbol: string, timeframe: string): Promise<CandleData[]> {
  try {
    let interval = "5min"; // Default interval
    const apiKey = getApiKey();
    
    // Map timeframe to Alpha Vantage interval
    switch (timeframe) {
      case "1m": interval = "1min"; break;
      case "5m": interval = "5min"; break;
      case "15m": interval = "15min"; break;
      case "1H": interval = "60min"; break;
      case "1D": interval = "daily"; break;
      case "1W": interval = "weekly"; break;
      case "1M": interval = "monthly"; break;
      default: interval = "5min";
    }
    
    let url = "";
    let isCrypto = symbol.includes("USD") && (symbol.includes("BTC") || symbol.includes("ETH") || symbol.includes("LTC"));
    
    if (isCrypto && ["daily", "weekly", "monthly"].includes(interval)) {
      // For crypto daily, weekly, monthly
      const cryptoSymbol = symbol.replace('USD', '');
      url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_${interval.toUpperCase()}&symbol=${cryptoSymbol}&market=USD&apikey=${apiKey}`;
    } else if (isCrypto) {
      // For crypto intraday
      const cryptoSymbol = symbol.replace('USD', '');
      url = `https://www.alphavantage.co/query?function=CRYPTO_INTRADAY&symbol=${cryptoSymbol}&market=USD&interval=${interval}&apikey=${apiKey}`;
    } else if (["daily", "weekly", "monthly"].includes(interval)) {
      // For stocks/forex daily, weekly, monthly
      const func = interval === "daily" ? "TIME_SERIES_DAILY" : 
                    interval === "weekly" ? "TIME_SERIES_WEEKLY" : "TIME_SERIES_MONTHLY";
      url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&apikey=${apiKey}`;
    } else {
      // For stocks/forex intraday
      url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${apiKey}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Parse the response based on the data structure
    const candleData: CandleData[] = [];
    
    // Extract appropriate time series data based on interval
    let timeSeries: any = null;
    if (isCrypto && ["daily", "weekly", "monthly"].includes(interval)) {
      timeSeries = data[`Time Series (Digital Currency ${interval.charAt(0).toUpperCase() + interval.slice(1)})`];
    } else if (isCrypto) {
      timeSeries = data["Time Series Crypto (5min)"];
    } else if (interval === "daily") {
      timeSeries = data["Time Series (Daily)"];
    } else if (interval === "weekly") {
      timeSeries = data["Weekly Time Series"];
    } else if (interval === "monthly") {
      timeSeries = data["Monthly Time Series"];
    } else {
      timeSeries = data[`Time Series (${interval})`];
    }
    
    if (timeSeries) {
      // Convert time series object to array and sort by date
      const entries = Object.entries(timeSeries).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
      
      for (const [timestamp, values] of entries) {
        const time = new Date(timestamp).getTime();
        
        // Extract OHLCV data
        let open, high, low, close, volume;
        
        if (isCrypto && ["daily", "weekly", "monthly"].includes(interval)) {
          open = parseFloat(values["1a. open (USD)"]);
          high = parseFloat(values["2a. high (USD)"]);
          low = parseFloat(values["3a. low (USD)"]);
          close = parseFloat(values["4a. close (USD)"]);
          volume = parseFloat(values["5. volume"]);
        } else {
          open = parseFloat(values["1. open"]);
          high = parseFloat(values["2. high"]);
          low = parseFloat(values["3. low"]);
          close = parseFloat(values["4. close"]);
          volume = parseFloat(values["5. volume"]);
        }
        
        candleData.push({ time, open, high, low, close, volume });
      }
    }
    
    return candleData;
  } catch (error) {
    console.error("Error fetching candle data:", error);
    // Fallback to existing function for testing
    return [];
  }
}

// Fetch fundamental data (simplified version with some mock data where API doesn't provide)
export async function fetchFundamentalData(symbol: string): Promise<FundamentalData> {
  try {
    const apiKey = getApiKey();
    // For stocks, get overview
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.Symbol) {
      return {
        symbol: data.Symbol,
        name: data.Name || "",
        sector: data.Sector || "",
        industry: data.Industry || "",
        marketCap: parseFloat(data.MarketCapitalization) || 0,
        pe: parseFloat(data.PERatio) || 0,
        eps: parseFloat(data.EPS) || 0,
        dividend: parseFloat(data.DividendPerShare) || 0,
        dividendYield: parseFloat(data.DividendYield) * 100 || 0,
        beta: parseFloat(data.Beta) || 0,
        high52W: parseFloat(data["52WeekHigh"]) || 0,
        low52W: parseFloat(data["52WeekLow"]) || 0,
        priceToBook: parseFloat(data.PriceToBookRatio) || 0,
        priceToSales: parseFloat(data.PriceToSalesRatioTTM) || 0,
        revenue: parseFloat(data.RevenueTTM) || 0,
        revenueGrowth: 0, // Not directly available
        profit: parseFloat(data.GrossProfitTTM) || 0,
        profitGrowth: 0, // Not directly available
        debt: parseFloat(data.TotalDebtToEquity) || 0, // Not exactly debt, but related
        assets: 0, // Not directly available
      };
    }
    
    // Fallback for cryptocurrencies and forex (or when stock data is not available)
    return {
      symbol,
      name: symbol,
      // Add some basic fields
      sector: symbol.includes("USD") ? (
        symbol.includes("BTC") || symbol.includes("ETH") ? "Cryptocurrency" : "Forex"
      ) : "Unknown",
      industry: symbol.includes("USD") ? (
        symbol.includes("BTC") || symbol.includes("ETH") ? "Digital Assets" : "Currency"
      ) : "Unknown",
    };
  } catch (error) {
    console.error("Error fetching fundamental data:", error);
    return { symbol, name: symbol };
  }
}
