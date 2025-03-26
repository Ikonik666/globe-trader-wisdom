
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { FundamentalData as FundamentalDataType } from '@/utils/marketData';
import { ArrowUpRight, ArrowDownRight, DollarSign, Percent, BarChart, TrendingUp, LineChart } from 'lucide-react';

interface FundamentalDataProps {
  data: FundamentalDataType;
}

const FundamentalData: React.FC<FundamentalDataProps> = ({ data }) => {
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  const formatPercent = (value: number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const growthColor = (value: number | undefined) => {
    if (value === undefined || value === null) return "text-muted-foreground";
    if (value > 10) return "text-success";
    if (value > 0) return "text-success/70";
    if (value > -10) return "text-danger/70";
    return "text-danger";
  };

  const valuationScore = () => {
    // Simple scoring based on P/E ratio
    if (!data.pe) return 50; // Default score if PE is undefined
    if (data.pe < 15) return 80;
    if (data.pe < 25) return 60;
    if (data.pe < 35) return 40;
    return 20;
  };

  const growthScore = () => {
    // Combined score of revenue and profit growth
    if (data.revenueGrowth === undefined || data.profitGrowth === undefined) {
      return 50; // Default score if growth metrics are undefined
    }
    
    const combined = (data.revenueGrowth + data.profitGrowth) / 2;
    if (combined > 20) return 90;
    if (combined > 10) return 70;
    if (combined > 0) return 50;
    return 30;
  };

  const financialHealthScore = () => {
    // Simple debt to assets ratio
    if (data.debt === undefined || data.assets === undefined || data.assets === 0) {
      return 50; // Default score if financial metrics are undefined or assets is zero
    }
    
    const ratio = data.debt / data.assets;
    if (ratio < 0.2) return 90;
    if (ratio < 0.4) return 70;
    if (ratio < 0.6) return 50;
    return 30;
  };

  return (
    <Card className="glass transition-all duration-300 hover:shadow-lg animate-slide-up overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <BarChart className="w-5 h-5 mr-2" /> 
          Fundamental Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <DollarSign className="w-3 h-3 mr-1" /> P/E Ratio
              </div>
              <div className="text-lg font-medium">{data.pe?.toFixed(2) || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <DollarSign className="w-3 h-3 mr-1" /> EPS
              </div>
              <div className="text-lg font-medium">${data.eps?.toFixed(2) || 'N/A'}</div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <Percent className="w-3 h-3 mr-1" /> Dividend Yield
              </div>
              <div className="text-lg font-medium">{data.dividendYield ? `${data.dividendYield.toFixed(2)}%` : 'N/A'}</div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <LineChart className="w-3 h-3 mr-1" /> Market Cap
              </div>
              <div className="text-lg font-medium">{formatCurrency(data.marketCap)}</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Revenue: {formatCurrency(data.revenue)}</span>
                {data.revenueGrowth !== undefined && (
                  <Badge className={`${growthColor(data.revenueGrowth)} bg-transparent flex items-center`}>
                    {data.revenueGrowth > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {formatPercent(data.revenueGrowth)}
                  </Badge>
                )}
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Profit: {formatCurrency(data.profit)}</span>
                {data.profitGrowth !== undefined && (
                  <Badge className={`${growthColor(data.profitGrowth)} bg-transparent flex items-center`}>
                    {data.profitGrowth > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {formatPercent(data.profitGrowth)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> Valuation
              </div>
              <Progress value={valuationScore()} className="h-2 mb-2" />
              
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> Growth
              </div>
              <Progress value={growthScore()} className="h-2 mb-2" />
              
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> Financial Health
              </div>
              <Progress value={financialHealthScore()} className="h-2" />
            </div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Debt: {formatCurrency(data.debt)}</span>
              <span>Assets: {formatCurrency(data.assets)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FundamentalData;
