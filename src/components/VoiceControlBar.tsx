import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  Radio,
  AudioWaveform as WaveformIcon,
  ChevronUp,
  ChevronDown,
  BotMessageSquare,
  CheckCircle2,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { VoiceHelpModal } from './VoiceHelpModal';

interface VoiceControlBarProps {
  isSupported: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isHandsFree: boolean;
  isMuted: boolean;
  transcript: string;
  interimTranscript: string;
  lastActionResponse: string | null;
  errorMessage: string | null;
  onToggleListening: () => void;
  onToggleHandsFree: () => void;
  onToggleMute: () => void;
  onExecuteCommand: (command: string) => void;
}

export const VoiceControlBar: React.FC<VoiceControlBarProps> = ({
  isSupported,
  isListening,
  isSpeaking,
  isHandsFree,
  isMuted,
  transcript,
  interimTranscript,
  lastActionResponse,
  errorMessage,
  onToggleListening,
  onToggleHandsFree,
  onToggleMute,
  onExecuteCommand,
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isSupported) {
    return null;
  }

  const quickPrompts = [
    { label: 'Read my shopping list', icon: ShoppingBag },
    { label: 'What is my total cost?', icon: Sparkles },
    { label: 'Optimize budget with Cymbal Essentials', icon: Sparkles },
    { label: 'Add 2 bags of ice', icon: ShoppingBag },
    { label: 'Start checkout', icon: Truck },
  ];

  return (
    <>
      <div
        id="voice-control-dock"
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl transition-all duration-300 font-sans"
      >
        <div className="bg-[#121212]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200">
          
          {/* Main Voice Control Bar Header / Controls */}
          <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5 sm:gap-4">
            
            {/* Left: Mic Activation Button + Status Badge */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                id="voice-mic-main-btn"
                onClick={onToggleListening}
                className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 shadow-md ${
                  isListening
                    ? 'bg-emerald-500 text-black shadow-emerald-500/40 animate-pulse ring-4 ring-emerald-500/30'
                    : isSpeaking
                    ? 'bg-blue-500 text-white ring-4 ring-blue-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
                title={isListening ? 'Click to pause mic' : 'Click to activate voice command'}
              >
                {isListening ? (
                  <Mic className="w-5 h-5 animate-bounce" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
                {/* Audio active wave indicator */}
                {isListening && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                )}
              </button>

              {/* Status Text & Audio Waveform */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                    Voice Control
                  </span>
                  {isHandsFree && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Hands-Free Active
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1.5 text-xs font-medium text-white truncate">
                  {isListening ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Listening... speak your command
                    </span>
                  ) : isSpeaking ? (
                    <span className="text-blue-300 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 animate-pulse text-blue-400" />
                      Speaking response...
                    </span>
                  ) : (
                    <span className="text-white/60">
                      Mic idle • Tap to speak or toggle Hands-Free
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Middle: Live Transcript & Last Action Pill (when present) */}
            <div className="hidden md:flex flex-1 items-center gap-2 min-w-0 px-2 py-1.5 bg-black/40 rounded-xl border border-white/10">
              {interimTranscript || transcript ? (
                <div className="flex items-center gap-2 text-xs truncate">
                  <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider shrink-0">
                    Heard:
                  </span>
                  <span className="text-white truncate font-medium">
                    "{interimTranscript || transcript}"
                  </span>
                </div>
              ) : lastActionResponse ? (
                <div className="flex items-center gap-2 text-xs truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-white/80 truncate text-[11px]">
                    {lastActionResponse}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-white/40 truncate italic flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400/70" />
                  <span>Try: "Add 2 packs of limes", "Read my shopping list", "Start checkout"</span>
                </div>
              )}
            </div>

            {/* Right: Controls (Hands-Free Toggle, Speaker Toggle, Help, Expand) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* Hands-Free Always-Listening Toggle */}
              <button
                id="voice-handsfree-toggle-btn"
                onClick={onToggleHandsFree}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition border ${
                  isHandsFree
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/15'
                }`}
                title={isHandsFree ? 'Turn off Hands-Free Mode' : 'Enable Hands-Free Continuous Listening'}
              >
                <Radio className={`w-3.5 h-3.5 ${isHandsFree ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">Hands-Free</span>
                <span className="text-[10px] px-1 rounded bg-black/30 text-white">
                  {isHandsFree ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* TTS Mute / Unmute */}
              <button
                id="voice-mute-toggle-btn"
                onClick={onToggleMute}
                className={`p-2 rounded-lg border transition ${
                  isMuted
                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                    : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/15'
                }`}
                title={isMuted ? 'Unmute Audio Narration' : 'Mute Voice Responses'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Help & Cheatsheet */}
              <button
                id="voice-help-btn"
                onClick={() => setIsHelpOpen(true)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 border border-white/15 transition"
                title="Voice Command Guide"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Expand / Collapse Quick Prompt Tray */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/15 transition"
                title={isExpanded ? 'Collapse quick prompts' : 'Expand quick prompts'}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Banner if any */}
          {errorMessage && (
            <div className="px-4 py-1.5 bg-red-950/60 border-t border-red-800/50 text-red-200 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Collapsible Quick Voice Prompts & Live Transcript */}
          {isExpanded && (
            <div className="px-3 pb-2.5 pt-1 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold mr-1">
                Say or Tap:
              </span>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => onExecuteCommand(p.label)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 text-white/90 text-xs font-mono transition"
                >
                  <Mic className="w-2.5 h-2.5 text-emerald-400" />
                  <span>"{p.label}"</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Voice Help Modal */}
      <VoiceHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onRunSampleCommand={(cmd) => onExecuteCommand(cmd)}
      />
    </>
  );
};
