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
import SignalCard from './SignalCard';
import MarketChart from './MarketChart';
import FundamentalData from './FundamentalData';
import NewsCard from './NewsCard';
import { toast } from "@/components/ui/use-toast";
import { Search, RefreshCcw, ArrowDownUp, Bitcoin, DollarSign, BarChart, TrendingUp } from 'lucide-react';
import { MarketType, getSymbolsByMarketType } from '@/utils/marketSymbols';

const Dashboard: React.FC = () => {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [activeSymbol, setActiveSymbol] = useState<string>("AAPL");
  const [searchTerm, setSearchTerm] = useState('');
  const [signal, setSignal] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [marketType, setMarketType] = useState<MarketType>("stocks");
  
  useEffect(() => {
    loadMarketData(marketType);
  }, []);

  const loadMarketData = (type: MarketType) => {
    const marketData = getMarketData(type);
    setMarkets(marketData);
    
    if (marketData.length > 0) {
      const initialSymbol = marketData[0].symbol;
      setActiveSymbol(initialSymbol);
      generateSignalForSymbol(initialSymbol, marketData);
    }
  };
  
  const generateSignalForSymbol = (symbol: string, currentMarkets: MarketData[] = markets) => {
    setLoading(true);
    setTimeout(() => {
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
      
      const candles = getCandleData(symbol, "1M");
      const fundamentalData = getFundamentalData(symbol);
      const newsData = getNewsData();
      
      const generatedSignal = generateSignal(
        symbol,
        marketData,
        candles,
        fundamentalData,
        newsData,
        "1M"
      );
      
      setSignal(generatedSignal);
      setLoading(false);
      
      toast({
        title: `New ${generatedSignal.signal.replace('_', ' ').toUpperCase()} Signal`,
        description: `${symbol}: ${generatedSignal.reasoning[0]}`,
        variant: generatedSignal.signal.includes('buy') ? "default" : 
                 generatedSignal.signal.includes('sell') ? "destructive" : "default",
      });
    }, 500);
  };
  
  useEffect(() => {
    if (activeSymbol) {
      generateSignalForSymbol(activeSymbol);
    }
  }, [activeSymbol]);
  
  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      const newMarkets = getMarketData(marketType);
      setMarkets(newMarkets);
      generateSignalForSymbol(activeSymbol, newMarkets);
      setLoading(false);
      
      toast({
        title: "Data Refreshed",
        description: "Market data has been updated",
      });
    }, 1000);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const changeMarketType = (type: MarketType) => {
    setMarketType(type);
    loadMarketData(type);
    
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Markets`,
      description: `Switched to ${type} market view`,
    });
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
          <p className="text-muted-foreground">Smart Money Concepts & Institutional Analysis</p>
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
