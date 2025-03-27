
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Key } from "lucide-react";

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  apiKeyLabel?: string;
  initialValue?: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ 
  onApiKeySubmit,
  apiKeyLabel = "API Key",
  initialValue = "" 
}) => {
  const [apiKey, setApiKey] = useState(initialValue);
  const [open, setOpen] = useState(false);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey) {
      onApiKeySubmit(apiKey);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <Key className="h-4 w-4 mr-2" />
          {apiKeyLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{apiKeyLabel}</DialogTitle>
          <DialogDescription>
            Enter your API key to fetch live market data.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="apiKey">{apiKeyLabel}</Label>
              <Input 
                id="apiKey" 
                value={apiKey} 
                onChange={handleApiKeyChange} 
                placeholder="Enter your API key"
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!apiKey}>Save API Key</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyInput;
