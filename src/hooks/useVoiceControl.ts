import { useState, useEffect, useRef, useCallback } from 'react';
import { PartyPlan, ShoppingItem } from '../types';
import { voiceSpeech } from '../utils/voiceSpeech';
import { parseVoiceCommand, VoiceCommandResult } from '../utils/voiceParser';

export interface UseVoiceControlProps {
  currentPlan: PartyPlan;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
  onToggleItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onCheckAll: (status: boolean) => void;
  onBulkUpdateItems?: (updatedList: ShoppingItem[]) => void;
  onOpenNewPartyModal: () => void;
  onCreatePartyFromVoice?: (params: any) => void;
  onOpenCheckout: () => void;
  onCloseCheckout: () => void;
  isCheckoutOpen: boolean;
  onSelectFulfillment?: (method: 'delivery' | 'pickup' | 'in_store') => void;
  onPlaceOrder?: () => void;
  onOpenAiChat: (prompt?: string) => void;
}

export function useVoiceControl({
  currentPlan,
  activeTab,
  setActiveTab,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onCheckAll,
  onBulkUpdateItems,
  onOpenNewPartyModal,
  onCreatePartyFromVoice,
  onOpenCheckout,
  onCloseCheckout,
  isCheckoutOpen,
  onSelectFulfillment,
  onPlaceOrder,
  onOpenAiChat,
}: UseVoiceControlProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [isMuted, setIsMuted] = useState(() => voiceSpeech.getIsMuted());
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastActionResponse, setLastActionResponse] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isHandsFreeRef = useRef(isHandsFree);
  const isListeningRef = useRef(isListening);
  const isSpeakingRef = useRef(isSpeaking);

  // Sync refs
  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
  }, [isHandsFree]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Voice speech listener
  useEffect(() => {
    voiceSpeech.setSpeakingListener((speaking) => {
      setIsSpeaking(speaking);
    });
  }, []);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += trans;
          } else {
            interim += trans;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final) {
          setTranscript(final.trim());
          setInterimTranscript('');
          handleExecuteVoiceCommand(final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions.');
          setIsListening(false);
          setIsHandsFree(false);
        } else if (event.error === 'no-speech') {
          // Expected on quiet pauses
        } else {
          setErrorMessage(`Voice recognition: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // If hands-free mode is enabled, restart recognition if not speaking
        if (isHandsFreeRef.current && !isSpeakingRef.current) {
          setTimeout(() => {
            if (isHandsFreeRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                // ignore
              }
            }
          }, 300);
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Could not initialize SpeechRecognition:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Execute recognized command
  const handleExecuteVoiceCommand = useCallback(
    (spokenText: string) => {
      if (!spokenText.trim()) return;

      const result: VoiceCommandResult = parseVoiceCommand(
        spokenText,
        currentPlan,
        isCheckoutOpen
      );

      setLastActionResponse(result.spokenResponse);

      // Perform actual state mutation / navigation
      switch (result.action) {
        case 'NAVIGATE_TAB':
          if (result.payload) {
            setActiveTab(result.payload);
          }
          break;

        case 'OPEN_CHECKOUT':
          onOpenCheckout();
          break;

        case 'CLOSE_CHECKOUT':
          onCloseCheckout();
          break;

        case 'SELECT_FULFILLMENT':
          if (onSelectFulfillment && result.payload) {
            onSelectFulfillment(result.payload);
          }
          break;

        case 'PLACE_ORDER':
          if (onPlaceOrder) {
            onPlaceOrder();
          }
          break;

        case 'CREATE_PARTY':
          if (onCreatePartyFromVoice && result.payload) {
            onCreatePartyFromVoice(result.payload);
          } else {
            onOpenNewPartyModal();
          }
          break;

        case 'OPEN_NEW_PARTY_MODAL':
          onOpenNewPartyModal();
          break;

        case 'ADD_SHOPPING_ITEM':
          if (result.payload) {
            onAddItem(result.payload);
          }
          break;

        case 'TOGGLE_SHOPPING_ITEM':
          if (result.payload?.id) {
            onToggleItem(result.payload.id);
          }
          break;

        case 'CHECK_ALL_ITEMS':
          onCheckAll(true);
          break;

        case 'UNCHECK_ALL_ITEMS':
          onCheckAll(false);
          break;

        case 'DELETE_SHOPPING_ITEM':
          if (result.payload) {
            onDeleteItem(result.payload);
          }
          break;

        case 'OPTIMIZE_BUDGET':
          if (onBulkUpdateItems) {
            const updated = currentPlan.shoppingList.map((item) => {
              if (item.brandTier === 'National Brand') {
                return {
                  ...item,
                  brandTier: 'Cymbal Essentials' as const,
                  estimatedPrice: Math.round(item.estimatedPrice * 0.75 * 100) / 100,
                };
              }
              return item;
            });
            onBulkUpdateItems(updated);
          }
          break;

        case 'ASK_ASSISTANT':
          if (result.payload) {
            onOpenAiChat(result.payload);
          }
          break;

        case 'STOP_SPEAKING':
          voiceSpeech.cancel();
          break;

        default:
          break;
      }

      // Voice TTS feedback
      if (result.action !== 'STOP_SPEAKING') {
        // Temporarily pause recognition so microphone does not pick up synthesized voice
        if (recognitionRef.current && isListeningRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {
            // ignore
          }
        }

        voiceSpeech.speak(result.spokenResponse, () => {
          // If in hands-free mode, restart listening after speech completes
          if (isHandsFreeRef.current && recognitionRef.current) {
            setTimeout(() => {
              try {
                recognitionRef.current.start();
              } catch {
                // ignore
              }
            }, 400);
          }
        });
      }
    },
    [
      currentPlan,
      isCheckoutOpen,
      setActiveTab,
      onOpenCheckout,
      onCloseCheckout,
      onSelectFulfillment,
      onPlaceOrder,
      onCreatePartyFromVoice,
      onOpenNewPartyModal,
      onAddItem,
      onToggleItem,
      onCheckAll,
      onDeleteItem,
      onBulkUpdateItems,
      onOpenAiChat,
    ]
  );

  // Toggle Listening Manually
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      setIsHandsFree(false);
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      voiceSpeech.cancel();
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  // Toggle Hands-Free Continuous Listening Mode
  const toggleHandsFree = () => {
    const nextState = !isHandsFree;
    setIsHandsFree(nextState);

    if (nextState) {
      voiceSpeech.speak(
        'Hands-free voice control enabled. You can talk to me anytime without pressing buttons.',
        () => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // ignore
            }
          }
        }
      );
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      voiceSpeech.speak('Hands-free mode paused.');
    }
  };

  // Toggle Audio Mute / Narration
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    voiceSpeech.setMuted(nextMute);
    if (nextMute) {
      voiceSpeech.cancel();
    } else {
      voiceSpeech.speak('Voice responses unmuted.');
    }
  };

  return {
    isSupported,
    isListening,
    isSpeaking,
    isHandsFree,
    isMuted,
    transcript,
    interimTranscript,
    lastActionResponse,
    errorMessage,
    toggleListening,
    toggleHandsFree,
    toggleMute,
    executeVoiceCommand: handleExecuteVoiceCommand,
  };
}
