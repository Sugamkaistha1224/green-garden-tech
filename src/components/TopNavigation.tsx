import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings, Menu, X, Leaf } from 'lucide-react';
import { SettingsPanel } from './SettingsPanel';
import { NotificationCenter } from './NotificationCenter';

interface TopNavigationProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export const TopNavigation = ({ onMenuToggle, isMenuOpen }: TopNavigationProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount] = useState(3); // Mock notification count

  return (
    <>
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-glass-morphism backdrop-blur-xl border-b border-garden-green/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="bg-earth-gradient rounded-full p-2 animate-float">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-garden-green font-poppins">
                  Smart Gardening Assistant
                </h1>
                <p className="text-xs text-muted-foreground">AI-Powered Garden Planning</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="hover:bg-garden-green/10 hover-glow"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse-gentle"
                    >
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Settings */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className="hover:bg-garden-green/10 hover-glow"
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* Mobile Menu Toggle */}
              {onMenuToggle && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMenuToggle}
                  className="sm:hidden hover:bg-garden-green/10"
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel Overlay */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Settings & Preferences</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SettingsPanel />
            </div>
          </div>
        </div>
      )}

      {/* Notification Center Overlay */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <NotificationCenter />
            </div>
          </div>
        </div>
      )}
    </>
  );
};