
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CandleData, getCandleData } from '@/utils/marketData';
import { PatternDetection, analyzeTechnicalPatterns } from '@/utils/analysis';
import { Badge } from "@/components/ui/badge";
import { Info, MousePointer, Activity, TrendingUp, TrendingDown, Zap } from "lucide-react";

interface MarketChartProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const MarketChart: React.FC<MarketChartProps> = ({ 
  symbol, 
  name,
  price,
  change,
  changePercent 
}) => {
  const [timeframe, setTimeframe] = useState("1D");
  const [chartType, setChartType] = useState("area");
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [patterns, setPatterns] = useState<PatternDetection[]>([]);
  const [hoveredData, setHoveredData] = useState<any>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Fetch chart data based on selected timeframe
    const data = getCandleData(symbol, timeframe);
    setChartData(data);
    
    // Get technical patterns
    const detectedPatterns = analyzeTechnicalPatterns(symbol, data);
    setPatterns(detectedPatterns);
  }, [symbol, timeframe]);

  const formatTimeLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeframe === "1D") {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === "1W") {
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

  return (
    <Card className="glass w-full transition-all duration-300 animate-slide-up overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-semibold">{symbol} <span className="text-muted-foreground text-sm ml-1">{name}</span></CardTitle>
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
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1D">1 Day</SelectItem>
              <SelectItem value="1W">1 Week</SelectItem>
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="6M">6 Months</SelectItem>
              <SelectItem value="1Y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <Tabs defaultValue="chart" className="px-4">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="chart" className="text-xs">Chart</TabsTrigger>
              <TabsTrigger value="patterns" className="text-xs">Patterns</TabsTrigger>
            </TabsList>
            <div className="flex space-x-1">
              <Button
                variant={chartType === "area" ? "default" : "outline"} 
                size="icon"
                className="h-8 w-8"
                onClick={() => setChartType("area")}
              >
                <Activity className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "candle" ? "default" : "outline"} 
                size="icon"
                className="h-8 w-8"
                onClick={() => setChartType("candle")}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "volume" ? "default" : "outline"} 
                size="icon"
                className="h-8 w-8"
                onClick={() => setChartType("volume")}
              >
                <BarChart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        
          <TabsContent value="chart" className="mt-0">
            <div className="chart-container h-64 relative" ref={chartRef}>
              {hoveredData && (
                <div className="chart-tooltip">
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
                ) : chartType === "candle" ? (
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
              {patterns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Info className="h-10 w-10 mb-2 opacity-50" />
                  <p>No significant patterns detected</p>
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
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MarketChart;
