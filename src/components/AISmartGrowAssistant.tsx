import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  Download,
  MapPin,
  Thermometer,
  Droplets,
  Sun,
  Calendar,
  Leaf,
  Clock
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface QuickPrompt {
  id: string;
  text: string;
  icon: any;
  category: 'location' | 'soil' | 'timeline' | 'care';
}

export const AISmartGrowAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState<{id: string, title: string, messages: Message[]}[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Load persistent chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      saveChatHistory();
    }
  }, [messages, currentSessionId]);

  // Activity tracking function
  const recordGrowActivity = (details: string) => {
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
        details: `Smart Grow: ${details}`
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

  // Load chat history from localStorage
  const loadChatHistory = () => {
    try {
      const savedSessions = localStorage.getItem('smart-grow-chat-sessions');
      const savedCurrentSession = localStorage.getItem('smart-grow-current-session');
      
      if (savedSessions) {
        const sessions = JSON.parse(savedSessions);
        setChatSessions(sessions);
        
        if (savedCurrentSession) {
          const currentSession = sessions.find((s: any) => s.id === savedCurrentSession);
          if (currentSession) {
            setCurrentSessionId(savedCurrentSession);
            setMessages(currentSession.messages);
            return;
          }
        }
      }
      
      // Create new session if none exists
      startNewChat();
    } catch (error) {
      console.error('Failed to load chat history:', error);
      startNewChat();
    }
  };

  // Save chat history to localStorage
  const saveChatHistory = () => {
    try {
      const updatedSessions = chatSessions.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages, title: getSessionTitle(messages) }
          : session
      );
      
      if (!updatedSessions.find(s => s.id === currentSessionId)) {
        updatedSessions.push({
          id: currentSessionId!,
          title: getSessionTitle(messages),
          messages
        });
      }
      
      setChatSessions(updatedSessions);
      localStorage.setItem('smart-grow-chat-sessions', JSON.stringify(updatedSessions));
      localStorage.setItem('smart-grow-current-session', currentSessionId!);
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  };

  // Generate session title from first user message
  const getSessionTitle = (msgs: Message[]) => {
    const firstUserMessage = msgs.find(m => m.type === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
    }
    return `Chat ${new Date().toLocaleDateString()}`;
  };

  // Start a new chat session
  const startNewChat = () => {
    const newSessionId = Date.now().toString();
    setCurrentSessionId(newSessionId);
    showWelcomeMessage();
  };

  // Load an existing chat session
  const loadChatSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      localStorage.setItem('smart-grow-current-session', sessionId);
    }
  };

  const showWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'bot',
      content: `🌱 Welcome to AI Smart Grow Assistant! I'm your dedicated plant growth specialist.

I'll help you plan and grow any plant successfully with:

🏡 **Location-specific advice** for Indian climates
🌱 **Custom growing plans** for any plant species  
📅 **Detailed timelines** from seed to harvest
💧 **Precise care schedules** (watering, fertilizing, pruning)
🌿 **Soil recommendations** and preparation tips
🌡️ **Climate adjustments** for your region

What plant would you like to grow? Ask me anything from "How to grow tomatoes in Mumbai?" to "Best soil for aloe vera" or "Growing strawberries on a balcony".

Let's grow something amazing together! 🌿`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const quickPrompts: QuickPrompt[] = [
    {
      id: '1',
      text: "How to grow tomatoes in my location?",
      icon: MapPin,
      category: 'location'
    },
    {
      id: '2', 
      text: "What soil is best for growing herbs?",
      icon: Droplets,
      category: 'soil'
    },
    {
      id: '3',
      text: "Timeline for growing strawberries from seed?",
      icon: Clock,
      category: 'timeline'
    },
    {
      id: '4',
      text: "Watering schedule for indoor plants?",
      icon: Droplets,
      category: 'care'
    },
    {
      id: '5',
      text: "Best vegetables for small balcony garden?",
      icon: Leaf,
      category: 'location'
    },
    {
      id: '6',
      text: "Growing roses: care and maintenance tips?",
      icon: Sun,
      category: 'care'
    }
  ];

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
    recordGrowActivity(`Asked: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

    try {
      // Enhanced context for smart grow guidance
      const enhancedPrompt = `You are the AI Smart Grow Assistant, an expert plant growth specialist focused exclusively on Custom Plant Growth Guidance.

CORE EXPERTISE:
- Step-by-step growing instructions for any plant species
- Location-specific advice for Indian cities and climate zones
- Detailed care schedules (watering, fertilizing, pruning, harvesting)
- Soil preparation and amendment recommendations
- Growth timelines from seed/seedling to maturity
- Climate-specific adjustments and seasonal considerations
- Troubleshooting common growing problems

CURRENT CONTEXT:
- User location: India (provide region-specific advice when location mentioned)
- Season: Post-monsoon/winter season (November-February)
- Focus: Practical, actionable plant growing guidance
- Available tools: Weather monitoring, disease detection, planting calendar

USER QUESTION: ${message}

RESPONSE FORMAT:
For each plant growing query, provide:

1. **Plant Overview**: Brief introduction and growing difficulty
2. **Ideal Growing Conditions**: 
   - Soil type and pH requirements
   - Sunlight needs (hours/day)
   - Temperature range
   - Humidity preferences
3. **Detailed Care Schedule**:
   - Watering frequency and method
   - Fertilization timeline and types
   - Pruning and maintenance
4. **Growth Timeline**: Key milestones from planting to harvest
5. **Location-Specific Tips**: Adjustments for Indian climate/region
6. **Common Issues**: Prevention and solutions

Make your response comprehensive yet easy to follow, with actionable steps that ensure successful plant growth.`;

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
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request. Please try asking about a specific plant you'd like to grow.";

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

  const downloadConversation = () => {
    if (messages.length <= 1) return;

    const content = `AI Smart Grow Assistant - Conversation Log

Generated: ${new Date().toLocaleString()}

CONVERSATION:
=============
${messages.map(message => 
  `${message.type === 'user' ? 'YOU' : 'AI SMART GROW ASSISTANT'} [${message.timestamp.toLocaleString()}]:
${message.content}

`).join('\n')}

---
Generated by AI Smart Grow Assistant
Your personalized plant growing guidance and conversation history.
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-grow-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Conversation Downloaded!",
      description: "Your plant growing guidance has been saved.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Chat Management */}
      <Card className="bg-gradient-to-r from-garden-green to-garden-green/80 text-white">
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">AI Smart Grow Assistant</CardTitle>
                <CardDescription className="text-green-100">
                  🌱 Custom Plant Growth Guidance • Step-by-Step Instructions • Location-Specific Advice
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={startNewChat}
                variant="outline"
                size="sm"
                className="text-garden-green border-white/20 hover:bg-white/20"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                New Chat
              </Button>
              {messages.length > 1 && (
                <Button
                  onClick={downloadConversation}
                  variant="outline"
                  size="sm"
                  className="text-garden-green border-white/20 hover:bg-white/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Guide
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat History Sidebar (Mobile Responsive) */}
      {chatSessions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chat History</CardTitle>
            <CardDescription>Continue previous conversations or start new ones</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {chatSessions.map((session) => (
                  <Button
                    key={session.id}
                    onClick={() => loadChatSession(session.id)}
                    variant={currentSessionId === session.id ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                  >
                    <div className="truncate">
                      <div className="font-medium">{session.title}</div>
                      <div className="text-xs opacity-70">
                        {session.messages.length} messages
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Quick Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <MessageCircle className="h-5 w-5 text-garden-green" />
            <span>Quick Start Questions</span>
          </CardTitle>
          <CardDescription>
            Click on any question below to get started, or ask your own custom plant growing question.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickPrompts.map((prompt) => {
              const IconComponent = prompt.icon;
              return (
                <Button
                  key={prompt.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(prompt.text)}
                  className="h-auto py-3 px-4 text-left justify-start hover:bg-garden-green/5 border-garden-green/20"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-4 w-4 text-garden-green" />
                    <span className="text-sm">{prompt.text}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Chat Interface */}
      <Card className="h-[500px] sm:h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Growing Guidance Chat</span>
            <Badge variant="secondary" className="text-xs">
              Session: {chatSessions.length > 0 ? chatSessions.findIndex(s => s.id === currentSessionId) + 1 : 1}
            </Badge>
          </CardTitle>
          <CardDescription>
            Ask specific questions about growing any plant - I'll provide detailed, step-by-step instructions. Your conversations are automatically saved.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 mb-4 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'bot' && (
                  <div className="bg-garden-green rounded-full p-2">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 rounded-lg text-sm shadow-sm ${
                    message.type === 'user'
                      ? 'bg-garden-green text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-garden-green/20'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {message.type === 'user' && (
                  <div className="bg-gray-300 dark:bg-gray-600 rounded-full p-2">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-garden-green rounded-full p-2">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-garden-green/20">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-garden-green" />
                    <span className="text-sm text-garden-green">Analyzing your plant growing needs...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Disclaimer */}
          <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border-t border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-2">
              <Sparkles className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Smart Growing AI:</strong> Personalized growing guidance based on your climate and conditions. 
                For critical plant health issues, consult local gardening experts.
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white/50 dark:bg-gray-800/50">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="How do I grow [plant name] in [your city]? What soil should I use?"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
                disabled={isLoading}
                className="border-garden-green/20 focus:border-garden-green"
              />
              <Button
                onClick={() => handleSendMessage(input)}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-garden-green hover:bg-garden-green/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};