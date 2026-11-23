/**
 * Seamless Speech Recognition (STT) and Speech Synthesis (TTS) Controller
 * Allows hands-free athlete conversation with the Bonobo AI Companion.
 * Uses native Web Speech APIs with zero external latency or added API costs.
 */

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

class SpeechController {
  private recognition: any = null;
  private _isListening: boolean = false;
  private _isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onSpeakingStateChange?: (speaking: boolean) => void;

  constructor() {
    if (typeof window !== "undefined") {
      const savedMute = localStorage.getItem("coachpro_speech_muted");
      this._isMuted = savedMute === "true";
    }
  }

  public isRecognitionSupported(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public isSynthesisSupported(): boolean {
    if (typeof window === "undefined") return false;
    return typeof window.speechSynthesis !== "undefined";
  }

  public isListening(): boolean {
    return this._isListening;
  }

  public isMuted(): boolean {
    return this._isMuted;
  }

  public setMuted(muted: boolean): void {
    this._isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("coachpro_speech_muted", String(muted));
      if (muted) {
        this.stopSpeaking();
      }
    }
  }

  public toggleMute(): boolean {
    const next = !this._isMuted;
    this.setMuted(next);
    return next;
  }

  public setSpeakingListener(listener: (speaking: boolean) => void): void {
    this.onSpeakingStateChange = listener;
  }

  /**
   * Start listening for athlete voice input
   */
  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.isRecognitionSupported()) {
      onError("Speech recognition is not supported in this browser.");
      return false;
    }

    try {
      this.stopListening();
      this.stopSpeaking();

      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";

      this.recognition.onstart = () => {
        this._isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (final) {
          onResult(final.trim(), true);
        } else if (interim) {
          onResult(interim.trim(), false);
        }
      };

      this.recognition.onerror = (event: any) => {
        this._isListening = false;
        console.warn("[Speech] Recognition error:", event.error);
        onError(event.error === "no-speech" ? "No speech detected" : `Speech error: ${event.error}`);
      };

      this.recognition.onend = () => {
        this._isListening = false;
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err) {
      this._isListening = false;
      onError("Failed to start microphone.");
      return false;
    }
  }

  /**
   * Stop listening for speech
   */
  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
    this._isListening = false;
  }

  /**
   * Speak a response aloud with Bonobo's energetic coach voice
   */
  public speak(
    text: string,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ): void {
    if (this._isMuted || !this.isSynthesisSupported()) {
      callbacks?.onEnd?.();
      return;
    }

    // Clean text: strip markdown symbols, URLs, asterisks, brackets, and emojis
    const cleanText = text
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/[`_#~]/g, "")
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) {
      callbacks?.onEnd?.();
      return;
    }

    try {
      this.stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.currentUtterance = utterance;

      // Select natural sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        v => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Daniel"))
      ) || voices.find(v => v.lang.startsWith("en"));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Slightly elevated pitch and crisp rate for athletic, enthusiastic tone
      utterance.pitch = 1.05;
      utterance.rate = 1.05;

      utterance.onstart = () => {
        this.onSpeakingStateChange?.(true);
        callbacks?.onStart?.();
      };

      utterance.onend = () => {
        this.onSpeakingStateChange?.(false);
        this.currentUtterance = null;
        callbacks?.onEnd?.();
      };

      utterance.onerror = (e) => {
        this.onSpeakingStateChange?.(false);
        this.currentUtterance = null;
        callbacks?.onError?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("[Speech] Synthesis error:", err);
      callbacks?.onError?.();
    }
  }

  public stopSpeaking(): void {
    if (this.isSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.currentUtterance = null;
    this.onSpeakingStateChange?.(false);
  }

  public isSpeaking(): boolean {
    if (!this.isSynthesisSupported()) return false;
    return window.speechSynthesis.speaking;
  }
}

export const speechController = new SpeechController();
