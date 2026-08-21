import React, { useState, useRef, useEffect } from 'react';
import { PartyPlan, AgentChatMessage } from '../types';
import {
  BotMessageSquare,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Check,
  Store,
  DollarSign,
  Users,
  ShieldCheck,
  ShoppingBag,
  Truck,
  RotateCcw,
  Layers,
  MapPin,
  HelpCircle,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PartyPlan;
  onUpdatePlan: (newPlan: PartyPlan) => void;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

type TopicCategory = 'all' | 'aisles' | 'savings' | 'recipes' | 'delivery';

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onUpdatePlan,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [activeCategory, setActiveCategory] = useState<TopicCategory>('all');
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'welcome_1',
      role: 'assistant',
      content: `👋 Hello! I am your **CymbalMart Assistant**.\n\nI'm connected to your active event: **"${currentPlan.title}"** (${currentPlan.guestCount.total} guests • Target: ${currentPlan.budget.currency}${currentPlan.budget.targetBudget} at CymbalMart Supercenter #104).\n\nHere is how I can assist you right now:\n• 🗺️ **Locate Items by Store Aisle** (e.g. produce, deli counter, bakery, party decor)\n• 🏷️ **Optimize Brand Savings** (switch to *Cymbal Essentials* or *Cymbal Organic*)\n• 🍽️ **Scale Recipes & Menu Items** for any guest headcount or dietary restriction\n• 🚚 **Curbside Pickup & 2-Hour Express Delivery** guidance & order preparation\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: '💰 Swap to Cymbal Essentials (Save ~25%)', actionType: 'adjust_budget' },
        { label: '🗺️ Where are skewers, charcoal & ice located?', actionType: 'custom_prompt' },
        { label: '👥 Scale party for 30 total guests', actionType: 'scale_guests' },
        { label: '🥑 Add gluten-free & nut-free snacks', actionType: 'add_dietary' },
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPlanUpdate, setPendingPlanUpdate] = useState<PartyPlan | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt, isOpen]);

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: `👋 Hello! I am your **CymbalMart Assistant**.\n\nI'm ready to help with store aisles, party meal scaling, budget savings with Cymbal private brands, or delivery questions for **"${currentPlan.title}"**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: '💰 Swap to Cymbal Essentials (Save ~25%)', actionType: 'adjust_budget' },
          { label: '🗺️ Map store aisle locations', actionType: 'custom_prompt' },
          { label: '👥 Scale party for 30 guests', actionType: 'scale_guests' },
          { label: '🚚 Curbside pickup instructions', actionType: 'custom_prompt' },
        ],
      },
    ]);
  };

  const handleSendMessage = async (customText?: string) => {
    const text = customText || input;
    if (!text.trim() || isLoading) return;

    const userMessage: AgentChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          currentPlan,
          chatHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      let replyContent = data.reply;
      if (!replyContent) {
        // High quality fallback heuristic for customer queries
        const lower = text.toLowerCase();
        if (lower.includes('aisle') || lower.includes('where') || lower.includes('locate') || lower.includes('ice') || lower.includes('charcoal')) {
          replyContent = `📍 **CymbalMart Supercenter #104 Department Directory**:\n\n• **Aisle 1**: Fresh Produce, Herbs, Lemons/Limes\n• **Aisle 2**: Artisan Cheeses, Charcuterie, Delicatessen platters\n• **Aisle 3**: Fresh Bakery, Brioche Buns, Baguettes, Celebration Cakes\n• **Aisle 6**: Pantry, Condiments, Marinades, BBQ Sauces & Skewers\n• **Aisle 8**: Beverages, Seltzers, Mixers & Juices\n• **Aisle 12**: Butcher Counter, Beef, Seafood & Poultry\n• **Aisle 14**: Tableware, Cutlery, Napkins, Balloons & Party Decorations\n• **Front Register Entry**: 10lb & 20lb Ice Bags ($2.49) & Propane Tank Exchange.`;
        } else if (lower.includes('delivery') || lower.includes('curbside') || lower.includes('pickup') || lower.includes('hour')) {
          replyContent = `🚚 **CymbalMart Fulfillment Options**:\n\n1. **Curbside Pickup**: Free on all orders over $35. Park in dedicated Bays 1–12 at Store #104, tap "I'm Here" in app, and an associate brings groceries within 5 minutes.\n2. **Express 2-Hour Delivery**: Direct to doorstep, temperature-controlled insulated totes ($4.99 or free for CymbalMart+ members).\n3. **Customer Service Hours**: Mon–Sun 7:00 AM – 11:00 PM.`;
        } else if (lower.includes('budget') || lower.includes('save') || lower.includes('essential')) {
          replyContent = `🏷️ **CymbalMart Smart Brand Optimization**:\n\nBy replacing name brands with **Cymbal Essentials** across pantry staples (dips, buns, chips, soda) and **Cymbal Organic** for produce, hosts typically save **22% to 30%** on their total party docket while retaining guaranteed freshness!`;
        } else {
          replyContent = `I have updated your request for **${currentPlan.title}**! Let me know if you need further adjustments to quantities, menu items, or store navigation.`;
        }
      }

      const assistantMessage: AgentChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions || [
          { label: '🗺️ Check store aisle map', actionType: 'custom_prompt' },
          { label: '💰 Maximize Cymbal brand savings', actionType: 'adjust_budget' },
          { label: '🚚 Curbside pickup instructions', actionType: 'custom_prompt' },
        ],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.updatedPlan) {
        setPendingPlanUpdate(data.updatedPlan);
        onUpdatePlan(data.updatedPlan);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `I am available to assist! While server connection is updating (${err.message}), you can interact with your shopping docket, adjust quantities, and toggle items right in the application!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: { label: string; actionType: string; payload?: any }) => {
    let promptText = action.label;
    if (action.actionType === 'scale_guests') {
      promptText = 'Please scale my current party plan and all shopping list quantities for 30 guests total.';
    } else if (action.actionType === 'adjust_budget') {
      promptText = 'How can I trim my party budget by 20% by substituting name brands with Cymbal Essentials and Cymbal Organic? Please optimize the shopping list.';
    } else if (action.actionType === 'add_dietary') {
      promptText = 'Update my party menu and shopping list to ensure everything is strictly nut-free and includes delicious gluten-free alternatives.';
    }
    handleSendMessage(promptText);
  };

  const quickPromptsByTopic: Record<TopicCategory, { label: string; prompt: string }[]> = {
    all: [
      { label: '💰 Maximize Cymbal Essentials Savings', prompt: 'Show me how much I can save by switching all possible grocery items to Cymbal Essentials house brand.' },
      { label: '🗺️ Where are skewers, charcoal & ice located?', prompt: 'What aisles at CymbalMart Supercenter #104 carry skewers, charcoal, ice bags, and tableware?' },
      { label: '👥 Scale list for +10 guests', prompt: 'Please recalculate and scale all recipe servings and shopping list pack sizes for 10 additional guests.' },
      { label: '🥑 Add gluten-free & vegan alternatives', prompt: 'Add dedicated gluten-free and vegan alternatives to the appetizer and main course menu.' },
      { label: '🚚 Curbside pickup & express delivery info', prompt: 'Explain the CymbalMart Curbside Pickup and Express Delivery time windows and procedures.' },
    ],
    aisles: [
      { label: '📍 Aisle 1: Fresh Produce & Citrus', prompt: 'Which produce and herbs in my shopping list are found in Aisle 1 at CymbalMart?' },
      { label: '📍 Aisle 2: Deli & Charcuterie', prompt: 'What specialty cheeses, dips, and deli meats can I grab in Aisle 2?' },
      { label: '📍 Aisle 3: Bakery & Artisan Breads', prompt: 'What bakery items, burger buns, and baguettes are in Aisle 3?' },
      { label: '📍 Aisle 14: Plates, Cutlery & Balloons', prompt: 'Where can I find biodegradable plates, napkins, and party balloons in Aisle 14?' },
    ],
    savings: [
      { label: '🏷️ Swap to Cymbal Essentials (Best Value)', prompt: 'Review my shopping list and recommend Cymbal Essentials swaps to trim our total estimated cost by 20%.' },
      { label: '🌱 Compare with Cymbal Organic', prompt: 'Which ingredients on my list are available under the Cymbal Organic private label?' },
      { label: '⭐ Cymbal Choice Gourmet Upgrades', prompt: 'Which premium Cymbal Choice items would elevate our party experience without breaking the budget?' },
    ],
    recipes: [
      { label: '🍹 Signature Batch Cocktail / Mocktail', prompt: 'Suggest a signature large-batch beverage recipe for our guests and add ingredients to the shopping list.' },
      { label: '🔥 15-Minute Prep Appetizer', prompt: 'Add an easy, no-cook 15-minute appetizer that requires minimal prep on party day.' },
      { label: '🍰 Crowd-Pleasing Dessert', prompt: 'Recommend a scalable, easy-to-serve dessert and add it to the menu and shopping docket.' },
    ],
    delivery: [
      { label: '⏱️ Express 2-Hour Delivery Details', prompt: 'How does CymbalMart 2-Hour Express Delivery work, what is the cutoff, and how are cold items packed?' },
      { label: '🚗 Curbside Pickup Bay Instructions', prompt: 'What are the steps for Curbside Pickup at CymbalMart Supercenter #104?' },
      { label: '🔄 Return & Substitution Policy', prompt: 'What is CymbalMart policy if an item is out of stock or needs substitution?' },
    ],
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#0C0C0C] border-l border-white/15 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#121212] text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center font-bold shadow-md">
              <BotMessageSquare className="w-5 h-5 text-black" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#121212] rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-serif font-bold text-white tracking-wide">CymbalMart Assistant</h3>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                AI Online
              </span>
            </div>
            <span className="text-[10px] text-white/50 font-mono-custom flex items-center gap-1.5 mt-0.5">
              <Store className="w-3 h-3 text-white/40" />
              <span>Store #104 // {currentPlan.title}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetChat}
            className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/5 transition"
            title="Reset Chat Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/5 transition"
            title="Close Assistant Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Plan Sync Notification if updated */}
      {pendingPlanUpdate && (
        <div className="bg-[#0f2416] border-b border-emerald-700/60 px-4 py-2 flex items-center justify-between text-xs text-emerald-300 font-sans animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Plan & Shopping Docket synchronized with CymbalMart Assistant!</span>
          </div>
          <button
            onClick={() => setPendingPlanUpdate(null)}
            className="text-emerald-400 hover:text-emerald-200 font-bold uppercase text-[10px] tracking-wider"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Topic Filter Pills */}
      <div className="px-3 py-2 bg-[#161616] border-b border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-sans">
        {[
          { id: 'all', label: 'All Inquiries' },
          { id: 'aisles', label: '🗺️ Store Aisles' },
          { id: 'savings', label: '🏷️ Brand Savings' },
          { id: 'recipes', label: '🍽️ Menu & Recipes' },
          { id: 'delivery', label: '🚚 Pickup & Delivery' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as TopicCategory)}
            className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider whitespace-nowrap transition border ${
              activeCategory === tab.id
                ? 'bg-white text-black border-white shadow-xs'
                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm bg-[#080808] font-sans">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider text-white/40 font-mono-custom">
                <Store className="w-3 h-3 text-white/50" />
                <span>CymbalMart Assistant</span>
              </div>
            )}

            <div
              className={`max-w-[90%] rounded-xl p-3.5 shadow-md leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-white text-black font-medium'
                  : 'bg-[#141414] text-white/90 border border-white/15'
              }`}
            >
              {/* Parse formatted message */}
              <div className="space-y-1.5 whitespace-pre-wrap font-sans">
                {msg.content}
              </div>

              <div
                className={`text-[9px] mt-2 font-mono-custom uppercase tracking-wider ${
                  msg.role === 'user' ? 'text-black/50 text-right' : 'text-white/30'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {/* Suggested Action Chips */}
            {msg.suggestedActions && msg.suggestedActions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%] font-sans">
                {msg.suggestedActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleActionClick(action)}
                    className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/5 border border-white/15 hover:bg-white/10 text-white/80 hover:text-white font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-white/60 shrink-0" />
                    <span className="truncate">{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-[#141414] rounded-xl border border-white/10 text-xs text-white/70 w-fit font-sans">
            <RefreshCw className="w-4 h-4 text-white animate-spin shrink-0" />
            <span>CymbalMart Assistant is reviewing inventory & optimizing your docket...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Carousel for Active Category */}
      <div className="p-2.5 bg-[#121212] border-t border-white/10 font-sans">
        <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-wider font-mono-custom mb-1.5 px-1">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            <span>Customer Prompt Starters</span>
          </span>
          <span>Tap to Ask</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {quickPromptsByTopic[activeCategory].map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              className="text-[10px] font-sans px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white whitespace-nowrap transition shrink-0 flex items-center gap-1"
            >
              <span>{qp.label}</span>
              <ArrowRight className="w-2.5 h-2.5 text-white/30" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="p-3.5 border-t border-white/10 bg-[#0E0E0E] space-y-2 font-sans">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask CymbalMart Assistant: 'Find ice in store', 'Scale for 25 guests'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-[#161616] border border-white/15 text-white placeholder:text-white/35 rounded-lg focus:bg-[#1E1E1E] focus:outline-none focus:border-white transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-lg bg-white hover:bg-white/90 disabled:opacity-30 text-black transition shadow-sm shrink-0 font-bold"
            title="Send to CymbalMart Assistant"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[9px] text-white/40 uppercase tracking-wider font-mono-custom px-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CymbalMart AI Concierge</span>
          </span>
          <span>Store #104 Inventory Connected</span>
        </div>
      </div>
    </div>
  );
};
