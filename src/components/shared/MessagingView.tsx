"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, User, MessageSquare, CheckCheck, Clock } from "lucide-react";

interface MessagingViewProps {
  initialRecipientId?: string;
}

export function MessagingView({ initialRecipientId }: MessagingViewProps) {
  const { state, currentUser, sendMessage } = useAuth();
  const [inputText, setInputText] = useState("");

  // If coach, can select which athlete to chat with; if athlete, chats with assigned coach
  const isCoach = currentUser.role === "coach";
  const defaultRecipient = isCoach
    ? (initialRecipientId || state.athletes[0].id)
    : "usr-coach-1";

  const [activeRecipientId, setActiveRecipientId] = useState<string>(defaultRecipient);

  // Active recipient info
  const activeRecipient = isCoach
    ? state.athletes.find(a => a.id === activeRecipientId) || state.athletes[0]
    : state.users.find(u => u.id === "usr-coach-1") || state.users[1];

  // Filter messages between currentUser and activeRecipient
  const conversationMessages = state.messages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.recipientId === activeRecipientId) ||
      (m.senderId === activeRecipientId && m.recipientId === currentUser.id)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(activeRecipientId, inputText.trim());
    setInputText("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto h-[620px]">
      {/* Sidebar: In Coach View, list of athletes to chat with */}
      {isCoach && (
        <Card className="border-border shadow-xs bg-card h-full flex flex-col p-0 overflow-hidden md:col-span-1">
          <div className="p-4 border-b border-border bg-secondary/30">
            <h3 className="font-bold text-sm text-foreground">Athlete Threads</h3>
            <p className="text-xs text-muted-foreground">Select an athlete to communicate</p>
          </div>

          <div className="divide-y divide-border overflow-y-auto flex-1" role="tablist" aria-label="Athlete threads">
            {state.athletes.map((ath) => {
              const isSelected = ath.id === activeRecipientId;
              const hasInjury = ath.injuryStatus?.hasInjury;

              return (
                <button
                  key={ath.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveRecipientId(ath.id)}
                  className={`w-full text-left p-3.5 flex items-center gap-3 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none min-h-[56px] ${
                    isSelected ? "bg-brand/10 border-l-4 border-l-brand" : "hover:bg-secondary/60"
                  }`}
                >
                  <img
                    src={ath.avatarUrl}
                    alt={ath.name}
                    width={40}
                    height={40}
                    loading="lazy"
                    className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-xs text-foreground truncate">{ath.name}</h4>
                      {hasInjury && (
                        <Badge variant="destructive" className="text-[9px] py-0 px-1">
                          Injured
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {ath.trainingGoal}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Main Chat Box */}
      <Card
        className={`border-border shadow-xs bg-card h-full flex flex-col overflow-hidden ${
          isCoach ? "md:col-span-2" : "md:col-span-3"
        }`}
      >
        {/* Chat Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-xs text-foreground">
              {activeRecipient.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">{activeRecipient.name}</h3>
              <p className="text-xs text-muted-foreground">
                {isCoach ? "Assigned Athlete" : "Head Strength Coach"} • Verified Secure Channel
              </p>
            </div>
          </div>

          <Badge variant="outline" className="text-[10px] font-mono">
            DIRECT MESSAGE
          </Badge>
        </div>

        {/* Message History */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/15">
          {conversationMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
              <MessageSquare className="w-8 h-8 opacity-40" />
              <p className="text-xs font-medium">No previous messages with {activeRecipient.name}.</p>
              <p className="text-[11px]">Send technical feedback, check-in responses, or workout questions below.</p>
            </div>
          ) : (
            conversationMessages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                      isMine
                        ? "bg-brand text-brand-foreground rounded-br-xs font-medium"
                        : "bg-card border border-border text-foreground rounded-bl-xs"
                    }`}
                  >
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 px-1">
                    <span>{msg.timestamp}</span>
                    {isMine && <CheckCheck className="w-3 h-3 text-brand" />}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>

        {/* Input Bar */}
        <CardFooter className="p-3 bg-card border-t border-border">
          <form onSubmit={handleSend} className="flex gap-2 w-full">
            <Input
              type="text"
              name="chatMessage"
              autoComplete="off"
              aria-label={`Message to ${activeRecipient.name}`}
              placeholder={`Message ${activeRecipient.name}…`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="text-xs h-11 flex-1 min-h-[44px]"
            />
            <Button
              type="submit"
              variant="brand"
              aria-label="Send message"
              className="gap-1.5 h-11 px-4 shrink-0 font-semibold min-h-[44px] min-w-[44px]"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
