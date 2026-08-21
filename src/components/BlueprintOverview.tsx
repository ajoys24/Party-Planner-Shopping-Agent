import React from 'react';
import { PartyPlan } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Utensils,
  Music,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Store,
  Layers,
  BotMessageSquare,
  Truck,
  Compass,
} from 'lucide-react';

interface BlueprintOverviewProps {
  plan: PartyPlan;
  onNavigateToShopping: () => void;
  onOpenAiChat: (initialPrompt?: string) => void;
  onOpenNewPartyModal?: () => void;
  onOpenCheckout?: () => void;
}

export const BlueprintOverview: React.FC<BlueprintOverviewProps> = ({
  plan,
  onNavigateToShopping,
  onOpenAiChat,
  onOpenNewPartyModal,
  onOpenCheckout,
}) => {
  const totalGuests = plan.guestCount.total;
  const costPerGuest = Math.round(plan.budget.estimatedTotal / (totalGuests || 1));
  const isOverBudget = plan.budget.estimatedTotal > plan.budget.targetBudget;
  const budgetDiff = Math.abs(plan.budget.targetBudget - plan.budget.estimatedTotal);

  return (
    <div className="space-y-6">
      {/* CUJ 3-Step Guided Journey Action Card */}
      <div className="bg-[#111111] border border-white/15 rounded-lg p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-white/60">
              CYMBALMART CRITICAL USER JOURNEY (CUJ)
            </span>
          </div>
          <span className="text-[11px] font-mono text-white/40">
            STORE: {plan.storeLocation || 'CymbalMart Supercenter #104'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Define Event */}
          <div className="bg-white/[0.02] border border-white/10 hover:border-white/30 rounded-lg p-4 transition flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/50">
                  STEP 01
                </span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono">
                  DEFINED
                </span>
              </div>
              <h4 className="text-sm font-serif font-bold text-white">Define Event</h4>
              <p className="text-xs text-white/60 font-sans mt-1 leading-relaxed">
                {plan.eventType} • {plan.guestCount.total} Guests • ${plan.budget.targetBudget} Budget target
              </p>
            </div>
            <button
              onClick={onOpenNewPartyModal}
              className="w-full py-1.5 px-3 rounded border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white text-[11px] font-sans uppercase tracking-wider font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Modify Specs</span>
              <ArrowRight className="w-3 h-3 text-white/60" />
            </button>
          </div>

          {/* Step 2: Review List & Align Budget */}
          <div className="bg-white/[0.02] border border-white/10 hover:border-white/30 rounded-lg p-4 transition flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/50">
                  STEP 02
                </span>
                <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-mono font-bold ${
                  isOverBudget ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {isOverBudget ? `+$${budgetDiff} OVER` : `$${budgetDiff} UNDER`}
                </span>
              </div>
              <h4 className="text-sm font-serif font-bold text-white">Review List & Align Budget</h4>
              <p className="text-xs text-white/60 font-sans mt-1 leading-relaxed">
                {plan.shoppingList.length} items mapped to CymbalMart Supercenter store aisles.
              </p>
            </div>
            <button
              onClick={onNavigateToShopping}
              className="w-full py-1.5 px-3 rounded bg-white text-black hover:bg-white/90 text-[11px] font-sans uppercase tracking-widest font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Review Shopping List</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Step 3: Refine & Checkout */}
          <div className="bg-white/[0.02] border border-white/10 hover:border-white/30 rounded-lg p-4 transition flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/50">
                  STEP 03
                </span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                  READY
                </span>
              </div>
              <h4 className="text-sm font-serif font-bold text-white">Refine & Checkout</h4>
              <p className="text-xs text-white/60 font-sans mt-1 leading-relaxed">
                Refine with CymbalMart Assistant or 1-click Express Delivery & Curbside Pickup.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAiChat('Help me refine this plan for strict budget and dietary options at CymbalMart Supercenter #104')}
                className="flex-1 py-1.5 px-2.5 rounded border border-white/20 hover:border-white/40 bg-white/5 text-white text-[11px] font-sans uppercase tracking-wider font-bold transition flex items-center justify-center gap-1"
                title="Open CymbalMart Assistant Chatbot"
              >
                <BotMessageSquare className="w-3 h-3 text-white/70" />
                <span>Assistant</span>
              </button>
              <button
                onClick={onOpenCheckout}
                className="flex-1 py-1.5 px-2.5 rounded border border-white/30 bg-white text-black hover:bg-white/90 text-[11px] font-sans uppercase tracking-wider font-bold transition flex items-center justify-center gap-1 shadow-sm"
              >
                <Truck className="w-3 h-3" />
                <span>Checkout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-lg bg-[#111111] text-white p-6 sm:p-8 shadow-xl border border-white/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded border border-white/20 bg-white/5 text-white text-[10px] font-bold uppercase tracking-[0.25em] font-sans">
              <Sparkles className="w-3 h-3 text-white/70" />
              <span>CYMBALMART EVENT BLUEPRINT // {plan.eventType}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif italic text-white font-normal tracking-tight leading-tight">
              {plan.title}
            </h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed font-sans">
              {plan.vibeAndNotes}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={onNavigateToShopping}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-white hover:bg-white/90 text-black text-xs font-bold uppercase tracking-widest font-sans transition shadow-sm"
            >
              <span>Aisle Shopping Docket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenAiChat('Give me fresh party game and icebreaker ideas tailored for this theme')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-white/5 hover:bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-wider font-sans transition"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Ideas</span>
            </button>
          </div>
        </div>

        {/* Quick Spec Pills */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs font-sans">
          <div className="bg-[#181818] p-3.5 rounded border border-white/10">
            <div className="text-white/50 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1.5">
              <Users className="w-3 h-3 text-white/50" />
              <span>Headcount</span>
            </div>
            <div className="text-white font-medium text-sm">
              {plan.guestCount.adults} Adults, {plan.guestCount.kids} Kids
            </div>
            <div className="text-white/40 text-[11px] mt-0.5">{totalGuests} Total Attendees</div>
          </div>

          <div className="bg-[#181818] p-3.5 rounded border border-white/10">
            <div className="text-white/50 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3 h-3 text-white/50" />
              <span>Duration & Venue</span>
            </div>
            <div className="text-white font-medium text-sm truncate">
              {plan.durationHours} Hours Duration
            </div>
            <div className="text-white/40 text-[11px] mt-0.5 truncate">{plan.venueType}</div>
          </div>

          <div className="bg-[#181818] p-3.5 rounded border border-white/10">
            <div className="text-white/50 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1.5">
              <DollarSign className="w-3 h-3 text-white/50" />
              <span>Financials</span>
            </div>
            <div className="text-white font-medium text-sm">
              ${plan.budget.estimatedTotal} Estimated / ${plan.budget.targetBudget}
            </div>
            <div className="text-white/40 text-[11px] mt-0.5">${costPerGuest} / Guest Target</div>
          </div>

          <div className="bg-[#181818] p-3.5 rounded border border-white/10">
            <div className="text-white/50 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Dietary Profile</span>
            </div>
            <div className="text-white font-medium text-sm truncate">
              {plan.dietaryRestrictions.length > 0 ? plan.dietaryRestrictions.join(', ') : 'Omnivore / Standard'}
            </div>
            <div className="text-white/40 text-[11px] mt-0.5">Customized Options</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Schedule & Host Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Run-of-Show Schedule (2 cols) */}
        <div className="lg:col-span-2 bg-[#111111] rounded-lg p-6 border border-white/10 shadow-md">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white/10 text-white flex items-center justify-center font-bold text-xs border border-white/20">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif text-white tracking-wide">Run-of-Show Timeline</h3>
                <p className="text-xs text-white/50 font-sans">Curated sequence of hospitality, dining, and transitions</p>
              </div>
            </div>
            <button
              onClick={() => onOpenAiChat('Customize or expand the party schedule')}
              className="text-xs text-white/70 hover:text-white font-sans uppercase tracking-wider font-bold flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/10 transition"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine Flow</span>
            </button>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-white/15">
            {plan.schedule.map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-white ring-4 ring-white/10 group-hover:scale-125 transition" />
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">{item.time}</span>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-white/80 bg-white/10 border border-white/15 px-2 py-0.5 rounded w-fit">
                    {item.phase}
                  </span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed font-sans">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Atmosphere & Pro Tips */}
        <div className="space-y-6">
          {/* Atmosphere & Playlist */}
          <div className="bg-[#111111] rounded-lg p-6 border border-white/10 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded bg-white/10 text-white flex items-center justify-center font-bold text-xs border border-white/20">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-serif text-white tracking-wide">Acoustic & Mood Direction</h3>
                <span className="text-xs text-white/50 font-sans">Ambiance curation</span>
              </div>
            </div>
            <div className="p-3.5 rounded bg-white/5 border-l-2 border-white/40 text-xs text-white/80 leading-relaxed italic font-serif">
              "{plan.playlistVibe || 'Curated ambient jazz transitioning to deep melodic grooves as evening matures.'}"
            </div>

            {/* Equipment Staging */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-[10px] font-bold font-sans uppercase tracking-widest text-white/50 mb-2 flex items-center gap-1.5">
                <Utensils className="w-3 h-3 text-white/50" />
                <span>Venue Staging & Equipment</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {plan.equipment.map((eq, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded bg-[#1A1A1A] border border-white/10 text-white/80 font-sans">
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Host Pro Tips */}
          <div className="bg-[#141414] rounded-lg p-6 border border-white/15 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-300" />
              <h3 className="text-sm font-serif text-white tracking-wide">Host Protocols & Strategies</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-white/75 leading-relaxed font-sans">
              {plan.hostTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white/50 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
