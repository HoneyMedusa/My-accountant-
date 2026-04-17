import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Loader2, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your My Accountant Assistant. How can I help you with your South African business today? I can answer questions about SARS, CIPC, or how to use this app." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: "You are a South African business assistant called 'My Accountant Assistant'. You help small business owners with accounting questions, South African tax rules (SARS), business registration (CIPC), and general best practices. Be professional, approachable, and accurate. Reference South African laws where applicable. If asked about the app, explain how to use the Stock Management and Daily Cash-ups sections.",
        }
      });

      const assistantMessage = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error: " + error.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <header className="mb-6">
        <h1 className="text-xl font-bold">AI Business Assistant</h1>
        <p className="text-sm text-[#6B778C] font-medium">Ask questions about South African business law, tax, or app features.</p>
      </header>

      <div className="card flex-1 flex flex-col overflow-hidden p-0 bg-[#1A1A1A] border-none">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={cn(
              "flex gap-4 max-w-[85%]",
              m.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}>
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                m.role === 'assistant' ? "bg-white text-[#1A1A1A]" : "bg-white/10 text-white"
              )}>
                {m.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                m.role === 'assistant' ? "bg-white/10 text-white rounded-bl-none" : "bg-[#0066FF] text-white rounded-br-none"
              )}>
                <div className="markdown-body">
                  <Markdown>{m.content}</Markdown>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-white text-[#1A1A1A] rounded-lg flex items-center justify-center shrink-0">
                <Bot size={18} />
              </div>
              <div className="bg-white/10 p-4 rounded-2xl rounded-bl-none">
                <Loader2 size={18} className="animate-spin text-white/40" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white/5 border-t border-white/10">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              className="input-field bg-white/5 border-white/20 text-white focus:ring-[#0066FF] placeholder:text-white/30"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#0066FF] text-white px-4 rounded-lg hover:bg-[#0055DD] transition-all flex items-center justify-center shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => setInput("How do I register my business with CIPC?")}
          className="text-[0.7rem] font-bold uppercase tracking-wider p-3 bg-white border border-[#E0E4E8] rounded-lg text-left hover:border-[#0066FF] transition-all flex items-center gap-2"
        >
          <Info size={14} className="text-[#6B778C]" />
          CIPC Registration
        </button>
        <button 
          onClick={() => setInput("What are the current VAT rates in South Africa?")}
          className="text-[0.7rem] font-bold uppercase tracking-wider p-3 bg-white border border-[#E0E4E8] rounded-lg text-left hover:border-[#0066FF] transition-all flex items-center gap-2"
        >
          <Info size={14} className="text-[#6B778C]" />
          VAT Rates
        </button>
        <button 
          onClick={() => setInput("How do I record my weekly stock?")}
          className="text-[0.7rem] font-bold uppercase tracking-wider p-3 bg-white border border-[#E0E4E8] rounded-lg text-left hover:border-[#0066FF] transition-all flex items-center gap-2"
        >
          <Info size={14} className="text-[#6B778C]" />
          App Help: Stock
        </button>
      </div>
    </div>
  );
}
