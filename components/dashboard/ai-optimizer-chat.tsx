"use client";

import React, { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

interface ChatMessage {
  sender: "ai" | "user";
  text: string;
}

interface AIOptimizerChatProps {
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isAiTyping: boolean;
}

export function AIOptimizerChat({ chatMessages, onSendMessage, isAiTyping }: AIOptimizerChatProps) {
  const [inputMessage, setInputMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage);
    setInputMessage("");
  };

  return (
    <Card className="flex flex-col h-[70vh] shadow-md overflow-hidden">
      <CardHeader className="border-b border-stone-100 bg-white dark:border-stone-800 dark:bg-stone-950 flex flex-row items-center gap-3 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-md">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <CardTitle className="text-sm font-bold text-stone-900 dark:text-white">Procrastination Negotiator AI</CardTitle>
          <CardDescription className="text-[10px]">Siap memecah tugas & menghalau alasan penundaan Anda</CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/40 dark:bg-stone-900/40">
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-emerald-800 text-white rounded-tr-none shadow-md shadow-emerald-850/10"
                  : "bg-white text-stone-800 border border-stone-200 rounded-tl-none dark:bg-stone-950 dark:border-stone-800 dark:text-stone-300"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {isAiTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 dark:bg-stone-950 dark:border-stone-800 rounded-2xl rounded-tl-none p-3.5 text-xs flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-stone-100 bg-white p-3 dark:border-stone-800 dark:bg-stone-950">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <input
            type="text"
            placeholder="Tulis alasan Anda menunda atau tugas baru..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 rounded-xl border border-stone-200 p-2.5 text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none dark:border-stone-800 dark:bg-stone-900"
          />
          <button
            type="submit"
            className="rounded-xl bg-emerald-800 p-2.5 text-white hover:bg-emerald-900 transition-colors shadow-md shadow-emerald-800/10"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </CardFooter>
    </Card>
  );
}
