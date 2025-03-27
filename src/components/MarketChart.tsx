import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CandleData, getCandleData } from '@/utils/marketData';
import { fetchCandleData } from '@/utils/alphaVantageApi';
import { PatternDetection, analyzeTechnicalPatterns } from '@/utils/analysis';
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Info, MousePointer, Activity, TrendingUp, TrendingDown, Zap, CandlestickChart, BarChart2, BarChart4, LineChart as LineChartIcon, Settings, Maximize, Lock, ArrowUpDown, Clock } from "lucide-react";
import { MarketType, getAllSymbols, getSymbolsByMarketType } from '@/utils/marketSymbols';

interface MarketChartProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  onTimeframeChange?: (timeframe: string) => void;
  currentTimeframe?: string;
  usingLiveData?: boolean;
}

const MarketChart: React.FC<MarketChartProps> = ({ 
  symbol, 
  name,
  price,
  change,
  changePercent,
  onTimeframeChange,
  currentTimeframe = "1D",
  usingLiveData = false
}) => {
  const [timeframe, setTimeframe] = useState(currentTimeframe);
  const [chartType, setChartType] = useState("candle");
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [patterns, setPatterns] = useState<PatternDetection[]>([]);
  const [hoveredData, setHoveredData] = useState<any>(null);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [showIndicators, setShowIndicators] = useState(false);
  const [marketType, setMarketType] = useState<MarketType>("stocks");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (currentTimeframe && currentTimeframe !== timeframe) {
      setTimeframe(currentTimeframe);
    }
  }, [currentTimeframe]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let data: CandleData[] = [];
        
        if (usingLiveData) {
          // Try to fetch live data first
          try {
            data = await fetchCandleData(symbol, timeframe);
            if (!data || data.length === 0) throw new Error("No live data available");
          } catch (error) {
            console.error("Error fetching live candle data:", error);
            // Fallback to mock data
            data = getCandleData(symbol, timeframe);
            toast({
              title: "Using Mock Chart Data",
              description: "Could not fetch live chart data. Using demo data instead.",
              variant: "destructive",
            });
          }
        } else {
          // Use mock data directly
          data = getCandleData(symbol, timeframe);
        }
        
        setChartData(data);
        
        const detectedPatterns = analyzeTechnicalPatterns(symbol, data, timeframe);
        setPatterns(detectedPatterns);
        
        if (detectedPatterns.length > 0) {
          const significantPattern = detectedPatterns.find(p => p.confidence > 75);
          if (significantPattern) {
            toast({
              title: `${significantPattern.bullish ? 'Bullish' : 'Bearish'} ${significantPattern.name} Detected`,
              description: `${significantPattern.description} (${significantPattern.timeframe})`,
              variant: "default",
            });
          }
        }
      } catch (error) {
        console.error("Error loading chart data:", error);
        setError("Failed to load chart data");
        // Ensure we have empty chart data to prevent rendering errors
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [symbol, timeframe, usingLiveData]);

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    if (onTimeframeChange) {
      onTimeframeChange(newTimeframe);
    }
  };

  const formatTimeLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeframe === "1D" || timeframe === "1m" || timeframe === "5m" || timeframe === "15m") {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === "1W" || timeframe === "1H" || timeframe === "4H") {
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const tooltipFormatter = (value: number) => {
    return formatPrice(value);
  };

  const handleMouseMove = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      setHoveredData(data.activePayload[0].payload);
    }
  };

  const handleMouseLeave = () => {
    setHoveredData(null);
  };

  const toggleDrawingTools = () => {
    setShowDrawingTools(!showDrawingTools);
    if (!showDrawingTools) {
      toast({
        title: "Drawing Tools",
        description: "Drawing tools functionality would be implemented in a production version",
      });
    }
  };

  const toggleIndicators = () => {
    setShowIndicators(!showIndicators);
    if (!showIndicators) {
      toast({
        title: "Technical Indicators",
        description: "Indicators like RSI, MACD, and Bollinger Bands would be available in a production version",
      });
    }
  };

  const handleFullscreen = () => {
    if (chartRef.current && document.fullscreenEnabled) {
      if (!document.fullscreenElement) {
        chartRef.current.requestFullscreen().catch(err => {
          toast({
            title: "Fullscreen Error",
            description: `Error attempting to enable fullscreen: ${err.message}`,
            variant: "destructive",
          });
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const changeMarketType = (type: MarketType) => {
    setMarketType(type);
    toast({
      title: `Switched to ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      description: `Now viewing ${type} markets`,
    });
  };

  const getTimeframeDisplay = (tf: string): string => {
    switch(tf) {
      case "1m": return "1 Minute";
      case "5m": return "5 Minutes";
      case "15m": return "15 Minutes";
      case "1H": return "1 Hour";
      case "4H": return "4 Hour";
      case "1D": return "1 Day";
      case "1W": return "1 Week";
      case "1M": return "1 Month";
      default: return tf;
    }
  };

  return (
    <Card className="glass w-full transition-all duration-300 animate-slide-up overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-semibold">
            {symbol} <span className="text-muted-foreground text-sm ml-1">{name}</span>
            {usingLiveData && <Badge variant="outline" className="ml-2 text-xs">Live</Badge>}
          </CardTitle>
          <div className="flex items-center mt-1">
            <span className="text-2xl font-bold mr-2">{formatPrice(price)}</span>
            <Badge 
              className={`flex items-center ${change >= 0 ? 'bg-success/20 text-success hover:bg-success/30' : 'bg-danger/20 text-danger hover:bg-danger/30'}`}
            >
              {change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => changeMarketType("stocks")}
              data-active={marketType === "stocks"}
              aria-pressed={marketType === "stocks"}
            >
              Stocks
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => changeMarketType("crypto")}
              data-active={marketType === "crypto"}
              aria-pressed={marketType === "crypto"}
            >
              Crypto
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => changeMarketType("forex")}
              data-active={marketType === "forex"}
              aria-pressed={marketType === "forex"}
            >
              Forex
            </Button>
          </div>
          <Select value={timeframe} onValueChange={handleTimeframeChange}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Min</SelectItem>
              <SelectItem value="5m">5 Min</SelectItem>
              <SelectItem value="15m">15 Min</SelectItem>
              <SelectItem value="1H">1 Hour</SelectItem>
              <SelectItem value="4H">4 Hour</SelectItem>
              <SelectItem value="1D">1 Day</SelectItem>
              <SelectItem value="1W">1 Week</SelectItem>
              <SelectItem value="1M">1 Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <Tabs defaultValue="chart" className="px-4">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="chart" className="text-xs">Chart</TabsTrigger>
              <TabsTrigger value="patterns" className="text-xs">Patterns</TabsTrigger>
              <TabsTrigger value="signals" className="text-xs">SMC/ICT Signals</TabsTrigger>
            </TabsList>
            <div className="flex space-x-1 mt-2 sm:mt-0">
              <Button
                variant={chartType === "candlestick" ? "default" : "outline"} 
                size="icon"
                className="h-8 w-8"
                onClick={() => setChartType("candlestick")}
                title="Candlestick Chart"
              >
                <CandlestickChart className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "area" ? "default" : "outline"} 
                size="icon"
                className="h-8 w-8"
                onClick={() => setChartType("area")}
                title="Area Chart"
              >
                <Activity className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "line" ? "default" : "outline"} 
                size="icon"
                className="h-8 w-8"
                onClick={() => setChartType("line")}
                title="Line Chart"
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "volume" ? "default" : "outline"} 
                size="icon"
                className="h-8 w-8"
                onClick={() => setChartType("volume")}
                title="Volume Chart"
              >
                <BarChart2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                onClick={toggleDrawingTools}
                title="Drawing Tools"
              >
                <MousePointer className="h-4 w-4" />
              </Button>
              <Button
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                onClick={toggleIndicators}
                title="Indicators"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                onClick={handleFullscreen}
                title="Fullscreen"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        
          <TabsContent value="chart" className="mt-0">
            <div className="chart-container h-64 relative" ref={chartRef}>
              <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm py-1 px-2 rounded-md text-xs font-medium border border-border">
                Current timeframe: {getTimeframeDisplay(timeframe)}
              </div>
              {hoveredData && (
                <div className="chart-tooltip absolute bg-background border border-border rounded-md shadow-md p-3 z-10 top-4 left-4">
                  <div className="text-xs font-semibold">{formatTimeLabel(hoveredData.time)}</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                    <div className="text-xs">Open:</div>
                    <div className="text-xs font-medium">{formatPrice(hoveredData.open)}</div>
                    <div className="text-xs">High:</div>
                    <div className="text-xs font-medium">{formatPrice(hoveredData.high)}</div>
                    <div className="text-xs">Low:</div>
                    <div className="text-xs font-medium">{formatPrice(hoveredData.low)}</div>
                    <div className="text-xs">Close:</div>
                    <div className="text-xs font-medium">{formatPrice(hoveredData.close)}</div>
                    <div className="text-xs">Volume:</div>
                    <div className="text-xs font-medium">{hoveredData.volume.toLocaleString()}</div>
                  </div>
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "area" ? (
                  <AreaChart
                    data={chartData}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={formatTimeLabel}
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tickFormatter={tooltipFormatter}
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      formatter={tooltipFormatter}
                      labelFormatter={formatTimeLabel}
                      contentStyle={{ display: 'none' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="close" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                ) : chartType === "line" ? (
                  <LineChart
                    data={chartData}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={formatTimeLabel}
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tickFormatter={tooltipFormatter}
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      formatter={tooltipFormatter}
                      labelFormatter={formatTimeLabel}
                      contentStyle={{ display: 'none' }}
                    />
                    <Line 
                      type="linear" 
                      dataKey="close" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                ) : chartType === "candlestick" ? (
                  <LineChart
                    data={chartData}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={formatTimeLabel}
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tickFormatter={tooltipFormatter}
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      formatter={tooltipFormatter}
                      labelFormatter={formatTimeLabel}
                      contentStyle={{ display: 'none' }}
                    />
                    <Line 
                      type="linear" 
                      dataKey="high" 
                      stroke="hsl(var(--success))" 
                      dot={false}
                    />
                    <Line 
                      type="linear" 
                      dataKey="close" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      type="linear" 
                      dataKey="low" 
                      stroke="hsl(var(--danger))" 
                      dot={false}
                    />
                  </LineChart>
                ) : (
                  <BarChart
                    data={chartData}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={formatTimeLabel}
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      orientation="right"
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      formatter={(value) => [`${(Number(value) / 1000).toFixed(0)}k`, 'Volume']}
                      labelFormatter={formatTimeLabel}
                      contentStyle={{ display: 'none' }}
                    />
                    <Bar 
                      dataKey="volume" 
                      fill="hsl(var(--muted))" 
                      barSize={timeframe === "1D" ? 2 : 6} 
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="patterns" className="mt-0">
            <div className="h-64 overflow-auto py-2">
              <div className="bg-muted/30 rounded p-2 mb-3 text-xs text-muted-foreground">
                Showing patterns for {getTimeframeDisplay(timeframe)} timeframe
              </div>
              {patterns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Info className="h-10 w-10 mb-2 opacity-50" />
                  <p>No significant patterns detected on this timeframe</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patterns.map((pattern, index) => (
                    <div key={index} className="rounded-md border border-border p-3 transition-all hover:shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge className={`mr-2 ${pattern.bullish ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                            {pattern.bullish ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {pattern.bullish ? 'Bullish' : 'Bearish'}
                          </Badge>
                          <span className="font-medium">{pattern.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="text-xs">
                            {pattern.timeframe}
                          </Badge>
                          <Badge className="ml-2 bg-primary/20 text-primary-foreground flex items-center text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            {pattern.confidence}%
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{pattern.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="signals" className="mt-0">
            <div className="h-64 overflow-auto py-2">
              <div className="bg-muted/30 rounded p-2 mb-3 text-xs text-muted-foreground">
                Showing signals for {getTimeframeDisplay(timeframe)} timeframe
              </div>
              {patterns.filter(p => p.confidence > 70).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Info className="h-10 w-10 mb-2 opacity-50" />
                  <p>No high-confidence signals available on this timeframe</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patterns.filter(p => p.confidence > 70).map((pattern, index) => (
                    <div key={index} className="rounded-md border border-border p-4 transition-all hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Badge className={`mr-2 ${pattern.bullish ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                            {pattern.bullish ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {pattern.bullish ? 'BUY' : 'SELL'} SIGNAL
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="text-xs flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {pattern.timeframe}
                          </Badge>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-md mb-1">{pattern.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="rounded-md bg-muted p-2">
                          <div className="text-xs text-muted-foreground">Entry Price</div>
                          <div className="font-medium">{formatPrice(price)}</div>
                        </div>
                        <div className="rounded-md bg-muted p-2">
                          <div className="text-xs text-muted-foreground">Stop Loss</div>
                          <div className="font-medium">{formatPrice(pattern.bullish ? price * 0.97 : price * 1.03)}</div>
                        </div>
                        <div className="rounded-md bg-muted p-2">
                          <div className="text-xs text-muted-foreground">Take Profit 1</div>
                          <div className="font-medium">{formatPrice(pattern.bullish ? price * 1.05 : price * 0.95)}</div>
                        </div>
                        <div className="rounded-md bg-muted p-2">
                          <div className="text-xs text-muted-foreground">Take Profit 2</div>
                          <div className="font-medium">{formatPrice(pattern.bullish ? price * 1.10 : price * 0.90)}</div>
                        </div>
                      </div>
                      
                      <div className="text-xs">
                        <div className="font-medium mb-1">Key Levels:</div>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>{pattern.bullish ? 'Support' : 'Resistance'} zone at {formatPrice(pattern.bullish ? price * 0.98 : price * 1.02)}</li>
                          <li>ICT {pattern.bullish ? 'Optimal Trade Entry' : 'Fair Value Gap'} at {formatPrice(pattern.bullish ? price * 0.995 : price * 1.005)}</li>
                          <li>Market structure {pattern.bullish ? 'break of structure to upside' : 'break of structure to downside'}</li>
                          <li>SMC {pattern.bullish ? 'order block' : 'breaker block'} confirmation</li>
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MarketChart;
