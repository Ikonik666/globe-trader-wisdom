
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
import { Search, RefreshCcw, ArrowDownUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [activeSymbol, setActiveSymbol] = useState<string>("AAPL");
  const [searchTerm, setSearchTerm] = useState('');
  const [signal, setSignal] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Load initial market data
    const marketData = getMarketData();
    setMarkets(marketData);
    
    if (marketData.length > 0) {
      const initialSymbol = marketData[0].symbol;
      setActiveSymbol(initialSymbol);
      generateSignalForSymbol(initialSymbol);
    }
  }, []);
  
  const generateSignalForSymbol = (symbol: string) => {
    setLoading(true);
    setTimeout(() => {
      const marketData = markets.find(m => m.symbol === symbol) || markets[0];
      const candles = getCandleData(symbol, "1M");
      const fundamentalData = getFundamentalData(symbol);
      const newsData = getNewsData();
      
      const generatedSignal = generateSignal(
        symbol,
        marketData,
        candles,
        fundamentalData,
        newsData
      );
      
      setSignal(generatedSignal);
      setLoading(false);
    }, 500); // Simulate API call delay
  };
  
  useEffect(() => {
    if (activeSymbol) {
      generateSignalForSymbol(activeSymbol);
    }
  }, [activeSymbol]);
  
  const refreshData = () => {
    setLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      const newMarkets = getMarketData();
      setMarkets(newMarkets);
      generateSignalForSymbol(activeSymbol);
      setLoading(false);
    }, 1000);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
                <Badge className="bg-primary/10 text-primary-foreground">
                  <ArrowDownUp className="h-3 w-3 mr-1" />
                  NASDAQ
                </Badge>
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
