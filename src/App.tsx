import React, { useState, useEffect } from 'react';
import { PartyPlan, ShoppingItem } from './types';
import { loadSavedPartyPlans, savePartyPlans, loadActivePartyId, saveActivePartyId } from './utils/storage';
import { recalculatePartyBudget } from './utils/budget';
import { useVoiceControl } from './hooks/useVoiceControl';
import { voiceSpeech } from './utils/voiceSpeech';
import { Header } from './components/Header';
import { BlueprintOverview } from './components/BlueprintOverview';
import { ShoppingListSection } from './components/ShoppingListSection';
import { MenuAndRecipesSection } from './components/MenuAndRecipesSection';
import { BudgetAndLogisticsSection } from './components/BudgetAndLogisticsSection';
import { PrepTimelineSection } from './components/PrepTimelineSection';
import { AgentChatDrawer } from './components/AgentChatDrawer';
import { NewPartyModal } from './components/NewPartyModal';
import { ExportModal } from './components/ExportModal';
import { CheckoutModal } from './components/CheckoutModal';
import { VoiceControlBar } from './components/VoiceControlBar';
import { BotMessageSquare, Sparkles, Plus, Copy, Trash2 } from 'lucide-react';

export default function App() {
  const [plans, setPlans] = useState<PartyPlan[]>(() => loadSavedPartyPlans());
  const [activePlanId, setActivePlanId] = useState<string>(() => loadActivePartyId());
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Modals & Drawers
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);
  const [isGeneratingVoicePlan, setIsGeneratingVoicePlan] = useState(false);

  // Sync to local storage
  useEffect(() => {
    savePartyPlans(plans);
  }, [plans]);

  useEffect(() => {
    saveActivePartyId(activePlanId);
  }, [activePlanId]);

  // Find active plan
  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0];

  // Helper to update active plan in state
  const handleUpdateActivePlan = (updated: PartyPlan) => {
    setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // Switch active plan
  const handleSelectPlan = (planId: string) => {
    setActivePlanId(planId);
  };

  // Create new plan
  const handlePlanCreated = (newPlan: PartyPlan) => {
    setPlans((prev) => [newPlan, ...prev]);
    setActivePlanId(newPlan.id);
    setActiveTab('overview');
  };

  // Create Party via Spoken Voice Command
  const handleCreatePartyFromVoice = async (params: any) => {
    setIsGeneratingVoicePlan(true);
    try {
      const res = await fetch('/api/gemini/generate-party-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data?.plan) {
        const newPlan = {
          ...data.plan,
          id: `party_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        handlePlanCreated(newPlan);
        voiceSpeech.speak(
          `Created party blueprint for ${newPlan.title} with ${newPlan.guestCount.total} guests and ${newPlan.shoppingList.length} shopping items ready.`
        );
      }
    } catch (err) {
      console.warn('Voice plan generation error:', err);
    } finally {
      setIsGeneratingVoicePlan(false);
    }
  };

  // Toggle Shopping Item Checked
  const handleToggleShoppingItem = (itemId: string) => {
    if (!activePlan) return;
    const updatedList = activePlan.shoppingList.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    handleUpdateActivePlan({
      ...activePlan,
      shoppingList: updatedList,
      updatedAt: new Date().toISOString(),
    });
  };

  // Update Existing Shopping Item (e.g. quantity, price, brand tier, name, aisle)
  const handleUpdateShoppingItem = (itemId: string, updatedFields: Partial<ShoppingItem>) => {
    if (!activePlan) return;
    const updatedList = activePlan.shoppingList.map((item) =>
      item.id === itemId ? { ...item, ...updatedFields } : item
    );
    const updatedPlan = recalculatePartyBudget(activePlan, updatedList);
    handleUpdateActivePlan(updatedPlan);
  };

  // Bulk Update Shopping Items (e.g. swap all to Cymbal Essentials)
  const handleBulkUpdateShoppingItems = (updatedList: ShoppingItem[]) => {
    if (!activePlan) return;
    const updatedPlan = recalculatePartyBudget(activePlan, updatedList);
    handleUpdateActivePlan(updatedPlan);
  };

  // Add Custom Shopping Item
  const handleAddShoppingItem = (itemData: Omit<ShoppingItem, 'id' | 'checked'>) => {
    if (!activePlan) return;
    const newItem: ShoppingItem = {
      ...itemData,
      id: `custom_${Date.now()}`,
      checked: false,
    };
    const updatedList = [newItem, ...activePlan.shoppingList];
    const updatedPlan = recalculatePartyBudget(activePlan, updatedList);
    handleUpdateActivePlan(updatedPlan);
  };

  // Delete Shopping Item
  const handleDeleteShoppingItem = (itemId: string) => {
    if (!activePlan) return;
    const updatedList = activePlan.shoppingList.filter((i) => i.id !== itemId);
    const updatedPlan = recalculatePartyBudget(activePlan, updatedList);
    handleUpdateActivePlan(updatedPlan);
  };

  // Check / Uncheck All
  const handleCheckAllShopping = (status: boolean) => {
    if (!activePlan) return;
    const updatedList = activePlan.shoppingList.map((i) => ({ ...i, checked: status }));
    handleUpdateActivePlan({
      ...activePlan,
      shoppingList: updatedList,
      updatedAt: new Date().toISOString(),
    });
  };

  // Trigger AI Chat with specific prompt
  const handleOpenAiWithPrompt = (prompt?: string) => {
    setChatInitialPrompt(prompt);
    setIsChatOpen(true);
  };

  // Voice Control hook
  const voiceControl = useVoiceControl({
    currentPlan: activePlan,
    activeTab,
    setActiveTab,
    onAddItem: handleAddShoppingItem,
    onToggleItem: handleToggleShoppingItem,
    onDeleteItem: handleDeleteShoppingItem,
    onCheckAll: handleCheckAllShopping,
    onBulkUpdateItems: handleBulkUpdateShoppingItems,
    onOpenNewPartyModal: () => setIsNewModalOpen(true),
    onCreatePartyFromVoice: handleCreatePartyFromVoice,
    onOpenCheckout: () => setIsCheckoutModalOpen(true),
    onCloseCheckout: () => setIsCheckoutModalOpen(false),
    isCheckoutOpen: isCheckoutModalOpen,
    onOpenAiChat: handleOpenAiWithPrompt,
  });

  // Duplicate current plan
  const handleDuplicatePlan = () => {
    if (!activePlan) return;
    const duplicated: PartyPlan = {
      ...activePlan,
      id: `party_copy_${Date.now()}`,
      title: `${activePlan.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPlans((prev) => [duplicated, ...prev]);
    setActivePlanId(duplicated.id);
  };

  // Delete current plan
  const handleDeletePlan = () => {
    if (plans.length <= 1) {
      alert('You must have at least one party plan saved.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${activePlan.title}"?`)) {
      const remaining = plans.filter((p) => p.id !== activePlan.id);
      setPlans(remaining);
      setActivePlanId(remaining[0].id);
    }
  };

  if (!activePlan) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Sparkles className="w-8 h-8 text-white/60 mx-auto animate-spin" />
          <h2 className="text-lg font-serif italic text-white/90">Curating Party Blueprint...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col antialiased selection:bg-white selection:text-black pb-28">
      {/* Top Navigation & App Bar */}
      <Header
        partyPlans={plans}
        activePlan={activePlan}
        onSelectPlan={handleSelectPlan}
        onOpenNewPartyModal={() => setIsNewModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isVoiceListening={voiceControl.isListening}
        isHandsFree={voiceControl.isHandsFree}
        onToggleVoice={voiceControl.toggleListening}
      />

      {/* Voice Generating Party Overlay banner */}
      {isGeneratingVoicePlan && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-4 py-2.5 text-center text-xs text-emerald-200 flex items-center justify-center gap-2 animate-pulse">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Generating full AI Party Blueprint from voice request...</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <BlueprintOverview
            plan={activePlan}
            onNavigateToShopping={() => setActiveTab('shopping')}
            onOpenAiChat={handleOpenAiWithPrompt}
            onOpenNewPartyModal={() => setIsNewModalOpen(true)}
            onOpenCheckout={() => setIsCheckoutModalOpen(true)}
          />
        )}

        {activeTab === 'shopping' && (
          <ShoppingListSection
            items={activePlan.shoppingList}
            currency={activePlan.budget.currency}
            targetBudget={activePlan.budget.targetBudget}
            onToggleItem={handleToggleShoppingItem}
            onAddItem={handleAddShoppingItem}
            onUpdateItem={handleUpdateShoppingItem}
            onBulkUpdateItems={handleBulkUpdateShoppingItems}
            onDeleteItem={handleDeleteShoppingItem}
            onCheckAll={handleCheckAllShopping}
            onOpenAiChat={handleOpenAiWithPrompt}
            onOpenCheckout={() => setIsCheckoutModalOpen(true)}
          />
        )}

        {activeTab === 'menu' && (
          <MenuAndRecipesSection
            plan={activePlan}
            currency={activePlan.budget.currency}
            onOpenAiChat={handleOpenAiWithPrompt}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetAndLogisticsSection
            plan={activePlan}
            currency={activePlan.budget.currency}
            onOpenAiChat={handleOpenAiWithPrompt}
          />
        )}

        {activeTab === 'timeline' && (
          <PrepTimelineSection
            plan={activePlan}
            onOpenAiChat={handleOpenAiWithPrompt}
          />
        )}
      </main>

      {/* Bottom Sub-bar with Plan Utilities */}
      <footer className="bg-[#0D0D0D] border-t border-white/10 py-4 mt-auto mb-16 sm:mb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white/80 uppercase tracking-wider text-[11px]">ACTIVE ISSUE: {activePlan.title}</span>
            <span className="text-white/20">•</span>
            <span className="text-white/40">EST. {new Date(activePlan.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDuplicatePlan}
              className="flex items-center gap-1.5 px-3 py-1 rounded border border-white/10 hover:border-white/30 text-white/70 hover:text-white hover:bg-white/5 transition text-[11px] uppercase tracking-wider"
              title="Make a copy of this plan"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate Issue</span>
            </button>
            {plans.length > 1 && (
              <button
                onClick={handleDeletePlan}
                className="flex items-center gap-1.5 px-3 py-1 rounded border border-white/10 hover:border-rose-500/40 text-white/50 hover:text-rose-400 hover:bg-rose-950/30 transition text-[11px] uppercase tracking-wider"
                title="Delete this party plan"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Archive Plan</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Floating Hands-Free Voice Control Dock */}
      <VoiceControlBar
        isSupported={voiceControl.isSupported}
        isListening={voiceControl.isListening}
        isSpeaking={voiceControl.isSpeaking}
        isHandsFree={voiceControl.isHandsFree}
        isMuted={voiceControl.isMuted}
        transcript={voiceControl.transcript}
        interimTranscript={voiceControl.interimTranscript}
        lastActionResponse={voiceControl.lastActionResponse}
        errorMessage={voiceControl.errorMessage}
        onToggleListening={voiceControl.toggleListening}
        onToggleHandsFree={voiceControl.toggleHandsFree}
        onToggleMute={voiceControl.toggleMute}
        onExecuteCommand={voiceControl.executeVoiceCommand}
      />

      {/* Floating CymbalMart Assistant Chatbot Trigger Button (when chat is closed) */}
      {!isChatOpen && (
        <button
          id="cymbalmart-assistant-floating-btn"
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-24 right-4 sm:right-6 z-30 flex items-center gap-2.5 px-4 py-3 rounded-full bg-white text-black font-sans text-xs font-bold shadow-2xl hover:bg-neutral-100 hover:scale-105 transition-all active:scale-95 border-2 border-white/80 group"
          title="Open CymbalMart Assistant Chatbot"
        >
          <div className="relative flex items-center justify-center">
            <BotMessageSquare className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-[11px] font-bold tracking-tight uppercase">CymbalMart Assistant</span>
            <span className="text-[9px] text-black/60 font-mono -mt-0.5">Store & Party AI</span>
          </div>
        </button>
      )}

      {/* AI Assistant Chat Drawer */}
      <AgentChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentPlan={activePlan}
        onUpdatePlan={handleUpdateActivePlan}
        initialPrompt={chatInitialPrompt}
        onClearInitialPrompt={() => setChatInitialPrompt(undefined)}
      />

      {/* New Party Modal */}
      <NewPartyModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onPlanCreated={handlePlanCreated}
      />

      {/* Export & Share Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        plan={activePlan}
      />

      {/* CymbalMart Instant Checkout & Fulfillment Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        plan={activePlan}
        onUpdatePlan={handleUpdateActivePlan}
      />
    </div>
  );
}

