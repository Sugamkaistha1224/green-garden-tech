import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Cloud, 
  Leaf, 
  TrendingUp, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X, 
  Bell,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'weather' | 'trend' | 'alert' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionText?: string;
  onAction?: () => void;
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Generate AI-driven notifications based on current context
    generateIntelligentNotifications();
  }, []);

  const generateIntelligentNotifications = () => {
    // Simulate AI-generated notifications based on user location and trends
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'weather',
        title: 'Weather Alert for Your Garden',
        message: 'Heavy rainfall expected in your area today. Consider covering delicate plants and ensure proper drainage.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isRead: false,
        actionText: 'View Weather Details',
        onAction: () => {
          toast({
            title: "Weather Details",
            description: "Opening weather monitoring section...",
          });
        }
      },
      {
        id: '2',
        type: 'trend',
        title: 'Trending in India: Organic Fertilizers',
        message: 'Organic compost and neem-based fertilizers are gaining popularity among Indian gardeners this season.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
        actionText: 'Learn More',
        onAction: () => {
          toast({
            title: "Gardening Trends",
            description: "Opening AI assistant for more information...",
          });
        }
      },
      {
        id: '3',
        type: 'alert',
        title: 'Plant Disease Season Alert',
        message: 'Monsoon season increases risk of fungal diseases. Monitor your plants closely for early signs.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isRead: true,
        actionText: 'Disease Detection',
        onAction: () => {
          toast({
            title: "Disease Detection",
            description: "Opening plant disease detection tool...",
          });
        }
      },
      {
        id: '4',
        type: 'info',
        title: 'Seasonal Planting Tip',
        message: 'This is the perfect time to plant winter vegetables like spinach, lettuce, and peas in your region.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isRead: true,
        actionText: 'Get Planting Guide',
        onAction: () => {
          toast({
            title: "Planting Guide",
            description: "Opening AI gardening planner...",
          });
        }
      },
      {
        id: '5',
        type: 'success',
        title: 'Your Garden Analytics Ready',
        message: 'Monthly garden performance report is now available for download.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isRead: true,
        actionText: 'View Report',
        onAction: () => {
          toast({
            title: "Garden Report",
            description: "Opening activity dashboard...",
          });
        }
      }
    ];

    setNotifications(mockNotifications);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    toast({
      title: "All notifications marked as read",
      description: "Your notification center has been updated.",
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'weather':
        return <Cloud className="h-5 w-5 text-blue-500" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationBadgeColor = (type: Notification['type']) => {
    switch (type) {
      case 'weather':
        return 'bg-blue-100 text-blue-800';
      case 'trend':
        return 'bg-green-100 text-green-800';
      case 'alert':
        return 'bg-orange-100 text-orange-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-garden-green" />
          <h3 className="font-semibold">AI Reference & Alerts</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-garden-green text-white">
              {unreadCount} new
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-96">
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md ${
                  !notification.isRead 
                    ? 'border-garden-green/50 bg-garden-green/5' 
                    : 'border-border'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium truncate">
                            {notification.title}
                          </h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getNotificationBadgeColor(notification.type)}`}
                          >
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatTimeAgo(notification.timestamp)}</span>
                          </span>
                          {notification.actionText && notification.onAction && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                notification.onAction?.();
                                markAsRead(notification.id);
                              }}
                              className="text-xs"
                            >
                              {notification.actionText}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-garden-green rounded-full animate-pulse-gentle"></div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeNotification(notification.id)}
                        className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">AI-generated alerts and tips will appear here</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Info Footer */}
      <Card className="bg-garden-light/50 border-garden-green/20">
        <CardContent className="p-3">
          <div className="flex items-start space-x-2">
            <Leaf className="h-4 w-4 text-garden-green mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">
                <strong>AI-Powered Notifications:</strong> Get contextual alerts based on your location, 
                current weather, and global gardening trends.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};