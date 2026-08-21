/**
 * Speech Synthesis (TTS) and Audio Feedback Utility for Hands-Free Voice Control
 */

class VoiceSpeechService {
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onSpeakingStateChange?: (isSpeaking: boolean) => void;

  constructor() {
    // Check local storage for mute preference
    try {
      const savedMute = localStorage.getItem('cymbalmart_voice_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch {
      // ignore
    }
  }

  public setSpeakingListener(callback: (isSpeaking: boolean) => void) {
    this.onSpeakingStateChange = callback;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('cymbalmart_voice_muted', String(muted));
    } catch {
      // ignore
    }
    if (muted) {
      this.cancel();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public speak(text: string, onEnd?: () => void): boolean {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return false;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return false;
    }

    try {
      window.speechSynthesis.cancel();

      // Clean markdown tags like **bold**, `code`, # headings, etc. for cleaner speech
      const cleanedText = text
        .replace(/[*_~`#>-]/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanedText) {
        if (onEnd) onEnd();
        return false;
      }

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.name.includes('Premium') ||
            v.name.includes('Daniel'))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        if (this.onSpeakingStateChange) this.onSpeakingStateChange(true);
      };

      utterance.onend = () => {
        if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
      if (onEnd) onEnd();
      return false;
    }
  }

  public cancel() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }
    return false;
  }
}

export const voiceSpeech = new VoiceSpeechService();
