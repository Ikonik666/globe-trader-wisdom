
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  LineChart, 
  TrendingUp, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Search, 
  Bell, 
  Settings 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { toast } = useToast();
  
  useEffect(() => {
    // Check user's preferred color scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newTheme;
    });
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };
  
  const showFeatureNotification = () => {
    toast({
      title: "Feature in Development",
      description: "This feature will be available in the next update.",
      duration: 3000
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="container px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <LineChart className="h-6 w-6 text-primary mr-2" />
                <span className="font-bold text-lg">TradeSight AI</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={showFeatureNotification}>
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={showFeatureNotification}>
                Analysis
              </Button>
              <Button variant="ghost" size="sm" onClick={showFeatureNotification}>
                Signals
              </Button>
              <Button variant="ghost" size="sm" onClick={showFeatureNotification}>
                Education
              </Button>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" onClick={showFeatureNotification} className="hidden md:flex">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={showFeatureNotification} className="hidden md:flex">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="md:hidden">
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <Button variant="default" size="sm" className="hidden md:flex">
                <TrendingUp className="h-4 w-4 mr-2" />
                Pro Access
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass absolute top-[60px] left-0 right-0 z-40 border-b animate-slide-down">
          <div className="container px-4 py-4">
            <div className="flex flex-col space-y-3">
              <Button variant="ghost" size="sm" onClick={showFeatureNotification} className="justify-start">
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={showFeatureNotification} className="justify-start">
                Analysis
              </Button>
              <Button variant="ghost" size="sm" onClick={showFeatureNotification} className="justify-start">
                Signals
              </Button>
              <Button variant="ghost" size="sm" onClick={showFeatureNotification} className="justify-start">
                Education
              </Button>
              <Button variant="default" size="sm" className="justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Pro Access
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-1 relative">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t py-6 bg-background">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <LineChart className="h-5 w-5 text-primary mr-2" />
              <span className="font-semibold">TradeSight AI</span>
              <span className="text-muted-foreground text-sm ml-4">© {new Date().getFullYear()} All rights reserved</span>
            </div>
            
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Button variant="link" size="sm" className="text-muted-foreground" onClick={showFeatureNotification}>
                Terms
              </Button>
              <Button variant="link" size="sm" className="text-muted-foreground" onClick={showFeatureNotification}>
                Privacy
              </Button>
              <Button variant="link" size="sm" className="text-muted-foreground" onClick={showFeatureNotification}>
                Help
              </Button>
              <Button variant="link" size="sm" className="text-muted-foreground" onClick={showFeatureNotification}>
                Contact
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
