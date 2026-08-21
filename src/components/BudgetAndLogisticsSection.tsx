import React, { useState } from 'react';
import { PartyPlan } from '../types';
import {
  DollarSign,
  TrendingDown,
  PieChart,
  Calculator,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  GlassWater,
  Flame,
  Package,
} from 'lucide-react';

interface BudgetAndLogisticsSectionProps {
  plan: PartyPlan;
  currency: string;
  onOpenAiChat: (prompt?: string) => void;
}

export const BudgetAndLogisticsSection: React.FC<BudgetAndLogisticsSectionProps> = ({
  plan,
  currency,
  onOpenAiChat,
}) => {
  const totalBudget = plan.budget.targetBudget;
  const estimatedCost = plan.budget.estimatedTotal;
  const totalGuests = plan.guestCount.total;
  const costPerGuest = (estimatedCost / (totalGuests || 1)).toFixed(2);
  const isOverBudget = estimatedCost > totalBudget;
  const budgetDiff = Math.abs(estimatedCost - totalBudget);

  // Interactive Live Calculator Experimenter
  const [calcGuests, setCalcGuests] = useState<number>(totalGuests || 15);
  const [calcHours, setCalcHours] = useState<number>(plan.durationHours || 4);

  // Formulas
  const proteinLbs = ((calcGuests * 0.5)).toFixed(1);
  const totalDrinksNeeded = Math.ceil(calcGuests * 1.25 * calcHours);
  const iceLbsNeeded = Math.ceil(calcGuests * 1.5);
  const platesNeeded = Math.ceil(calcGuests * 2);
  const napkinsNeeded = Math.ceil(calcGuests * 3);

  const breakdown = plan.budgetBreakdown || {
    food: Math.round(estimatedCost * 0.5),
    drinks: Math.round(estimatedCost * 0.25),
    tablewareAndSupplies: Math.round(estimatedCost * 0.12),
    decorations: Math.round(estimatedCost * 0.08),
    buffer: Math.round(estimatedCost * 0.05),
  };

  const categories = [
    { label: 'Food & Groceries', amount: breakdown.food, color: 'bg-rose-500', barColor: 'bg-rose-500' },
    { label: 'Beverages, Alcohol & Mixers', amount: breakdown.drinks, color: 'bg-amber-500', barColor: 'bg-amber-500' },
    { label: 'Tableware & Disposables', amount: breakdown.tablewareAndSupplies, color: 'bg-emerald-500', barColor: 'bg-emerald-500' },
    { label: 'Decorations & Atmosphere', amount: breakdown.decorations, color: 'bg-violet-500', barColor: 'bg-violet-500' },
    { label: 'Contingency & Buffer', amount: breakdown.buffer, color: 'bg-stone-400', barColor: 'bg-stone-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Budget Header Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Budget Status */}
        <div className="bg-[#111111] rounded-lg p-6 border border-white/10 shadow-md space-y-2 font-sans">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Total Target Budget</span>
            <div className="p-2 rounded bg-white/5 text-white/70 border border-white/10">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif text-white font-normal">
            {currency}{totalBudget.toFixed(2)}
          </div>
          <p className="text-xs text-white/40">Allocated spending ceiling set by host</p>
        </div>

        {/* Estimated Spend */}
        <div className="bg-[#111111] rounded-lg p-6 border border-white/10 shadow-md space-y-2 font-sans">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Estimated Total</span>
            <div className="p-2 rounded bg-white/5 text-white/70 border border-white/10">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif text-white font-normal flex items-baseline gap-2">
            <span>{currency}{estimatedCost.toFixed(2)}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border font-sans ${
              isOverBudget ? 'bg-amber-950/70 text-amber-300 border-amber-800/60' : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
            }`}>
              {isOverBudget ? `+${currency}${budgetDiff.toFixed(0)} over` : `${currency}${budgetDiff.toFixed(0)} safe`}
            </span>
          </div>
          <p className="text-xs text-white/40">Sum of itemized procurement docket</p>
        </div>

        {/* Cost Per Guest */}
        <div className="bg-[#111111] rounded-lg p-6 border border-white/10 shadow-md space-y-2 font-sans">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Cost Per Guest</span>
            <div className="p-2 rounded bg-white/5 text-white/70 border border-white/10">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif text-white font-normal">
            {currency}{costPerGuest} <span className="text-xs font-sans text-white/40">/ attendee</span>
          </div>
          <p className="text-xs text-white/40">Based on {totalGuests} confirmed invitations</p>
        </div>
      </div>

      {/* Main Grid: Breakdown & Formula Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spend Distribution */}
        <div className="bg-[#111111] rounded-lg p-6 border border-white/10 shadow-md space-y-5 font-sans">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif text-white tracking-wide">Department Budget Allocation</h3>
              <p className="text-xs text-white/40">Itemized financial distribution by procurement class</p>
            </div>
            <button
              onClick={() => onOpenAiChat('Analyze my party budget and tell me the top 3 ways to cut costs by 20% without sacrificing fun')}
              className="text-xs text-white/70 hover:text-white uppercase tracking-wider font-semibold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-white/60" />
              AI Optimizer
            </button>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="h-2 rounded-full overflow-hidden bg-white/10 flex gap-0.5">
            {categories.map((cat, idx) => {
              const pct = estimatedCost > 0 ? (cat.amount / estimatedCost) * 100 : 20;
              return (
                <div
                  key={idx}
                  className={`${cat.barColor} h-full transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                  title={`${cat.label}: ${currency}${cat.amount}`}
                />
              );
            })}
          </div>

          {/* Category List */}
          <div className="space-y-3 pt-2">
            {categories.map((cat, idx) => {
              const pct = estimatedCost > 0 ? Math.round((cat.amount / estimatedCost) * 100) : 0;
              return (
                <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                    <span className="font-medium text-white/80">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono-custom">
                    <span className="text-white/40 text-xs">{pct}%</span>
                    <span className="font-semibold text-white w-20 text-right">
                      {currency}{cat.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cost Savings AI Suggestions */}
          <div className="p-4 rounded-lg bg-[#161616] border border-white/15 text-xs space-y-2 text-white">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-white/80">
              <Lightbulb className="w-4 h-4 text-white/60" />
              <span>Smart Concierge Procurement Strategies</span>
            </div>
            <ul className="space-y-1.5 text-white/60 list-disc pl-4 leading-relaxed font-serif text-xs">
              <li>
                <strong className="font-sans text-white not-italic">Wholesale club advantage:</strong> Buying napkins, ice, disposables, and mixers in bulk at Costco/Wholesale depots trims ~30% off convenience grocery pricing.
              </li>
              <li>
                <strong className="font-sans text-white not-italic">Batch punch vs. open bar:</strong> Formulating 1 signature punch bowl dispenser saves $50+ and relieves host bottleneck bartending.
              </li>
              <li>
                <strong className="font-sans text-white not-italic">Seasonal pairings:</strong> Choose in-season berries and produce for peak quality at half the import price.
              </li>
            </ul>
          </div>
        </div>

        {/* Quantity Rule-of-Thumb Formula Engine */}
        <div className="bg-[#111111] rounded-lg p-6 border border-white/10 shadow-md space-y-5 font-sans">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white/10 border border-white/20 text-white flex items-center justify-center font-semibold text-sm">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif text-white tracking-wide">Live Quantity Logistics Engine</h3>
              <p className="text-xs text-white/40">Culinary standard yield formulas and volume rules of thumb</p>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-3 bg-[#161616] p-4 rounded-lg border border-white/10 text-xs">
            <div>
              <label className="block text-white/50 uppercase tracking-wider text-[10px] font-bold mb-1.5">
                Guest Count: <span className="text-white font-mono-custom text-xs">{calcGuests}</span>
              </label>
              <input
                type="range"
                min="4"
                max="60"
                value={calcGuests}
                onChange={(e) => setCalcGuests(Number(e.target.value))}
                className="w-full accent-white"
              />
            </div>

            <div>
              <label className="block text-white/50 uppercase tracking-wider text-[10px] font-bold mb-1.5">
                Event Duration: <span className="text-white font-mono-custom text-xs">{calcHours} hrs</span>
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={calcHours}
                onChange={(e) => setCalcHours(Number(e.target.value))}
                className="w-full accent-white"
              />
            </div>
          </div>

          {/* Calculated Output Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-[#161616] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-white/50 uppercase tracking-wider text-[10px] font-bold">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Protein / Meat</span>
              </div>
              <div className="text-xl font-serif text-white font-normal">{proteinLbs} lbs</div>
              <div className="text-[10px] text-white/40">Standard 0.5 lb / person</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#161616] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-white/50 uppercase tracking-wider text-[10px] font-bold">
                <GlassWater className="w-3.5 h-3.5 text-amber-400" />
                <span>Drink Volume</span>
              </div>
              <div className="text-xl font-serif text-white font-normal">{totalDrinksNeeded} Servings</div>
              <div className="text-[10px] text-white/40">1.25 drinks / guest / hour</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#161616] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-white/50 uppercase tracking-wider text-[10px] font-bold">
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ice Volume</span>
              </div>
              <div className="text-xl font-serif text-white font-normal">{iceLbsNeeded} lbs</div>
              <div className="text-[10px] text-white/40">1.5 lbs / person (coolers + cups)</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#161616] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-white/50 uppercase tracking-wider text-[10px] font-bold">
                <Users className="w-3.5 h-3.5 text-violet-400" />
                <span>Tableware</span>
              </div>
              <div className="text-xl font-serif text-white font-normal">
                {platesNeeded}p / {napkinsNeeded}n
              </div>
              <div className="text-[10px] text-white/40">2 plates, 3 napkins / guest</div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onOpenAiChat(`Scale my active party shopping list to precisely ${calcGuests} guests and ${calcHours} hours`)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-white hover:bg-white/90 text-black text-xs font-bold uppercase tracking-widest transition shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-black" />
              Recalculate Shopping List for {calcGuests} Guests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
