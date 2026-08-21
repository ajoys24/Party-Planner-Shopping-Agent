import React from 'react';
import {
  Mic,
  X,
  Sparkles,
  ShoppingBag,
  Compass,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  Volume2,
  BotMessageSquare,
} from 'lucide-react';

interface VoiceHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunSampleCommand?: (cmd: string) => void;
}

export const VoiceHelpModal: React.FC<VoiceHelpModalProps> = ({
  isOpen,
  onClose,
  onRunSampleCommand,
}) => {
  if (!isOpen) return null;

  const commandCategories = [
    {
      title: 'Party & Event Planning',
      icon: Sparkles,
      color: 'text-amber-400',
      commands: [
        { text: 'Plan a taco fiesta for 15 guests with $150 budget', desc: 'Auto-generates complete blueprint & shopping list' },
        { text: 'Plan a backyard barbecue for 20 people', desc: 'Creates customized menu, quantities, and prep plan' },
        { text: 'Open new party plan', desc: 'Opens the detailed event setup modal' },
      ],
    },
    {
      title: 'Shopping Docket & Items',
      icon: ShoppingBag,
      color: 'text-emerald-400',
      commands: [
        { text: 'Add 2 packs of organic limes', desc: 'Adds item, sets physical aisle & updates budget' },
        { text: 'Add 5 bags of ice', desc: 'Adds ice from front cooler & auto-recalculates cost' },
        { text: 'Mark ground beef as bought', desc: 'Checks item off your shopping docket' },
        { text: 'Check off tortilla chips', desc: 'Marks item acquired with confetti milestone' },
        { text: 'Remove paper plates', desc: 'Deletes item and recalculates remaining budget' },
        { text: 'Optimize budget with Cymbal Essentials', desc: 'Swaps eligible brands to save 25%' },
        { text: 'Check all items / Uncheck all items', desc: 'Bulk status update for all groceries' },
      ],
    },
    {
      title: 'Hands-Free Audio Readout (TTS)',
      icon: Volume2,
      color: 'text-blue-400',
      commands: [
        { text: 'Read my shopping list', desc: 'Speaks remaining unbought items and store aisles aloud' },
        { text: 'What is my total cost?', desc: 'Speaks estimated total, target budget, and variance' },
        { text: 'What should I prep next?', desc: 'Speaks upcoming timeline task and countdown' },
        { text: 'What is on the menu?', desc: 'Speaks mains, appetizers, and signature drinks' },
        { text: 'Stop / Silence', desc: 'Immediately halts ongoing voice narration' },
      ],
    },
    {
      title: 'Navigation & Views',
      icon: Compass,
      color: 'text-purple-400',
      commands: [
        { text: 'Show shopping list', desc: 'Switches directly to Section 02 Shopping Docket' },
        { text: 'Show event blueprint', desc: 'Switches to Section 01 Event Blueprint' },
        { text: 'Show menu and recipes', desc: 'Switches to Section 03 Menu & Recipes' },
        { text: 'Show budget breakdown', desc: 'Switches to Section 04 Budget & Ratios' },
        { text: 'Show prep countdown', desc: 'Switches to Section 05 Prep Countdown' },
      ],
    },
    {
      title: 'Fulfillment & Checkout',
      icon: Truck,
      color: 'text-cyan-400',
      commands: [
        { text: 'Start checkout', desc: 'Opens 1-click CymbalMart Express Fulfillment modal' },
        { text: 'Select curbside pickup', desc: 'Sets fulfillment to Free Curbside Pickup Bay 4' },
        { text: 'Select express delivery', desc: 'Sets 2-Hour Express Delivery' },
        { text: 'Place order / Confirm checkout', desc: 'Submits order and confirms receipt' },
        { text: 'Close checkout', desc: 'Dismisses the checkout modal' },
      ],
    },
    {
      title: 'CymbalMart AI Assistant Consultation',
      icon: BotMessageSquare,
      color: 'text-pink-400',
      commands: [
        { text: 'Ask assistant: What wine pairs best with brisket?', desc: 'Queries AI assistant and speaks response' },
        { text: 'Ask assistant: Where are gluten-free buns in store?', desc: 'Directs to physical store aisle' },
        { text: 'Ask assistant: How do I batch margaritas for 12?', desc: 'Provides culinary scaling guidance' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-[#0F0F0F] border border-white/20 rounded-xl max-w-3xl w-full text-white shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                Voice Control Manual
              </div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                Hands-Free Voice Command Guide
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tip Banner */}
        <div className="px-6 py-3 bg-emerald-950/40 border-b border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Hands-Free Mode:</strong> Toggle "Hands-Free Mode" ON in the bottom voice bar to keep the microphone active continuously while cooking or shopping in-store!
          </span>
        </div>

        {/* Categories Grid */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[60vh]">
          {commandCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-serif font-bold text-white border-b border-white/10 pb-1.5">
                  <Icon className={`w-4 h-4 ${cat.color}`} />
                  <span>{cat.title}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {cat.commands.map((cmd, cIdx) => (
                    <div
                      key={cIdx}
                      onClick={() => {
                        if (onRunSampleCommand) {
                          onRunSampleCommand(cmd.text);
                          onClose();
                        }
                      }}
                      className="p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/25 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-white group-hover:text-emerald-300 transition-colors">
                        <Mic className="w-3 h-3 text-white/40 group-hover:text-emerald-400" />
                        <span>"{cmd.text}"</span>
                      </div>
                      <div className="text-[11px] text-white/50 font-sans mt-0.5 pl-4.5">
                        {cmd.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-white/50">
          <span>Click any example above to try it instantly!</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-white/90"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
