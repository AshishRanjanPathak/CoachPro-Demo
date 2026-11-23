"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { parseBonoboNaturalLanguage, BonoboNlpResult, ParsedWorkoutExercise, ParsedInjuryTriage } from "@/lib/bonoboNlp";
import { loadCompanionState, saveCompanionState, addCompanionXp, CompanionState, CompanionMode } from "@/lib/companion";
import { soundController } from "@/lib/audio";
import { BonoboAvatar } from "./BonoboAvatar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Mic,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Dumbbell,
  HeartPulse,
  Sliders,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronDown,
  Info
} from "lucide-react";

interface MessageItem {
  id: string;
  sender: "user" | "bonobo";
  text: string;
  nlpResult?: BonoboNlpResult;
  confirmed?: boolean;
  rejected?: boolean;
  timestamp: string;
}

export function BonoboAssistantSheet({ onClose }: { onClose?: () => void }) {
  const { state, addWorkoutSets, addCheckIn, currentUser } = useAuth();
  const [companion, setCompanion] = useState<CompanionState>(loadCompanionState);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome",
      sender: "bonobo",
      text: "Hey! 👋 I'm your Bonobo training companion. Tell me what you trained today (e.g. '4 sets squats 140kg x 5 reps') or report any pain or soreness, and I'll prepare it for your review before saving!",
      timestamp: "Just now"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Toggle between Pro Minimalist and Gamified Mode
  const toggleMode = () => {
    soundController.playPop();
    const nextMode: CompanionMode = companion.mode === "gamified" ? "pro_minimalist" : "gamified";
    const updated = { ...companion, mode: nextMode };
    setCompanion(updated);
    saveCompanionState(updated);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    soundController.playPop();
    const userMsg: MessageItem = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    // Run NLP Engine
    const nlp = parseBonoboNaturalLanguage(text, state.exercises);

    const bonoboMsg: MessageItem = {
      id: `bnb-${Date.now()}`,
      sender: "bonobo",
      text: nlp.chatResponse || nlp.summary,
      nlpResult: nlp,
      confirmed: false,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg, bonoboMsg]);
    setInputText("");

    // Set Bonobo Mood based on Intent
    if (nlp.intent === "workout_log") {
      setCompanion(prev => ({ ...prev, mood: "focused" }));
    } else if (nlp.intent === "injury_report") {
      setCompanion(prev => ({ ...prev, mood: "caring" }));
    }
  };

  // Athlete Confirms Workout Logging
  const handleConfirmWorkout = (msgId: string, exercises: ParsedWorkoutExercise[]) => {
    soundController.playLevelUp();

    // Map parsed exercises to domain workout sets
    const setsToCreate = exercises.flatMap(ex => {
      const items = [];
      const numSets = ex.sets || 3;
      for (let i = 1; i <= numSets; i++) {
        items.push({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          setNumber: i,
          completedWeightKg: ex.weightKg || 0,
          completedReps: parseInt(String(ex.reps)) || 8,
          rpe: 8
        });
      }
      return items;
    });

    addWorkoutSets(setsToCreate);

    // Gamification reward (only if in gamified mode)
    if (companion.mode === "gamified") {
      addCompanionXp(setsToCreate.length * 10, "Completed workout sets");
    }

    setMessages(prev =>
      prev.map(m => (m.id === msgId ? { ...m, confirmed: true } : m))
    );
  };

  // Athlete Confirms Injury / Recovery Triage
  const handleConfirmInjury = (msgId: string, triage: ParsedInjuryTriage) => {
    soundController.playPop();

    // Add CheckIn to domain store (alerts coach attention queue)
    addCheckIn({
      readinessScore: triage.readinessScore,
      sorenessScore: triage.sorenessScore,
      fatigueLevel: triage.fatigueLevel,
      sleepHours: triage.sleepHours || 7,
      hasInjury: true,
      injuryLocation: triage.location,
      injurySeverity: triage.severity,
      injuryNotes: triage.details,
      notes: `Reported via Bonobo AI: ${triage.details}`
    });

    // Zero XP awarded for injury reporting per ethical design
    setMessages(prev =>
      prev.map(m => (m.id === msgId ? { ...m, confirmed: true } : m))
    );
  };

  // Discard parsed card
  const handleRejectCard = (msgId: string) => {
    soundController.playPop();
    setMessages(prev =>
      prev.map(m => (m.id === msgId ? { ...m, rejected: true } : m))
    );
  };

  // Emulate Voice Input
  const handleVoiceToggle = () => {
    if (!isListening) {
      setIsListening(true);
      soundController.playPop();
      setTimeout(() => {
        setIsListening(false);
        setInputText("Crushed 4 sets of barbell back squats at 140kg for 5 reps and 3 sets bench press 90kg for 8 reps");
      }, 1500);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] max-h-[800px] w-full bg-card rounded-t-3xl border-t border-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-border bg-secondary/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {companion.mode === "gamified" && (
            <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center shrink-0">
              <BonoboAvatar mood={companion.mood} size={42} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-foreground">
                {companion.mode === "gamified" ? "Bonobo Gym Companion" : "Bonobo AI Copilot"}
              </h3>
              <Badge variant="brand" className="text-[10px] px-1.5 py-0 font-mono">
                {companion.mode === "gamified" ? `Lv. ${companion.level}` : "Pro"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Natural language workout logging &amp; clinical triage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleMode}
            className="text-[11px] h-8 px-2 font-semibold text-muted-foreground hover:text-foreground"
            title="Toggle between Pro Minimalist and Gamified Mode"
          >
            <Sliders className="w-3.5 h-3.5 mr-1" />
            <span>{companion.mode === "gamified" ? "Pro Mode" : "Game Mode"}</span>
          </Button>

          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-brand text-white rounded-br-xs shadow-xs"
                  : "bg-secondary/70 text-foreground border border-border/80 rounded-bl-xs"
              }`}
            >
              <p>{msg.text}</p>
            </div>

            {/* INTERACTIVE WORKOUT CONFIRMATION CARD */}
            {msg.nlpResult?.intent === "workout_log" && msg.nlpResult.workoutData && !msg.rejected && (
              <div className="w-full max-w-[92%] sm:max-w-[85%] mt-2 animate-in fade-in zoom-in-95 duration-150">
                <Card className="border-border bg-card shadow-md rounded-2xl overflow-hidden">
                  <CardHeader className="p-3 bg-secondary/40 border-b border-border/70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <Dumbbell className="w-4 h-4 text-brand" />
                        <span>Workout Sets Found</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {msg.nlpResult.workoutData.totalSets} Total Sets
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3 space-y-2">
                    {msg.nlpResult.workoutData.exercises.map(ex => (
                      <div
                        key={ex.id}
                        className="p-2.5 rounded-xl bg-secondary/30 border border-border/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-foreground block">{ex.exerciseName}</span>
                          <span className="text-[10px] text-muted-foreground">
                            Prescription match: {ex.matchedFrom}
                          </span>
                        </div>
                        <div className="text-right font-mono font-bold text-xs text-foreground">
                          {ex.sets} sets × {ex.reps} reps
                          {ex.weightKg > 0 && <span className="text-brand block">@ {ex.weightKg} kg</span>}
                        </div>
                      </div>
                    ))}

                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
                      <Info className="w-3 h-3 text-brand" />
                      Review values above. Tapping confirm will append to your active session.
                    </p>
                  </CardContent>

                  <CardFooter className="p-3 bg-secondary/30 border-t border-border/70 flex items-center justify-between">
                    {msg.confirmed ? (
                      <div className="flex items-center gap-1.5 text-xs text-success font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Sets Logged &amp; Verified!</span>
                      </div>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRejectCard(msg.id)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Discard
                        </Button>

                        <Button
                          type="button"
                          variant="brand"
                          size="sm"
                          onClick={() =>
                            handleConfirmWorkout(msg.id, msg.nlpResult!.workoutData!.exercises)
                          }
                          className="text-xs font-bold gap-1.5 min-h-[38px] px-4 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm &amp; Log to Workout</span>
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* INTERACTIVE INJURY & RECOVERY TRIAGE CARD */}
            {msg.nlpResult?.intent === "injury_report" && msg.nlpResult.injuryData && !msg.rejected && (
              <div className="w-full max-w-[92%] sm:max-w-[85%] mt-2 animate-in fade-in zoom-in-95 duration-150">
                <Card className="border-destructive/30 bg-card shadow-md rounded-2xl overflow-hidden">
                  <CardHeader className="p-3 bg-destructive/10 border-b border-destructive/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-destructive">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span>Clinical Triage Alert</span>
                      </div>
                      <Badge variant="destructive" className="capitalize text-[10px]">
                        {msg.nlpResult.injuryData.severity} Severity
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3 space-y-2">
                    <div className="p-2.5 rounded-xl bg-destructive/5 border border-destructive/20 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <strong className="text-foreground">{msg.nlpResult.injuryData.location}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fatigue:</span>
                        <strong className="text-foreground capitalize">
                          {msg.nlpResult.injuryData.fatigueLevel}
                        </strong>
                      </div>
                      {msg.nlpResult.injuryData.sleepHours && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sleep Reported:</span>
                          <strong className="text-foreground">
                            {msg.nlpResult.injuryData.sleepHours} hrs
                          </strong>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-destructive/90 font-medium">
                      {msg.nlpResult.injuryData.clinicalAlert}
                    </p>
                  </CardContent>

                  <CardFooter className="p-3 bg-secondary/30 border-t border-border/70 flex items-center justify-between">
                    {msg.confirmed ? (
                      <div className="flex items-center gap-1.5 text-xs text-destructive font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Escalated to Coach Sarah's Queue</span>
                      </div>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRejectCard(msg.id)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </Button>

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleConfirmInjury(msg.id, msg.nlpResult!.injuryData!)
                          }
                          className="text-xs font-bold gap-1.5 min-h-[38px] px-4 cursor-pointer shadow-xs"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Confirm &amp; Alert Coach</span>
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              </div>
            )}

            <span className="text-[10px] text-muted-foreground px-1 mt-0.5">{msg.timestamp}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 1-Tap Quick Action Prompt Chips */}
      <div className="px-3 pt-2 pb-1 border-t border-border/60 bg-secondary/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <button
          type="button"
          onClick={() => handleSendMessage("Did 4 sets of barbell squats 140kg for 5 reps")}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-secondary whitespace-nowrap cursor-pointer transition-colors"
        >
          🏋️ Squats 140kg × 5
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage("Did 3 sets bench press 90kg for 8 reps")}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-secondary whitespace-nowrap cursor-pointer transition-colors"
        >
          💪 Bench 90kg × 8
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage("Severe pain on my right knee after squats")}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 whitespace-nowrap cursor-pointer transition-colors"
        >
          🩹 Knee pain report
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage("Slept 5 hours feeling super exhausted")}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-secondary whitespace-nowrap cursor-pointer transition-colors"
        >
          💤 5 hrs sleep / fatigue
        </button>
      </div>

      {/* Voice & Text Input Bar */}
      <div className="p-3 border-t border-border bg-card flex items-center gap-2 shrink-0 pb-safe">
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="sm"
          onClick={handleVoiceToggle}
          className={`h-11 w-11 p-0 rounded-xl shrink-0 cursor-pointer min-h-[44px] ${
            isListening ? "animate-pulse" : ""
          }`}
          title="Speak to Bonobo"
        >
          <Mic className="w-5 h-5" />
        </Button>

        <Input
          type="text"
          placeholder={isListening ? "Listening... speak now" : "Tell Bonobo what you trained or how you feel…"}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleSendMessage();
          }}
          className="h-11 rounded-xl text-xs sm:text-sm bg-secondary/50 border-border flex-1"
        />

        <Button
          type="button"
          variant="brand"
          size="sm"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim()}
          className="h-11 px-4 rounded-xl font-bold cursor-pointer shrink-0 min-h-[44px] shadow-xs"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
