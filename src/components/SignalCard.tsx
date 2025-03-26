
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart3, TrendingUp, TrendingDown, Target, AlertTriangle, Timer } from "lucide-react";
import { AnalysisResult } from '@/utils/analysis';
import { Progress } from "@/components/ui/progress";

interface SignalCardProps {
  signal: AnalysisResult;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  const getSignalColor = (signal: AnalysisResult["signal"]) => {
    switch (signal) {
      case "strong_buy":
        return "bg-success text-success-foreground";
      case "buy":
        return "bg-success/70 text-success-foreground";
      case "neutral":
        return "bg-neutral text-neutral-foreground";
      case "sell":
        return "bg-danger/70 text-danger-foreground";
      case "strong_sell":
        return "bg-danger text-danger-foreground";
    }
  };

  const getSignalIcon = (signal: AnalysisResult["signal"]) => {
    switch (signal) {
      case "strong_buy":
        return <TrendingUp className="w-5 h-5 mr-1" />;
      case "buy":
        return <TrendingUp className="w-5 h-5 mr-1" />;
      case "neutral":
        return <BarChart3 className="w-5 h-5 mr-1" />;
      case "sell":
        return <TrendingDown className="w-5 h-5 mr-1" />;
      case "strong_sell":
        return <TrendingDown className="w-5 h-5 mr-1" />;
    }
  };

  const getSignalText = (signal: AnalysisResult["signal"]) => {
    switch (signal) {
      case "strong_buy":
        return "STRONG BUY";
      case "buy":
        return "BUY";
      case "neutral":
        return "NEUTRAL";
      case "sell":
        return "SELL";
      case "strong_sell":
        return "STRONG SELL";
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <Card className="glass overflow-hidden transition-all duration-300 hover:shadow-lg animate-slide-up">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-semibold">{signal.symbol} Signal</div>
          <Badge className={`${getSignalColor(signal.signal)} flex items-center px-3 py-1`}>
            {getSignalIcon(signal.signal)}
            {getSignalText(signal.signal)}
          </Badge>
        </div>
        
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-1">Confidence</div>
          <div className="flex items-center">
            <Progress value={signal.confidence} className="h-2 flex-grow mr-2" />
            <span className="text-sm font-medium">{signal.confidence}%</span>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground">Support</div>
            <div className="font-medium">${formatNumber(signal.support)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Resistance</div>
            <div className="font-medium">${formatNumber(signal.resistance)}</div>
          </div>
          <div>
            <div className="flex items-center text-sm text-muted-foreground">
              <AlertTriangle className="w-3 h-3 mr-1" />
              <span>Stop Loss</span>
            </div>
            <div className="font-medium">${formatNumber(signal.stopLoss)}</div>
          </div>
          <div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Target className="w-3 h-3 mr-1" />
              <span>Target Price</span>
            </div>
            <div className="font-medium">${formatNumber(signal.targetPrice)}</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-1">Risk/Reward Ratio</div>
          <div className="text-md font-semibold">1:{formatNumber(signal.riskRewardRatio)}</div>
        </div>
        
        <Separator className="my-4" />
        
        <div>
          <div className="text-sm text-muted-foreground mb-2">Analysis</div>
          <ul className="text-sm space-y-2">
            {signal.reasoning.map((reason, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-primary mt-1.5 mr-2"></span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex items-center justify-end mt-4 text-xs text-muted-foreground">
          <Timer className="w-3 h-3 mr-1" />
          <span>Updated {new Date(signal.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
    </Card>
  );
};

export default SignalCard;
