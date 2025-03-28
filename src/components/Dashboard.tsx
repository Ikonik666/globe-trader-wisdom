import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getMarketData, getFundamentalData, getNewsData, MarketData } from '@/utils/marketData';
import { generateSignal, AnalysisResult } from '@/utils/analysis';
import { getCandleData } from '@/utils/marketData';
import { fetchMarketData as fetchAlphaVantageMarketData, fetchCandleData as fetchAlphaVantageCandleData, fetchFundamentalData as fetchAlphaVantageFundamentalData } from '@/utils/alphaVantageApi';
import { fetchMarketData as fetchTradermadeMarketData, fetchCandleData as fetchTradermadeCandleData, fetchFundamentalData as fetchTradermadeFundamentalData } from '@/utils/tradermadeApi';
import SignalCard from './SignalCard';
import MarketChart from './MarketChart';
import FundamentalData from './FundamentalData';
import NewsCard from './NewsCard';
import { toast } from "@/components/ui/use-toast";
import { Search, RefreshCcw, ArrowDownUp, Bitcoin, DollarSign, BarChart, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { MarketType, getSymbolsByMarketType } from '@/utils/marketSymbols';

interface DashboardProps {
  apiService?: string;
  geminiApiKey?: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ apiService = "tradermade", geminiApiKey }) => {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [activeSymbol, setActiveSymbol] = useState<string>("EURUSD");
  const [searchTerm, setSearchTerm] = useState('');
  const [signal, setSignal] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [marketType, setMarketType] = useState<MarketType>("forex");
  const [currentTimeframe, setCurrentTimeframe] = useState("1D");
  const [usingLiveData, setUsingLiveData] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  
  useEffect(() => {
    loadMarketData(marketType);
  }, [apiService]);

  const loadMarketData = async (type: MarketType) => {
    setLoading(true);
    setLoadError(null);
    
    try {
      const fetchFn = apiService === "tradermade" ? fetchTradermadeMarketData : fetchAlphaVantageMarketData;
      const data = await fetchFn(type);
      
      if (data && data.length > 0) {
        setMarkets(data);
        setUsingLiveData(true);
        setRateLimited(false);
        
        let initialSymbol;
        if (type === "crypto") {
          initialSymbol = "BTCUSD";
        } else if (type === "forex") {
          initialSymbol = "EURUSD";
        } else {
          initialSymbol = data[0].symbol;
        }
        setActiveSymbol(initialSymbol);
        generateSignalForSymbol(initialSymbol, data, currentTimeframe);
        
        toast({
          title: "Live Data Loaded",
          description: `Using real-time market data from ${apiService === "tradermade" ? "TraderMade" : "Alpha Vantage"}.`,
        });
      } else {
        throw new Error("No data returned from API");
      }
    } catch (error) {
      console.error("Error loading market data:", error);
      
      if (error instanceof Error && error.message.includes("rate limit")) {
        setRateLimited(true);
        setLoadError(`${apiService === "tradermade" ? "TraderMade" : "Alpha Vantage"} API rate limit reached. Using demo data instead. Please try again later or upgrade your API plan.`);
        
        toast({
          title: "API Rate Limit Reached",
          description: `${apiService === "tradermade" ? "TraderMade" : "Alpha Vantage"} API rate limit reached. Using demo data instead.`,
          variant: "destructive",
        });
      } else {
        setLoadError("Failed to load market data. Using mock data instead.");
        
        toast({
          title: "Using Mock Data",
          description: "Could not fetch live data. Using demo data instead.",
          variant: "destructive",
        });
      }
      
      const mockData = getMarketData(type);
      setMarkets(mockData);
      setUsingLiveData(false);
      
      let initialSymbol;
      if (type === "crypto") {
        initialSymbol = "BTCUSD";
      } else if (type === "forex") {
        initialSymbol = "EURUSD";
      } else {
        initialSymbol = mockData[0].symbol;
      }
      setActiveSymbol(initialSymbol);
      generateSignalForSymbol(initialSymbol, mockData, currentTimeframe);
    } finally {
      setLoading(false);
    }
  };
  
  const generateSignalForSymbol = async (symbol: string, currentMarkets: MarketData[] = markets, timeframe: string = currentTimeframe) => {
    setLoading(true);
    try {
      const marketData = currentMarkets.find(m => m.symbol === symbol) || currentMarkets[0];
      if (!marketData) {
        toast({
          title: "Error",
          description: "Unable to find market data for the selected symbol",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      let candles;
      let fundamentalData;
      
      if (usingLiveData && !rateLimited) {
        try {
          const fetchCandleFn = apiService === "tradermade" ? fetchTradermadeCandleData : fetchAlphaVantageCandleData;
          const fetchFundamentalFn = apiService === "tradermade" ? fetchTradermadeFundamentalData : fetchAlphaVantageFundamentalData;
          
          candles = await fetchCandleFn(symbol, timeframe);
          fundamentalData = await fetchFundamentalFn(symbol);
        } catch (error) {
          console.error("Error fetching live data:", error);
          
          if (error instanceof Error && error.message.includes("rate limit")) {
            setRateLimited(true);
            setLoadError(`${apiService === "tradermade" ? "TraderMade" : "Alpha Vantage"} API rate limit reached. Using demo data for charts. Please try again later or upgrade your API plan.`);
            
            toast({
              title: "API Rate Limit Reached",
              description: `Using demo data for charts now. The ${apiService === "tradermade" ? "TraderMade" : "Alpha Vantage"} API rate limit has been reached.`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Data Fetch Error",
              description: "Using mock data for charts. Could not fetch live chart data.",
              variant: "destructive",
            });
          }
          
          candles = getCandleData(symbol, timeframe);
          fundamentalData = getFundamentalData(symbol);
        }
      } else {
        candles = getCandleData(symbol, timeframe);
        fundamentalData = getFundamentalData(symbol);
      }
      
      const newsData = getNewsData();
      
      const generatedSignal = generateSignal(
        symbol,
        marketData,
        candles,
        fundamentalData,
        newsData,
        timeframe
      );
      
      setSignal(generatedSignal);
      
      toast({
        title: `New ${generatedSignal.signal.replace('_', ' ').toUpperCase()} Signal`,
        description: `${symbol}: ${generatedSignal.reasoning[0]}`,
        variant: generatedSignal.signal.includes('buy') ? "default" : 
                 generatedSignal.signal.includes('sell') ? "destructive" : "default",
      });
    } catch (error) {
      console.error("Error generating signal:", error);
      toast({
        title: "Error",
        description: "Failed to generate trading signal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (activeSymbol) {
      generateSignalForSymbol(activeSymbol, markets, currentTimeframe);
    }
  }, [activeSymbol, currentTimeframe]);
  
  const refreshData = () => {
    loadMarketData(marketType);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const changeMarketType = (type: MarketType) => {
    setMarketType(type);
    loadMarketData(type);
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    setCurrentTimeframe(newTimeframe);
    // Signal will be regenerated via the useEffect that watches activeSymbol and currentTimeframe
  };
  
  const filteredMarkets = markets.filter(market => 
    market.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    market.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const activeMarket = markets.find(m => m.symbol === activeSymbol);
  const activeMarketFundamentals = getFundamentalData(activeSymbol);
  const newsData = getNewsData();
  
  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Trading Analysis</h1>
          <p className="text-muted-foreground">
            Smart Money Concepts & Institutional Analysis
            {usingLiveData ? (
              rateLimited ? (
                <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">API Rate Limited</Badge>
              ) : (
                <Badge variant="outline" className="ml-2">
                  {apiService === "tradermade" ? "TraderMade" : "Alpha Vantage"} Live Data
                </Badge>
              )
            ) : (
              <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">Demo Data</Badge>
            )}
          </p>
          {loadError && (
            <div className="flex items-center text-sm text-destructive mt-1">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {loadError}
            </div>
          )}
          {rateLimited && (
            <div className="flex items-center text-xs text-muted-foreground mt-1 max-w-md">
              <Info className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>
                {apiService === "tradermade" ? 
                  "TraderMade free tier has limited API calls. Consider upgrading your API key for more requests." :
                  "Alpha Vantage free tier is limited to 25 API calls per day. Consider upgrading your API key for more requests."}
              </span>
            </div>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Button 
            onClick={refreshData} 
            variant="outline" 
            className="flex items-center"
            disabled={loading}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="glass overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Markets</CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 ${marketType === "stocks" ? "bg-muted" : ""}`}
                    onClick={() => changeMarketType("stocks")}
                    title="Stocks"
                  >
                    <BarChart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 ${marketType === "crypto" ? "bg-muted" : ""}`}
                    onClick={() => changeMarketType("crypto")}
                    title="Cryptocurrencies"
                  >
                    <Bitcoin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 ${marketType === "forex" ? "bg-muted" : ""}`}
                    onClick={() => changeMarketType("forex")}
                    title="Forex"
                  >
                    <DollarSign className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="relative my-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search symbols..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-80 overflow-y-auto">
                {filteredMarkets.map((market) => (
                  <div key={market.symbol} className="relative">
                    <button
                      className={`w-full p-3 text-left hover:bg-muted/50 transition-colors flex items-center justify-between ${activeSymbol === market.symbol ? 'bg-muted/40' : ''}`}
                      onClick={() => setActiveSymbol(market.symbol)}
                    >
                      <div>
                        <div className="font-medium">{market.symbol}</div>
                        <div className="text-xs text-muted-foreground">{market.name}</div>
                      </div>
                      <div className="text-right">
                        <div>${market.price.toFixed(2)}</div>
                        <div className={`text-xs ${market.change >= 0 ? 'text-success' : 'text-danger'}`}>
                          {market.change >= 0 ? '+' : ''}{market.change.toFixed(2)} ({market.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </button>
                    <Separator />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {signal && (
            <div className="mt-6 animate-slide-up">
              <SignalCard signal={signal} />
            </div>
          )}
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          {activeMarket && (
            <MarketChart 
              symbol={activeMarket.symbol}
              name={activeMarket.name}
              price={activeMarket.price}
              change={activeMarket.change}
              changePercent={activeMarket.changePercent}
              onTimeframeChange={handleTimeframeChange}
              currentTimeframe={currentTimeframe}
              usingLiveData={usingLiveData}
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeMarketFundamentals && (
              <FundamentalData data={activeMarketFundamentals} />
            )}
            
            <NewsCard news={newsData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
