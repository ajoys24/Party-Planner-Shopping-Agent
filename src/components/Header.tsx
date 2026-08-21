import React, { useState } from 'react';
import { PartyPlan } from '../types';
import {
  Sparkles,
  Plus,
  Share2,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  ChevronDown,
  ShoppingBag,
  BotMessageSquare,
  Flame,
  Mic,
  MicOff,
  Radio,
} from 'lucide-react';

interface HeaderProps {
  partyPlans: PartyPlan[];
  activePlan: PartyPlan;
  onSelectPlan: (planId: string) => void;
  onOpenNewPartyModal: () => void;
  onOpenExportModal: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isVoiceListening?: boolean;
  isHandsFree?: boolean;
  onToggleVoice?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  partyPlans,
  activePlan,
  onSelectPlan,
  onOpenNewPartyModal,
  onOpenExportModal,
  onToggleChat,
  isChatOpen,
  activeTab,
  setActiveTab,
  isVoiceListening,
  isHandsFree,
  onToggleVoice,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const checkedCount = activePlan.shoppingList.filter((item) => item.checked).length;
  const totalItemsCount = activePlan.shoppingList.length;
  const progressPercent = totalItemsCount > 0 ? Math.round((checkedCount / totalItemsCount) * 100) : 0;

  const totalBudget = activePlan.budget.targetBudget;
  const estimatedCost = activePlan.budget.estimatedTotal;
  const isOverBudget = estimatedCost > totalBudget;

  return (
    <header className="sticky top-0 z-30 bg-[#0D0D0D]/95 backdrop-blur border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Party Selector */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded bg-white text-black flex items-center justify-center font-serif font-bold text-lg shadow-sm shrink-0 border border-white/30">
                <span>P</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-[10px] font-bold tracking-[0.25em] text-white/50 uppercase font-sans">AI EVENT CONCIERGE</span>
                <h1 className="text-base font-serif font-medium text-white tracking-tight leading-tight">Party Planner & Procurement</h1>
              </div>
            </div>

            {/* Active Plan Selector Dropdown */}
            <div className="relative">
              <button
                id="party-selector-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-sans uppercase tracking-wider transition max-w-[200px] sm:max-w-xs"
              >
                <span className="truncate">{activePlan.title}</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/50 shrink-0" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute left-0 mt-2 w-72 bg-[#141414] rounded-lg shadow-2xl border border-white/15 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between text-[10px] text-white/50 font-bold uppercase tracking-widest font-sans">
                      <span>Curated Issues ({partyPlans.length})</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1">
                      {partyPlans.map((plan) => (
                        <button
                          key={plan.id}
                          id={`select-plan-${plan.id}`}
                          onClick={() => {
                            onSelectPlan(plan.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-start justify-between gap-2 hover:bg-white/5 transition ${
                            plan.id === activePlan.id ? 'bg-white/10 text-white font-medium border-l-2 border-white' : 'text-white/70'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="truncate text-white font-serif text-sm">{plan.title}</div>
                            <div className="text-[11px] text-white/40 flex items-center gap-2 mt-0.5 font-sans">
                              <span>{plan.guestCount.total} guests</span>
                              <span>•</span>
                              <span>{plan.budget.currency}{plan.budget.targetBudget} budget</span>
                            </div>
                          </div>
                          {plan.id === activePlan.id && (
                            <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="p-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenNewPartyModal();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-[11px] font-bold uppercase tracking-wider text-black bg-white hover:bg-white/90 transition font-sans"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create New Blueprint
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-sans text-white/70 bg-white/5 py-1.5 px-3.5 rounded border border-white/10">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-white/50" />
              <span>
                <strong className="text-white font-medium">{activePlan.guestCount.total}</strong> guests ({activePlan.guestCount.adults}A / {activePlan.guestCount.kids}K)
              </span>
            </div>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <DollarSign className={`w-3.5 h-3.5 ${isOverBudget ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span>
                Est. <strong className={isOverBudget ? 'text-amber-300' : 'text-white'}>${estimatedCost}</strong> / ${totalBudget}
              </span>
            </div>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-white/60" />
              <span>
                <strong className="text-white font-medium">{checkedCount}/{totalItemsCount}</strong> bought ({progressPercent}%)
              </span>
            </div>
          </div>

          {/* Actions: Voice Control, CymbalMart Assistant Chatbot, Export, New Party */}
          <div className="flex items-center gap-2 shrink-0">
            {onToggleVoice && (
              <button
                id="header-voice-control-btn"
                onClick={onToggleVoice}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans uppercase tracking-wider transition border shadow-xs ${
                  isVoiceListening
                    ? 'bg-emerald-500 text-black border-emerald-400 font-bold animate-pulse'
                    : isHandsFree
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 font-medium'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
                title={isVoiceListening ? 'Listening... click to pause' : 'Activate Voice Control'}
              >
                <div className="relative">
                  <Mic className={`w-3.5 h-3.5 ${isVoiceListening ? 'animate-bounce' : ''}`} />
                  {isHandsFree && !isVoiceListening && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  )}
                </div>
                <span className="hidden md:inline font-bold">
                  {isVoiceListening ? 'Listening' : isHandsFree ? 'Hands-Free' : 'Voice'}
                </span>
              </button>
            )}

            <button
              id="ai-agent-toggle-btn"
              onClick={onToggleChat}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-sans uppercase tracking-wider transition border shadow-xs ${
                isChatOpen
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="Open CymbalMart Assistant Chatbot"
            >
              <div className="relative">
                <BotMessageSquare className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              </div>
              <span className="hidden sm:inline font-bold">CymbalMart Assistant</span>
              <span className="sm:hidden font-bold">Assistant</span>
            </button>

            <button
              id="export-plan-btn"
              onClick={onOpenExportModal}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-sans uppercase tracking-wider transition flex items-center gap-1.5"
              title="Share / Export Shopping List"
            >
              <Share2 className="w-3.5 h-3.5 text-white/70" />
              <span className="hidden md:inline">Export</span>
            </button>

            <button
              id="new-party-btn"
              onClick={onOpenNewPartyModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-white hover:bg-white/90 text-black text-xs font-sans uppercase tracking-widest font-bold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Plan</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-4 border-t border-white/10 overflow-x-auto no-scrollbar py-2 text-xs font-sans">
          {[
            { id: 'overview', label: '01. EVENT BLUEPRINT' },
            { id: 'shopping', label: `02. SHOPPING DOCKET (${totalItemsCount})` },
            { id: 'menu', label: '03. MENU & RECIPES' },
            { id: 'budget', label: '04. BUDGET & RATIOS' },
            { id: 'timeline', label: '05. PREP COUNTDOWN' },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded uppercase tracking-wider text-[11px] whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
