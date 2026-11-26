"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { parseBonoboNaturalLanguage, BonoboNlpResult, ParsedWorkoutExercise, ParsedInjuryTriage } from "@/lib/bonoboNlp";
import { loadCompanionState, saveCompanionState, addCompanionXp, CompanionState, CompanionMode } from "@/lib/companion";
import { soundController } from "@/lib/audio";
import { speechController } from "@/lib/speech";
import {
  getDailyAiUsage,
  incrementDailyAiUsage,
  getCustomGeminiApiKey,
  saveCustomGeminiApiKey,
  hasCustomGeminiApiKey,
  clearCustomGeminiApiKey,
  DailyAiUsage
} from "@/lib/aiQuota";
import { BonoboAvatar } from "./BonoboAvatar";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Mic,
  Send,
  CheckCircle2,
  AlertTriangle,
  Dumbbell,
  Sliders,
  Volume2,
  VolumeX,
  ChevronDown,
  Info,
  KeyRound,
  Sparkles,
  Loader2
} from "lucide-react";

interface MessageItem {
  id: string;
  sender: "user" | "bonobo";
  text: string;
  nlpResult?: BonoboNlpResult;
  confirmed?: boolean;
  rejected?: boolean;
  timestamp: string;
  source?: "gemini_api" | "local_nlp" | "guardrail_intercept";
}

export function BonoboAssistantSheet({ onClose }: { onClose?: () => void }) {
  const { state, addWorkoutSets, addCheckIn, currentUser } = useAuth();
  const [companion, setCompanion] = useState<CompanionState>(loadCompanionState);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(() => speechController.isMuted());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getCustomGeminiApiKey());
  const [hasSavedKey, setHasSavedKey] = useState(() => hasCustomGeminiApiKey());
  const [aiUsage, setAiUsage] = useState<DailyAiUsage>(() => getDailyAiUsage(currentUser?.id));

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome",
      sender: "bonobo",
      text: "Hey! Ask me to log workouts, track soreness, or help with recovery.",
      timestamp: "Just now"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keep usage refreshed
  useEffect(() => {
    setAiUsage(getDailyAiUsage(currentUser?.id));
  }, [currentUser?.id]);

  // Track speech synthesis speaking states and keep companion gear in sync
  useEffect(() => {
    const handleCompanionUpdated = (e: Event) => {
      const custom = e as CustomEvent<CompanionState>;
      if (custom.detail) setCompanion(custom.detail);
    };
    window.addEventListener("coachpro_bonobo_updated", handleCompanionUpdated);

    speechController.setSpeakingListener(speaking => {
      setIsSpeaking(speaking);
    });
    return () => {
      window.removeEventListener("coachpro_bonobo_updated", handleCompanionUpdated);
      speechController.stopSpeaking();
      speechController.stopListening();
    };
  }, []);

  // Toggle Pro Minimalist vs Gamified Mode
  const toggleMode = () => {
    soundController.playPop();
    const nextMode: CompanionMode = companion.mode === "gamified" ? "pro_minimalist" : "gamified";
    const updated = { ...companion, mode: nextMode };
    setCompanion(updated);
    saveCompanionState(updated);
  };

  // Toggle Voice TTS Mute
  const toggleVoiceMute = () => {
    soundController.playPop();
    const muted = speechController.toggleMute();
    setIsVoiceMuted(muted);
  };

  // Save or Clear Custom Gemini API Key
  const handleSaveApiKey = () => {
    soundController.playPop();
    saveCustomGeminiApiKey(apiKeyInput);
    setHasSavedKey(hasCustomGeminiApiKey());
    setShowKeyModal(false);
  };

  const handleClearApiKey = () => {
    soundController.playPop();
    clearCustomGeminiApiKey();
    setApiKeyInput("");
    setHasSavedKey(false);
    setShowKeyModal(false);
  };

  // Send message to Gemini AI (or fallback to local NLP)
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSubmitting) return;

    soundController.playPop();
    const userMsg: MessageItem = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsSubmitting(true);

    try {
      // Local fallback parser ready for immediate resilience
      const localNlp = parseBonoboNaturalLanguage(text, state.exercises);

      // Check daily rate limit before dispatching
      const currentQuota = getDailyAiUsage(currentUser?.id);

      if (!currentQuota.canMakeRequest) {
        const rateLimitReply = `You've used all ${currentQuota.limit} daily AI queries! Great training session today. Rest up and we'll chat again tomorrow at reset. 🍌`;
        const limitMsg: MessageItem = {
          id: `bnb-${Date.now()}`,
          sender: "bonobo",
          text: rateLimitReply,
          nlpResult: localNlp,
          confirmed: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "local_nlp"
        };
        setMessages(prev => [...prev, limitMsg]);
        if (!isVoiceMuted) {
          speechController.speak(rateLimitReply);
        }
        setIsSubmitting(false);
        return;
      }

      // Prepare request payload
      const chatHistory = messages.slice(-5).map(m => ({
        role: (m.sender === "user" ? "user" : "model") as "user" | "model",
        text: m.text
      }));

      const customKey = getCustomGeminiApiKey();
      const response = await fetch("/api/companion/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customKey ? { "x-gemini-api-key": customKey } : {})
        },
        body: JSON.stringify({
          message: text,
          athleteId: currentUser?.id || "athlete-1",
          athleteName: currentUser?.name || "Athlete",
          history: chatHistory,
          apiKey: customKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        const payload = data.data || data;

        // Increment daily quota on successful chat query
        const updatedUsage = incrementDailyAiUsage(currentUser?.id);
        setAiUsage(updatedUsage);

        const bonoboMsg: MessageItem = {
          id: `bnb-${Date.now()}`,
          sender: "bonobo",
          text: payload.reply || localNlp.chatResponse || localNlp.summary,
          nlpResult: payload.structuredAction || localNlp,
          confirmed: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: payload.source
        };

        setMessages(prev => [...prev, bonoboMsg]);

        // Speak aloud if voice is unmuted
        if (!isVoiceMuted && payload.reply) {
          speechController.speak(payload.reply);
        }

        // Adjust Bonobo Mood
        if (payload.intent === "workout_log") {
          setCompanion(prev => ({ ...prev, mood: "focused" }));
        } else if (payload.intent === "recovery_report") {
          setCompanion(prev => ({ ...prev, mood: "caring" }));
        } else if (payload.intent === "out_of_context") {
          setCompanion(prev => ({ ...prev, mood: "content" }));
        }
      } else {
        // Fallback to local NLP if network or API route returned an error
        const bonoboMsg: MessageItem = {
          id: `bnb-${Date.now()}`,
          sender: "bonobo",
          text: localNlp.chatResponse || localNlp.summary,
          nlpResult: localNlp,
          confirmed: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "local_nlp"
        };
        setMessages(prev => [...prev, bonoboMsg]);
        if (!isVoiceMuted) {
          speechController.speak(bonoboMsg.text);
        }
      }
    } catch {
      // Offline / Network error fallback
      const fallbackNlp = parseBonoboNaturalLanguage(text, state.exercises);
      const fallbackMsg: MessageItem = {
        id: `bnb-${Date.now()}`,
        sender: "bonobo",
        text: fallbackNlp.chatResponse || fallbackNlp.summary,
        nlpResult: fallbackNlp,
        confirmed: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: "local_nlp"
      };
      setMessages(prev => [...prev, fallbackMsg]);
      if (!isVoiceMuted) {
        speechController.speak(fallbackMsg.text);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Athlete Confirms Workout Logging
  const handleConfirmWorkout = (msgId: string, exercises: ParsedWorkoutExercise[]) => {
    soundController.playLevelUp();

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

  // Seamless Hands-Free Voice Input Toggle
  const handleVoiceToggle = () => {
    if (isListening) {
      speechController.stopListening();
      setIsListening(false);
      return;
    }

    soundController.playPop();
    setIsListening(true);

    const started = speechController.startListening(
      (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsListening(false);
          handleSendMessage(transcript);
        }
      },
      (error) => {
        console.warn("[Voice] Error:", error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (!started) {
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col h-[75dvh] max-h-[800px] w-full bg-card rounded-t-2xl border-t border-border shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200 ease-[var(--ease-drawer)]">
      {/* Mobile Sheet Handle */}
      <div className="sm:hidden sheet-handle drag-handle shrink-0" aria-hidden="true" />
      {/* Drawer Header */}
      <div className="px-3.5 py-3 border-b border-border bg-card flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {companion.mode === "gamified" && (
            <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 transition-transform duration-150 ease-[var(--ease-out)] ${
              isSpeaking ? "ring-2 ring-brand ring-offset-1" : ""
            }`}>
              <BonoboAvatar
                mood={companion.mood}
                headwear={companion.equippedHeadwear}
                prop={companion.equippedProp}
                size={40}
              />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5 truncate">
                <span>{companion.mode === "gamified" ? "Bonobo AI" : "Bonobo Copilot"}</span>
                {isSpeaking && (
                  <span className="flex items-center gap-1 text-brand text-[10px] font-medium shrink-0">
                    <Sparkles className="w-3 h-3" />
                    <span>Speaking</span>
                  </span>
                )}
              </h3>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono shrink-0">
                {companion.mode === "gamified" ? `Lv. ${companion.level}` : "Pro"}
              </Badge>
            </div>
            
            {/* Daily Limit Tracker */}
            <div className="flex items-center gap-1.5 mt-0.5 tabular-nums">
              <span className="text-[10px] text-muted-foreground">
                <strong className={aiUsage.remaining <= 3 ? "text-warning" : "text-brand"}>{aiUsage.remaining}</strong>/{aiUsage.limit} daily
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Voice Mute / Unmute Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleVoiceMute}
            className={`h-8 w-8 p-0 rounded-lg ${isVoiceMuted ? "text-muted-foreground" : "text-brand"}`}
            title={isVoiceMuted ? "Unmute Bonobo speech" : "Mute Bonobo speech"}
          >
            {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>

          {/* API Key Modal Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowKeyModal(true)}
            className={`h-8 w-8 p-0 rounded-lg ${hasSavedKey ? "text-success" : "text-muted-foreground"}`}
            title="Configure Gemini API Key"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </Button>

          {/* Mode Switch */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleMode}
            className="text-[10px] h-8 px-2 font-semibold text-muted-foreground hover:text-foreground hidden sm:flex"
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
              className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground ml-1"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Inline API Key Modal */}
      {showKeyModal && (
        <div className="p-3 bg-secondary/80 border-b border-border text-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-brand" />
              <span>Gemini API Key (Account Auth)</span>
            </span>
            <button
              onClick={() => setShowKeyModal(false)}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Connect your own Gemini account key to unlock conversational voice talk and high-resolution Nano Banana companion generation. Kept securely on your device.
          </p>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="AIzaSy..."
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              className="h-8 text-xs bg-card"
            />
            <Button size="sm" variant="default" onClick={handleSaveApiKey} className="h-8 px-3 text-xs">
              Save
            </Button>
            {hasSavedKey && (
              <Button size="sm" variant="ghost" onClick={handleClearApiKey} className="h-8 px-2 text-xs text-destructive">
                Remove
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3 no-scrollbar">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-br-xs shadow-xs"
                  : "bg-secondary/70 text-foreground border border-border/80 rounded-bl-xs"
              }`}
            >
              <p>{msg.text}</p>
              {msg.source === "gemini_api" && (
                <span className="block text-[9px] text-brand/80 mt-1 font-mono">
                  ✦ Powered by Gemini AI
                </span>
              )}
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
                      Two-step safeguard: Confirming will append to your workout log.
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
                          variant="default"
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
                        <span>Escalated to Coach Review</span>
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
          onClick={() => handleSendMessage("Sharp pain on my right knee after squats")}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 whitespace-nowrap cursor-pointer transition-colors"
        >
          🩹 Knee pain report
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage("Slept 5 hours feeling super fatigued")}
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
          className={`h-11 w-11 p-0 rounded-xl shrink-0 cursor-pointer min-h-[44px] transition-[border-color,background-color,box-shadow,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] ${
            isListening ? "ring-4 ring-destructive/25" : "hover:border-brand"
          }`}
          title={isListening ? "Listening... tap to stop" : "Speak to Bonobo (Hands-free voice)"}
        >
          <Mic className={`w-5 h-5 ${isListening ? "animate-pulse" : "text-foreground"}`} />
        </Button>

        <Input
          type="text"
          placeholder={isListening ? "Listening... speak now" : "Ask about training, workouts, or recovery…"}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !isSubmitting) handleSendMessage();
          }}
          disabled={isSubmitting}
          className="h-11 rounded-xl text-base sm:text-sm bg-secondary/50 border-border flex-1"
        />

        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isSubmitting}
          className="h-11 px-4 rounded-xl font-bold cursor-pointer shrink-0 min-h-[44px] shadow-xs"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
