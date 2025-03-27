
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Key } from "lucide-react";

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    // Check if API key is already stored in localStorage
    const storedApiKey = localStorage.getItem('alphaVantageApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      onApiKeySubmit(storedApiKey);
    } else {
      // Show dialog if no API key is found
      setOpen(true);
    }
  }, [onApiKeySubmit]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey || apiKey.trim() === '') {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Alpha Vantage API key.",
        variant: "destructive",
      });
      return;
    }
    
    // Store API key in localStorage
    localStorage.setItem('alphaVantageApiKey', apiKey);
    onApiKeySubmit(apiKey);
    setOpen(false);
    
    toast({
      title: "API Key Saved",
      description: "Your Alpha Vantage API key has been saved.",
    });
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 flex gap-2">
            <Key className="h-4 w-4" />
            API Key
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alpha Vantage API Key</DialogTitle>
            <DialogDescription>
              Enter your Alpha Vantage API key to fetch live market data. You can get a free API key at{' '}
              <a 
                href="https://www.alphavantage.co/support/#api-key" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                alphavantage.co
              </a>
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  placeholder="Enter your Alpha Vantage API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Your API key will be stored in your browser's local storage and is only used to fetch market data for this application.</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">Save API Key</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApiKeyInput;
