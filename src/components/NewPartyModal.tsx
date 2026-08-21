import React, { useState } from 'react';
import { PartyPlan, PartyPlannerFormInput } from '../types';
import {
  Sparkles,
  X,
  Users,
  DollarSign,
  Clock,
  MapPin,
  Utensils,
  Wine,
  ShieldCheck,
  Flame,
  Check,
  ArrowRight,
  RefreshCw,
  Gift,
} from 'lucide-react';

interface NewPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (plan: PartyPlan) => void;
}

export const NewPartyModal: React.FC<NewPartyModalProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
}) => {
  const [activeMode, setActiveMode] = useState<'prompt' | 'wizard'>('wizard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Natural Language Prompt State
  const [naturalPrompt, setNaturalPrompt] = useState('');

  // Structured Form State
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('BBQ Cookout');
  const [theme, setTheme] = useState('Backyard Summer Grill & Games');
  const [adults, setAdults] = useState(15);
  const [kids, setKids] = useState(4);
  const [durationHours, setDurationHours] = useState(4);
  const [targetBudget, setTargetBudget] = useState(300);
  const [currency, setCurrency] = useState('$');
  const [venueType, setVenueType] = useState('Backyard & Deck');
  const [drinkPreference, setDrinkPreference] = useState<'full_bar' | 'beer_wine' | 'mocktails_only' | 'family_mix' | 'byob_plus_mixers'>('family_mix');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [dietary, setDietary] = useState<string[]>(['Vegetarian Options']);
  const [equipment, setEquipment] = useState<string[]>(['BBQ Grill', 'Oven', 'Coolers']);

  const dietaryOptions = [
    'Vegetarian Options',
    'Vegan Options',
    'Gluten-Free Safe',
    'Strictly Nut-Free',
    'Dairy-Free Options',
    'Halal',
    'Kosher',
    'Low-Carb / Keto',
    'Kid-Friendly Choices',
  ];

  const equipmentOptions = [
    'BBQ Grill',
    'Full Oven',
    'Stovetop',
    'Slow Cooker / Crockpot',
    'Coolers / Ice Tubs',
    'Punch Bowl / Dispenser',
    'Blender / Ice Crusher',
    'Air Fryer',
    'Microwave Only',
  ];

  const toggleDietary = (item: string) => {
    setDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const applyPreset = (presetType: string) => {
    if (presetType === 'taco') {
      setTitle('Taco & Margarita Fiesta Night');
      setEventType('Taco Fiesta');
      setTheme('Vibrant Mexican Taquería & Margaritas');
      setAdults(16);
      setKids(2);
      setDurationHours(4);
      setTargetBudget(280);
      setVenueType('Living Room & Dining Patio');
      setDrinkPreference('full_bar');
      setDietary(['Gluten-Free Safe', 'Vegetarian Options']);
      setEquipment(['Stovetop', 'Oven', 'Punch Bowl / Dispenser']);
      setAdditionalNotes('Include seasoned carnitas, grilled citrus chicken, fresh pico de gallo, salsa verde, and pitcher margaritas.');
    } else if (presetType === 'brunch') {
      setTitle('Bubbly Weekend Brunch & Bagel Bar');
      setEventType('Brunch & Bubbly');
      setTheme('Sunlit Garden Mimosa Bar & Smoked Salmon');
      setAdults(12);
      setKids(0);
      setDurationHours(3);
      setTargetBudget(240);
      setVenueType('Sunroom & Kitchen Island');
      setDrinkPreference('family_mix');
      setDietary(['Vegetarian Options', 'Nut-Free']);
      setEquipment(['Oven', 'Stovetop', 'Coffee Maker']);
      setAdditionalNotes('Build-your-own bagel board, smoked salmon, fresh whipped cream berry waffles, and champagne mimosa flight.');
    } else if (presetType === 'gameday') {
      setTitle('Super Game Day Wings & Nacho Stadium');
      setEventType('Game Day Gathering');
      setTheme('Tailgate Favorites & Big Screen Watch Party');
      setAdults(18);
      setKids(4);
      setDurationHours(5);
      setTargetBudget(320);
      setVenueType('Living Room & Man Cave');
      setDrinkPreference('beer_wine');
      setDietary(['Kid-Friendly Choices']);
      setEquipment(['Air Fryer', 'Slow Cooker / Crockpot', 'Coolers / Ice Tubs']);
      setAdditionalNotes('Crispy buffalo wings, giant loaded sheet pan nachos, craft IPAs, and sliders.');
    } else if (presetType === 'dinner') {
      setTitle('Rustic Italian Trattoria Dinner');
      setEventType('Dinner Party');
      setTheme('Tuscan Candlelight Pasta & Chianti');
      setAdults(10);
      setKids(0);
      setDurationHours(3.5);
      setTargetBudget(260);
      setVenueType('Dining Room');
      setDrinkPreference('beer_wine');
      setDietary(['Nut-Free']);
      setEquipment(['Stovetop', 'Full Oven', 'Wine Glasses']);
      setAdditionalNotes('Fresh handmade pappardelle with slow-cooked ragu, burrata caprese salad, tiramisu, and Italian red wine.');
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    const payload =
      activeMode === 'prompt'
        ? { rawPrompt: naturalPrompt }
        : {
            title: title.trim() || `${eventType} Celebration`,
            eventType,
            theme,
            adults: Number(adults) || 10,
            kids: Number(kids) || 0,
            durationHours: Number(durationHours) || 4,
            targetBudget: Number(targetBudget) || 250,
            currency,
            dietaryRestrictions: dietary,
            venueType,
            equipment,
            drinkPreference,
            additionalNotes: additionalNotes.trim(),
          };

    try {
      const res = await fetch('/api/gemini/generate-party-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.plan) {
        onPlanCreated(data.plan);
        onClose();
      } else {
        throw new Error(data.error || 'Failed to generate plan');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while generating the party plan.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="bg-[#0D0D0D] rounded-lg max-w-3xl w-full max-h-[90vh] shadow-2xl border border-white/15 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 my-auto text-white">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#141414] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif text-white tracking-wide">Commission New Party Blueprint</h3>
              <p className="text-xs text-white/40">
                End-to-end culinary menu development, guest yield modeling & procurement docket
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector & Quick Presets */}
        <div className="p-4 bg-[#111111] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center p-1 rounded bg-[#181818] border border-white/10 w-fit">
            <button
              onClick={() => setActiveMode('wizard')}
              className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition ${
                activeMode === 'wizard'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Curated Matrix
            </button>
            <button
              onClick={() => setActiveMode('prompt')}
              className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition ${
                activeMode === 'prompt'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Natural Prompt
            </button>
          </div>

          {activeMode === 'wizard' && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-white/40 font-mono-custom uppercase text-[10px] whitespace-nowrap">Presets:</span>
              <button
                onClick={() => applyPreset('taco')}
                className="px-2.5 py-1 rounded bg-[#181818] hover:bg-[#222222] border border-white/15 text-white/80 hover:text-white font-medium whitespace-nowrap transition text-xs"
              >
                🌮 Taquería
              </button>
              <button
                onClick={() => applyPreset('brunch')}
                className="px-2.5 py-1 rounded bg-[#181818] hover:bg-[#222222] border border-white/15 text-white/80 hover:text-white font-medium whitespace-nowrap transition text-xs"
              >
                🥂 Mimosa Brunch
              </button>
              <button
                onClick={() => applyPreset('gameday')}
                className="px-2.5 py-1 rounded bg-[#181818] hover:bg-[#222222] border border-white/15 text-white/80 hover:text-white font-medium whitespace-nowrap transition text-xs"
              >
                🏈 Tailgate
              </button>
              <button
                onClick={() => applyPreset('dinner')}
                className="px-2.5 py-1 rounded bg-[#181818] hover:bg-[#222222] border border-white/15 text-white/80 hover:text-white font-medium whitespace-nowrap transition text-xs"
              >
                🍝 Trattoria
              </button>
            </div>
          )}
        </div>

        {/* Modal Body Form */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm bg-[#0D0D0D]">
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 rounded text-xs">
              {error}
            </div>
          )}

          {activeMode === 'prompt' ? (
            <div className="space-y-3">
              <label className="block text-white/80 font-medium">
                Describe your party vision, theme, and host constraints:
              </label>
              <textarea
                rows={6}
                value={naturalPrompt}
                onChange={(e) => setNaturalPrompt(e.target.value)}
                placeholder="e.g. Plan a tropical luau 30th birthday party for 22 adults and 5 kids. Target budget $350. We have a gas grill and a cooler. Include Hawaiian pulled pork, pineapple skewers, a virgin and rum punch bowl, and note that 3 guests are gluten-free and 1 is allergic to peanuts."
                className="w-full p-4 bg-[#161616] border border-white/15 rounded text-white focus:bg-[#202020] focus:outline-none focus:border-white text-xs sm:text-sm leading-relaxed"
              />
              <p className="text-white/40 text-xs">
                The AI Concierge will calculate exact grocery weights, store routing, batch cocktail ratios, preparation schedule, and budget allocations.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Event Basics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 uppercase tracking-wider text-[10px] font-bold mb-1">Party / Event Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Backyard Summer BBQ Bash"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181818] border border-white/15 rounded text-white focus:bg-[#202020] focus:outline-none focus:border-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-white/50 uppercase tracking-wider text-[10px] font-bold mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181818] border border-white/15 rounded text-white focus:bg-[#202020] focus:outline-none focus:border-white text-xs"
                  >
                    <option value="BBQ Cookout">BBQ Cookout & Grill</option>
                    <option value="Birthday Party">Birthday Celebration</option>
                    <option value="Cocktail Party">Cocktail & Tapas Soirée</option>
                    <option value="Dinner Party">Seated Dinner Party</option>
                    <option value="Taco Fiesta">Taco & Margarita Fiesta</option>
                    <option value="Game Day Gathering">Game Day & Tailgate</option>
                    <option value="Brunch & Bubbly">Weekend Brunch & Mimosa Bar</option>
                    <option value="Tropical Luau">Tropical Luau & Tiki Party</option>
                    <option value="Holiday Feast">Holiday & Family Gathering</option>
                    <option value="Baby Shower">Baby / Bridal Shower</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-white/50 uppercase tracking-wider text-[10px] font-bold mb-1">Theme & Atmosphere</label>
                  <input
                    type="text"
                    placeholder="e.g. Casual outdoor lawn games, craft beer and smoky ribs"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181818] border border-white/15 rounded text-white focus:bg-[#202020] focus:outline-none focus:border-white text-xs"
                  />
                </div>
              </div>

              {/* Headcount, Duration & Budget Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#141414] p-4 rounded-lg border border-white/10">
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">
                    <span>Adults ({adults})</span>
                    <span>Kids ({kids})</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-1/2 px-2 py-1.5 bg-[#1C1C1C] border border-white/15 rounded text-center font-bold text-white font-mono-custom text-xs"
                    />
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={kids}
                      onChange={(e) => setKids(Number(e.target.value))}
                      className="w-1/2 px-2 py-1.5 bg-[#1C1C1C] border border-white/15 rounded text-center font-bold text-white font-mono-custom text-xs"
                    />
                  </div>
                  <div className="text-[10px] text-white/40 text-center mt-1 font-mono-custom">
                    Total: <strong className="text-white">{adults + kids} Attendees</strong>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">
                    Duration: <strong className="text-white font-mono-custom">{durationHours} Hours</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.5"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full accent-white mt-2"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">
                    Budget Cap: <strong className="text-white font-mono-custom">{currency}{targetBudget}</strong>
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="25"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#1C1C1C] border border-white/15 rounded font-bold text-white font-mono-custom text-xs"
                  />
                </div>
              </div>

              {/* Dietary Accommodations */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Dietary Accommodations & Allergies</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((opt) => {
                    const isSelected = dietary.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleDietary(opt)}
                        className={`px-3 py-1 rounded text-[10px] uppercase tracking-wider font-bold transition border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-white text-black border-white shadow-xs'
                            : 'bg-[#181818] text-white/60 border-white/15 hover:text-white hover:border-white/30'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-black" />}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Equipment & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 uppercase tracking-wider text-[10px] font-bold mb-1">Venue Type</label>
                  <input
                    type="text"
                    value={venueType}
                    onChange={(e) => setVenueType(e.target.value)}
                    placeholder="e.g. Backyard & Patio, Apartment, Rented Hall"
                    className="w-full px-3 py-2 bg-[#181818] border border-white/15 rounded text-white focus:bg-[#202020] focus:outline-none focus:border-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-white/50 uppercase tracking-wider text-[10px] font-bold mb-1">Beverage Service Style</label>
                  <select
                    value={drinkPreference}
                    onChange={(e) => setDrinkPreference(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#181818] border border-white/15 rounded text-white focus:bg-[#202020] focus:outline-none focus:border-white text-xs"
                  >
                    <option value="family_mix">Family Mix (Seltzers, Sodas, Lemonade + Beer)</option>
                    <option value="full_bar">Full Bar & Signature Cocktails</option>
                    <option value="beer_wine">Craft Beer & Curated Wines</option>
                    <option value="mocktails_only">Mocktails & Non-Alcoholic Only</option>
                    <option value="byob_plus_mixers">BYOB with Host Mixers & Ice</option>
                  </select>
                </div>
              </div>

              {/* Equipment checklist */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-white/40" />
                  <span>Kitchen Equipment Available</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {equipmentOptions.map((eq) => {
                    const isSelected = equipment.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => toggleEquipment(eq)}
                        className={`px-3 py-1 rounded text-[10px] uppercase tracking-wider font-bold transition border ${
                          isSelected
                            ? 'bg-white text-black border-white'
                            : 'bg-[#181818] text-white/60 border-white/15 hover:text-white hover:border-white/30'
                        }`}
                      >
                        {eq}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional notes */}
              <div>
                <label className="block text-white/50 uppercase tracking-wider text-[10px] font-bold mb-1">Special Host Directives / Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Focus on finger foods, avoid spicy items, make a showstopper dessert"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181818] border border-white/15 rounded text-white focus:bg-[#202020] focus:outline-none focus:border-white text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#141414] border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded text-white/60 hover:text-white text-xs uppercase tracking-wider font-bold transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || (activeMode === 'prompt' && !naturalPrompt.trim())}
            className="flex items-center gap-2 px-6 py-2.5 rounded bg-white hover:bg-white/90 text-black text-xs font-bold uppercase tracking-widest transition shadow-sm disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Concierge Synthesizing Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>Generate Plan & Shopping List</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
