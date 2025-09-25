import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, MapPin, Cloud, TrendingUp, Leaf, Droplets, Sun, Calendar, Minimize2, Maximize2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ContextualTip {
  id: string;
  type: 'weather' | 'location' | 'trend';
  title: string;
  content: string;
  icon: any;
}

export const EnhancedChatInterface = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextualTips, setContextualTips] = useState<ContextualTip[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      generateContextualTips();
      // Auto-greet when opened
      if (messages.length === 0) {
        showWelcomeMessage();
      }
    }
  }, [isOpen, isMinimized]);

  // Activity tracking function
  const recordChatActivity = (details: string) => {
    try {
      const savedActivities = localStorage.getItem('garden-app-activities');
      const activities = savedActivities ? JSON.parse(savedActivities) : [];
      
      const savedStats = localStorage.getItem('garden-app-stats');
      const stats = savedStats ? JSON.parse(savedStats) : {
        totalSessions: 0,
        totalTimeSpent: 0,
        featuresUsed: { planner: 0, disease: 0, weather: 0, chat: 0 },
        lastActivity: null
      };

      const newActivity = {
        id: Date.now().toString(),
        feature: 'chat',
        timestamp: new Date().toISOString(),
        details
      };

      const updatedActivities = [newActivity, ...activities].slice(0, 50);
      const updatedStats = {
        ...stats,
        featuresUsed: { ...stats.featuresUsed, chat: (stats.featuresUsed.chat || 0) + 1 },
        lastActivity: new Date().toISOString()
      };

      localStorage.setItem('garden-app-activities', JSON.stringify(updatedActivities));
      localStorage.setItem('garden-app-stats', JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Failed to record activity:', error);
    }
  };

  const generateContextualTips = () => {
    // Simulate AI-generated contextual tips based on current context
    const tips: ContextualTip[] = [
      {
        id: '1',
        type: 'weather',
        title: 'Weather Alert',
        content: 'Heavy rainfall expected today - protect your delicate plants!',
        icon: Cloud
      },
      {
        id: '2',
        type: 'trend',
        title: 'Trending Now',
        content: 'Organic neem fertilizer is gaining popularity this season.',
        icon: TrendingUp
      },
      {
        id: '3',
        type: 'location',
        title: 'Local Tip',
        content: 'Perfect time for winter vegetables in your climate zone.',
        icon: MapPin
      }
    ];
    setContextualTips(tips);
  };

  const showWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'bot',
      content: `🌿 Welcome to your AI Gardening Assistant! I'm here to help you grow amazing plants.

I can assist you with:
• 🌱 Plant care and growing tips
• 🏡 Garden planning and design
• 🌤️ Weather-based recommendations
• 🐛 Pest and disease identification
• 💧 Watering and fertilization schedules
• 🌺 Seasonal planting advice

What would you like to know about gardening today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const predefinedPrompts = [
    "How can I grow tomatoes in containers?",
    "What plants are best for shaded areas?", 
    "How do I prepare soil for spring planting?",
    "Which flowers bloom in winter?",
    "How often should I water my herbs?",
    "What's the best fertilizer for vegetables?",
    "How do I prevent plant diseases?",
    "When should I prune my fruit trees?"
  ];

  const simulateTyping = async (message: string) => {
    setIsTyping(true);
    // Simulate typing delay based on message length
    const typingTime = Math.min(message.length * 50, 3000);
    await new Promise(resolve => setTimeout(resolve, typingTime));
    setIsTyping(false);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Record activity tracking
    recordChatActivity(`Asked: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

    // Simulate typing indicator
    await simulateTyping(message);

    try {
      // Enhanced context for gardening assistance
      const enhancedPrompt = `You are an AI-powered Smart Gardening Assistant created by Sugam Kaistha & KaisthaGroups. You're an expert in:

SPECIALIZATIONS:
- Plant care and cultivation techniques
- Garden planning and seasonal advice
- Pest and disease identification and treatment
- Soil preparation and composting
- Watering schedules and fertilization
- Climate-specific growing recommendations
- Indoor and container gardening
- Organic and sustainable gardening practices

CURRENT CONTEXT:
- User location: Provide general advice applicable globally with specific notes for different climates
- Season: Consider seasonal variations in your advice
- Focus: Practical, actionable gardening guidance

RESPONSE STYLE:
- Be friendly, encouraging, and knowledgeable
- Provide specific, practical advice
- Include helpful tips and warnings when relevant
- Use emojis sparingly but effectively
- Keep responses comprehensive but concise

User question: ${message}

Provide helpful, accurate gardening advice that encourages successful plant growing.`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA3Vm4fLcDD9etw95dbYbdOFusadiAXQ1E', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request. Please try again.";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm experiencing technical difficulties. Please try again later or check your internet connection.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTipClick = (tip: ContextualTip) => {
    const tipMessage = `Tell me more about: ${tip.content}`;
    handleSendMessage(tipMessage);
  };

  return (
    <>
      {/* Floating AI Assistant Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 rounded-full bg-gradient-to-r from-garden-green to-emerald-600 hover:from-garden-green/90 hover:to-emerald-600/90 shadow-xl animate-float hover-glow transition-all duration-300 ring-4 ring-garden-green/20"
            size="icon"
          >
            <div className="relative">
              <MessageCircle className="h-7 w-7" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse-gentle"></div>
            </div>
          </Button>
          {/* Animated notification */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-lg animate-bloom opacity-90 hidden lg:block">
            <p className="text-xs font-medium text-garden-green whitespace-nowrap">
              💬 Chat with AI!
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center sm:items-end sm:justify-end p-2 sm:p-6">
          <Card className={`w-full max-w-md sm:w-[440px] mx-2 sm:mx-0 flex flex-col shadow-2xl bg-glass-morphism border-garden-green/20 transition-all duration-300 ${
            isMinimized ? 'h-auto' : 'h-[90vh] sm:h-[650px]'
          }`}>
            {/* Enhanced Header */}
            <CardHeader className="bg-gradient-to-r from-garden-green via-emerald-600 to-green-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-full p-2 animate-float">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-poppins">AI Garden Assistant</CardTitle>
                    <CardDescription className="text-green-100 text-sm">
                      🌿 Smart • Contextual • Always Learning
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    onClick={() => setIsMinimized(!isMinimized)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 transition-colors"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {!isMinimized && (
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Contextual Tips Bar */}
                {contextualTips.length > 0 && (
                  <div className="p-3 border-b bg-garden-light/20 animate-bloom">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-4 w-4 text-garden-green" />
                      <span className="text-xs font-medium text-garden-green">AI Insights for You</span>
                    </div>
                    <div className="flex space-x-2 overflow-x-auto">
                      {contextualTips.map((tip) => {
                        const IconComponent = tip.icon;
                        return (
                          <Button
                            key={tip.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleTipClick(tip)}
                            className="flex-shrink-0 text-xs hover:bg-garden-green/10 border-garden-green/20 hover-glow transition-all"
                          >
                            <IconComponent className="h-3 w-3 mr-1" />
                            {tip.title}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 && (
                    <div className="space-y-3 mb-4 animate-bloom">
                      <div className="text-center mb-4">
                        <div className="bg-garden-green/10 rounded-full p-3 w-fit mx-auto mb-3">
                          <Sparkles className="h-6 w-6 text-garden-green" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">
                          Welcome to your AI Gardening Assistant!
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Try these quick questions:
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {predefinedPrompts.slice(0, 6).map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-left justify-start h-auto py-3 px-4 text-xs hover:bg-garden-green/5 border-garden-green/20 transition-all hover-lift"
                            onClick={() => handleSendMessage(prompt)}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-garden-green rounded-full animate-pulse"></div>
                              <span>{prompt}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 mb-4 animate-bloom ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.type === 'bot' && (
                        <div className="bg-garden-green rounded-full p-2 hover-glow">
                          <Bot className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm shadow-sm hover-lift transition-all duration-200 ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-garden-green to-emerald-600 text-white rounded-br-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-garden-green/10'
                        }`}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                        <div className={`text-xs opacity-70 mt-2 ${message.type === 'user' ? 'text-green-100' : 'text-muted-foreground'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {message.type === 'user' && (
                        <div className="bg-gray-300 dark:bg-gray-600 rounded-full p-2">
                          <User className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Enhanced Loading States */}
                  {isLoading && (
                    <div className="flex items-center space-x-3 mb-4 animate-bloom">
                      <div className="bg-garden-green rounded-full p-2">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-garden-green/10">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-garden-green" />
                          <span className="text-sm text-garden-green">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {isTyping && (
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-garden-green rounded-full p-2">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-garden-green/10">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-garden-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-garden-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-garden-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Auto-scroll anchor */}
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Enhanced Disclaimer */}
                <div className="px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-t border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      <strong>AI-Powered Assistant:</strong> Contextual advice based on gardening best practices. 
                      Always consult experts for critical plant health issues.
                    </p>
                  </div>
                </div>

                {/* Enhanced Input Area */}
                <div className="p-4 border-t bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <div className="flex space-x-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about plants, care tips, growing advice..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
                      disabled={isLoading}
                      className="border-garden-green/20 focus:border-garden-green transition-colors"
                    />
                    <Button
                      onClick={() => handleSendMessage(input)}
                      disabled={isLoading || !input.trim()}
                      size="icon"
                      className="bg-garden-green hover:bg-garden-green/90 transition-all hover-glow"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
};