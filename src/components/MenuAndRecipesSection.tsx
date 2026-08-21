import React, { useState } from 'react';
import { PartyPlan, MenuItem, DrinkItem } from '../types';
import {
  Utensils,
  Wine,
  Sparkles,
  Clock,
  ChefHat,
  Flame,
  Scale,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Plus,
  Coffee,
  CheckCircle2,
} from 'lucide-react';

interface MenuAndRecipesSectionProps {
  plan: PartyPlan;
  currency: string;
  onOpenAiChat: (prompt?: string) => void;
}

export const MenuAndRecipesSection: React.FC<MenuAndRecipesSectionProps> = ({
  plan,
  currency,
  onOpenAiChat,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<'all' | 'appetizers' | 'mains' | 'sides' | 'desserts' | 'drinks'>('all');
  const [expandedItems, setExpandedItems] = useState<{ [id: string]: boolean }>({});
  
  // Interactive Punch / Drink Batch Scaler State
  const [punchMultiplier, setPunchMultiplier] = useState<number>(1);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { appetizers = [], mains = [], sides = [], desserts = [], drinks = [] } = plan.menu;

  const totalDishes = appetizers.length + mains.length + sides.length + desserts.length + drinks.length;

  return (
    <div className="space-y-6">
      {/* Course Filter Bar */}
      <div className="bg-[#111111] rounded-lg p-4 border border-white/10 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: `Full Menu (${totalDishes})` },
            { id: 'appetizers', label: `Appetizers (${appetizers.length})` },
            { id: 'mains', label: `Mains (${mains.length})` },
            { id: 'sides', label: `Sides (${sides.length})` },
            { id: 'desserts', label: `Desserts (${desserts.length})` },
            { id: 'drinks', label: `Drinks & Punch (${drinks.length})` },
          ].map((course) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(course.id as any)}
              className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition ${
                selectedCourse === course.id
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-white/5 text-white/60 hover:text-white border border-white/10 hover:bg-white/10'
              }`}
            >
              {course.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => onOpenAiChat('Suggest an additional crowd-pleasing dish that pairs well with this menu')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-white hover:bg-white/90 text-black text-xs font-bold uppercase tracking-widest shrink-0 transition shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Add Dish via AI</span>
        </button>
      </div>

      {/* Signature Punch Batching Tool Highlight */}
      {drinks.length > 0 && (selectedCourse === 'all' || selectedCourse === 'drinks') && (
        <div className="bg-[#141414] rounded-lg p-5 border border-white/15 shadow-md space-y-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-white/10 text-white border border-white/20">
                <Wine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif text-white tracking-wide">Interactive Beverage & Punch Batching Suite</h3>
                <p className="text-xs text-white/50">Scale bulk recipes for beverage carafes, dispensers, and punch bowls</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#1C1C1C] px-3 py-1.5 rounded border border-white/15 text-xs">
              <span className="font-semibold text-white/70 uppercase tracking-wider text-[10px]">Batch Scale:</span>
              {[1, 1.5, 2, 3].map((mult) => (
                <button
                  key={mult}
                  onClick={() => setPunchMultiplier(mult)}
                  className={`px-2 py-0.5 rounded font-bold transition text-xs font-mono-custom ${
                    punchMultiplier === mult
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {mult}x
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drinks.map((drink) => {
              const scaledServings = Math.round(drink.batchServings * punchMultiplier);
              return (
                <div key={drink.id} className="bg-[#191919] rounded-lg p-4 border border-white/10 shadow-sm space-y-3 font-sans">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-serif text-white">{drink.name}</h4>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          drink.alcoholic ? 'bg-amber-950/70 text-amber-300 border-amber-800/60' : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                        }`}>
                          {drink.alcoholic ? 'Cocktail' : 'Mocktail / Soft'}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed">{drink.description}</p>
                    </div>
                  </div>

                  {/* Scaled Ingredients Table */}
                  <div className="bg-[#121212] p-3 rounded border border-white/10 text-xs space-y-1.5">
                    <div className="font-semibold text-white/70 flex justify-between uppercase tracking-wider text-[10px]">
                      <span>Recipe Ingredients (Yields {scaledServings} servings)</span>
                      <span>Est. Cost</span>
                    </div>
                    {drink.ingredients.map((ing, i) => {
                      const scaledQty = (ing.quantity * punchMultiplier).toFixed(ing.quantity % 1 === 0 && punchMultiplier === 1 ? 0 : 1);
                      const scaledCost = (ing.estimatedCost * punchMultiplier).toFixed(2);
                      return (
                        <div key={i} className="flex items-center justify-between text-white/70">
                          <span>
                            • <strong>{scaledQty} {ing.unit}</strong> {ing.name}
                          </span>
                          <span className="font-mono-custom text-white/90">{currency}{scaledCost}</span>
                        </div>
                      );
                    })}
                  </div>

                  {drink.batchingInstructions && (
                    <div className="text-xs text-white/70 bg-white/5 p-2.5 rounded border-l-2 border-white/40 italic leading-relaxed font-serif">
                      <strong className="not-italic font-sans text-white uppercase text-[10px] tracking-wider block mb-0.5">Concierge Mixing Note:</strong> {drink.batchingInstructions}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Courses Rendering */}
      <div className="space-y-6">
        {(selectedCourse === 'all' || selectedCourse === 'appetizers') && appetizers.length > 0 && (
          <CourseBlock
            title="Appetizers & Grazing"
            badgeColor="bg-amber-400"
            items={appetizers}
            currency={currency}
            expandedItems={expandedItems}
            onToggleExpand={toggleExpand}
            onOpenAiChat={onOpenAiChat}
          />
        )}

        {(selectedCourse === 'all' || selectedCourse === 'mains') && mains.length > 0 && (
          <CourseBlock
            title="Main Entrées & Grills"
            badgeColor="bg-rose-400"
            items={mains}
            currency={currency}
            expandedItems={expandedItems}
            onToggleExpand={toggleExpand}
            onOpenAiChat={onOpenAiChat}
          />
        )}

        {(selectedCourse === 'all' || selectedCourse === 'sides') && sides.length > 0 && (
          <CourseBlock
            title="Sides & Fresh Salads"
            badgeColor="bg-emerald-400"
            items={sides}
            currency={currency}
            expandedItems={expandedItems}
            onToggleExpand={toggleExpand}
            onOpenAiChat={onOpenAiChat}
          />
        )}

        {(selectedCourse === 'all' || selectedCourse === 'desserts') && desserts.length > 0 && (
          <CourseBlock
            title="Desserts & Sweets"
            badgeColor="bg-violet-400"
            items={desserts}
            currency={currency}
            expandedItems={expandedItems}
            onToggleExpand={toggleExpand}
            onOpenAiChat={onOpenAiChat}
          />
        )}
      </div>
    </div>
  );
};

interface CourseBlockProps {
  title: string;
  badgeColor: string;
  items: MenuItem[];
  currency: string;
  expandedItems: { [id: string]: boolean };
  onToggleExpand: (id: string) => void;
  onOpenAiChat: (prompt: string) => void;
}

const CourseBlock: React.FC<CourseBlockProps> = ({
  title,
  badgeColor,
  items,
  currency,
  expandedItems,
  onToggleExpand,
  onOpenAiChat,
}) => {
  return (
    <div className="bg-[#111111] rounded-lg border border-white/10 shadow-md overflow-hidden">
      <div className="bg-[#161616] px-5 py-3 border-b border-white/10 flex items-center justify-between font-sans">
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full ${badgeColor}`} />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">{title}</h3>
          <span className="text-[11px] text-white/40 font-medium">({items.length} dishes)</span>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {items.map((item) => {
          const isExpanded = !!expandedItems[item.id];
          const itemTotalCost = item.ingredients?.reduce((acc, ing) => acc + ing.estimatedCost, 0) || 0;

          return (
            <div key={item.id} className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-serif text-white font-normal tracking-wide">{item.name}</h4>
                    {item.dietaryTags?.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 font-sans"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-sans">{item.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 font-sans">
                  <div className="text-right text-xs">
                    <div className="font-semibold text-white/90">{item.servings} Servings</div>
                    <div className="text-white/40 font-mono-custom text-[11px]">Est. {currency}{itemTotalCost.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => onToggleExpand(item.id)}
                    className="p-1.5 rounded border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
                    title={isExpanded ? 'Collapse' : 'Expand ingredients & instructions'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Meta tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 pt-1 font-sans">
                <span className="flex items-center gap-1.5 font-medium bg-white/5 border border-white/10 px-2.5 py-1 rounded text-white/80 uppercase text-[10px] tracking-wider">
                  <ChefHat className="w-3.5 h-3.5 text-white/60" />
                  {item.prepDifficulty || 'Easy'} Prep
                </span>
                {item.prepAheadTime && (
                  <span className="flex items-center gap-1.5 font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60 px-2.5 py-1 rounded text-[10px] uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Make Ahead: {item.prepAheadTime}
                  </span>
                )}
                <button
                  onClick={() => onOpenAiChat(`Give me tips on how to prepare and present "${item.name}" for a party`)}
                  className="text-xs text-white/70 hover:text-white font-semibold uppercase tracking-wider flex items-center gap-1 ml-auto transition"
                >
                  <Sparkles className="w-3 h-3 text-white/60" />
                  Ask Concierge Cooking Tips
                </button>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans animate-in fade-in duration-100">
                  {/* Ingredients */}
                  <div className="bg-[#161616] p-3.5 rounded-lg border border-white/10 space-y-2">
                    <div className="font-bold text-white uppercase tracking-wider text-[10px] flex items-center justify-between border-b border-white/10 pb-2">
                      <span>Ingredients Breakdown</span>
                      <span className="text-white/40 font-normal">Department</span>
                    </div>
                    <ul className="space-y-1.5 pt-1">
                      {item.ingredients?.map((ing, idx) => (
                        <li key={idx} className="flex items-center justify-between text-white/70">
                          <span>
                            • {ing.quantity} {ing.unit} <strong className="text-white font-serif">{ing.name}</strong>
                          </span>
                          <span className="text-white/40 text-[10px] uppercase tracking-wider">{ing.category}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div className="bg-[#161616] p-3.5 rounded-lg border border-white/10 space-y-2">
                    <div className="font-bold text-white uppercase tracking-wider text-[10px] border-b border-white/10 pb-2">Host Quick Steps</div>
                    {item.quickInstructions && item.quickInstructions.length > 0 ? (
                      <ol className="space-y-1.5 list-decimal pl-4 text-white/70 leading-relaxed pt-1">
                        {item.quickInstructions.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-white/40 italic font-serif pt-1">
                        Standard preparation. Keep warm in slow cooker or serve fresh from the grill/oven.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
