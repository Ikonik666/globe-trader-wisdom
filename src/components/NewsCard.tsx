
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NewsItem } from '@/utils/marketData';
import { formatDistanceToNow } from 'date-fns';
import { Newspaper, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NewsCardProps {
  news: NewsItem[];
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  // Helper function to format the time
  const formatTime = (item: NewsItem) => {
    if (item.timestamp) {
      return formatDistanceToNow(new Date(item.timestamp), { addSuffix: true });
    } else if (item.publishedAt) {
      return formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true });
    }
    return 'Recently';
  };
  
  // Helper function to render sentiment icon
  const getSentimentIcon = (sentiment: 'positive' | 'negative' | 'neutral') => {
    if (sentiment === 'positive') return <TrendingUp className="h-4 w-4 text-success" />;
    if (sentiment === 'negative') return <TrendingDown className="h-4 w-4 text-danger" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };
  
  // Helper function to get badge color
  const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral') => {
    if (sentiment === 'positive') return "bg-success/10 text-success border-success/20";
    if (sentiment === 'negative') return "bg-danger/10 text-danger border-danger/20";
    return "bg-muted/50 text-muted-foreground";
  };

  return (
    <Card className="glass h-full transition-all duration-300 hover:shadow-lg animate-slide-up overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Newspaper className="w-5 h-5 mr-2" /> 
          Market News
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {news.map((item) => (
            <React.Fragment key={item.id}>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-base">{item.title}</h3>
                  {getSentimentIcon(item.sentiment)}
                </div>
                
                <div className="text-sm text-muted-foreground line-clamp-2">{item.summary}</div>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{item.source}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{formatTime(item)}</span>
                  </div>
                  
                  <Badge className={`${getSentimentColor(item.sentiment)} text-xs`}>
                    {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                  </Badge>
                </div>
                
                {item.relatedSymbols && item.relatedSymbols.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.relatedSymbols.map((symbol) => (
                      <Badge key={symbol} variant="outline" className="text-xs">
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Separator className="my-3" />
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
