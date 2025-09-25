
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const predefinedPrompts = [
    "What is this app about?",
    "How does the gardening AI work?",
    "Who is Sugam Kaistha?",
    "How do I detect plant diseases?",
    "Which plant is best for shaded areas?"
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

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA3Vm4fLcDD9etw95dbYbdOFusadiAXQ1E', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a Smart Gardening Assistant AI. Answer gardening questions helpfully and concisely. 
              Context about the app: This is an AI-powered Smart Gardening Assistant by Sugam Kaistha & KaisthaGroups that helps with plant recommendations, disease detection, and care scheduling.
              
              User question: ${message}`
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
        content: "I'm experiencing technical difficulties. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full bg-garden-green hover:bg-garden-green/90 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end justify-start p-6">
          <Card className="w-96 h-[500px] flex flex-col shadow-2xl">
            <CardHeader className="bg-garden-green text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-lg">AI Garden Assistant</CardTitle>
                    <CardDescription className="text-green-100">
                      Ask me anything about gardening!
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 && (
                  <div className="space-y-3 mb-4">
                    <p className="text-sm text-muted-foreground">
                      Welcome! Try these quick questions:
                    </p>
                    {predefinedPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start h-auto py-2 px-3 text-xs"
                        onClick={() => handleSendMessage(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-2 mb-4 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.type === 'bot' && (
                      <div className="bg-garden-green rounded-full p-1">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-lg text-sm ${
                        message.type === 'user'
                          ? 'bg-garden-green text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.type === 'user' && (
                      <div className="bg-gray-300 rounded-full p-1">
                        <User className="h-3 w-3 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="bg-garden-green rounded-full p-1">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Disclaimer */}
              <div className="px-4 py-2 bg-yellow-50 border-t">
                <p className="text-xs text-yellow-700">
                  This assistant is for informational purposes only. Always consult with a horticulture expert for critical issues.
                </p>
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about plants, diseases, care tips..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
                    disabled={isLoading}
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
      )}
    </>
  );
};
