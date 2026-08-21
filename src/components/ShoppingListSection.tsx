import React, { useState, useMemo } from 'react';
import { ShoppingItem, ProductCategory, CymbalBrandTier } from '../types';
import {
  ShoppingBag,
  Store,
  Layers,
  Search,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  Tag,
  DollarSign,
  Filter,
  CheckCheck,
  RotateCcw,
  ExternalLink,
  Compass,
  ArrowRight,
  TrendingDown,
  AlertCircle,
  ShieldAlert,
  HelpCircle,
  Check,
  Truck,
  BotMessageSquare,
  Edit2,
  Minus,
  Save,
  X,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShoppingListSectionProps {
  items: ShoppingItem[];
  currency: string;
  targetBudget: number;
  onToggleItem: (itemId: string) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
  onUpdateItem?: (itemId: string, updatedFields: Partial<ShoppingItem>) => void;
  onBulkUpdateItems?: (updatedList: ShoppingItem[]) => void;
  onDeleteItem: (itemId: string) => void;
  onCheckAll: (status: boolean) => void;
  onOpenAiChat: (prompt?: string) => void;
  onOpenCheckout?: () => void;
}

export const ShoppingListSection: React.FC<ShoppingListSectionProps> = ({
  items,
  currency,
  targetBudget,
  onToggleItem,
  onAddItem,
  onUpdateItem,
  onBulkUpdateItems,
  onDeleteItem,
  onCheckAll,
  onOpenAiChat,
  onOpenCheckout,
}) => {
  const [viewMode, setViewMode] = useState<'aisle' | 'category' | 'store'>('aisle');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unbought' | 'bought'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrandTier, setSelectedBrandTier] = useState<string>('all');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Editing state for Full Edit Modal
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  // Inline Quick Price Edit state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPriceInput, setTempPriceInput] = useState<string>('');

  // New Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ProductCategory>('Pantry & Dry Goods');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('pack');
  const [newItemPrice, setNewItemPrice] = useState(4.99);
  const [newItemStore, setNewItemStore] = useState('CymbalMart Supercenter #104');
  const [newItemAisle, setNewItemAisle] = useState('Aisle 6 - Pantry & Snacks');
  const [newItemBrandTier, setNewItemBrandTier] = useState<CymbalBrandTier>('Cymbal Essentials');
  const [newItemDept, setNewItemDept] = useState('Grocery');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [newItemDietary, setNewItemDietary] = useState('');

  // Calculations
  const totalEstimated = useMemo(
    () => items.reduce((acc, item) => acc + (Number(item.estimatedPrice) || 0), 0),
    [items]
  );
  const boughtTotal = useMemo(
    () =>
      items
        .filter((i) => i.checked)
        .reduce((acc, item) => acc + (Number(item.estimatedPrice) || 0), 0),
    [items]
  );
  const remainingTotal = Math.max(0, totalEstimated - boughtTotal);
  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const percentBought = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const isOverBudget = totalEstimated > targetBudget;
  const budgetDifference = Math.abs(targetBudget - totalEstimated);
  const budgetPercentUsed =
    targetBudget > 0 ? Math.round((totalEstimated / targetBudget) * 100) : 100;

  // National Brand count for bulk swap savings
  const nationalBrandCount = useMemo(
    () => items.filter((i) => i.brandTier === 'National Brand').length,
    [items]
  );

  // Trigger celebratory confetti if 100% completed
  const handleToggle = (itemId: string, currentStatus: boolean) => {
    onToggleItem(itemId);
    if (!currentStatus && checkedCount + 1 === totalCount && totalCount > 0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Step quantity with proportional price recalculation
  const handleQuantityStep = (item: ShoppingItem, delta: number) => {
    const currentQty = Math.max(1, item.quantityNeeded || 1);
    const newQty = Math.max(1, currentQty + delta);
    if (newQty === currentQty) return;

    const unitPrice = item.estimatedPrice / currentQty;
    const newPrice = Math.round(unitPrice * newQty * 100) / 100;

    if (onUpdateItem) {
      onUpdateItem(item.id, {
        quantityNeeded: newQty,
        estimatedPrice: newPrice,
      });
    }
  };

  // Quick brand tier toggle (switch to Cymbal Essentials for ~25% discount, or upgrade)
  const handleBrandTierSwap = (item: ShoppingItem, newTier: CymbalBrandTier) => {
    let newPrice = item.estimatedPrice;
    if (item.brandTier !== 'Cymbal Essentials' && newTier === 'Cymbal Essentials') {
      newPrice = Math.round(item.estimatedPrice * 0.75 * 100) / 100;
    } else if (item.brandTier === 'Cymbal Essentials' && newTier === 'National Brand') {
      newPrice = Math.round((item.estimatedPrice / 0.75) * 100) / 100;
    }

    if (onUpdateItem) {
      onUpdateItem(item.id, {
        brandTier: newTier,
        estimatedPrice: newPrice,
      });
    }
  };

  // Inline Quick Price Edit
  const handleStartPriceEdit = (item: ShoppingItem) => {
    setEditingPriceId(item.id);
    setTempPriceInput(item.estimatedPrice.toFixed(2));
  };

  const handleSavePriceEdit = (itemId: string) => {
    const val = parseFloat(tempPriceInput);
    if (!isNaN(val) && val >= 0 && onUpdateItem) {
      onUpdateItem(itemId, {
        estimatedPrice: Math.round(val * 100) / 100,
      });
    }
    setEditingPriceId(null);
  };

  // Bulk Swap all National Brands to Cymbal Essentials (Save 25%)
  const handleOptimizeAllToCymbalEssentials = () => {
    const updated = items.map((item) => {
      if (item.brandTier === 'National Brand') {
        return {
          ...item,
          brandTier: 'Cymbal Essentials' as CymbalBrandTier,
          estimatedPrice: Math.round(item.estimatedPrice * 0.75 * 100) / 100,
        };
      }
      return item;
    });

    if (onBulkUpdateItems) {
      onBulkUpdateItems(updated);
    } else if (onUpdateItem) {
      updated.forEach((u) => onUpdateItem(u.id, u));
    }
  };

  // Submit Full Item Edit Modal
  const handleSaveItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !onUpdateItem) return;

    onUpdateItem(editingItem.id, {
      name: editingItem.name,
      category: editingItem.category,
      quantityNeeded: Number(editingItem.quantityNeeded) || 1,
      unit: editingItem.unit,
      estimatedPrice: Math.round((Number(editingItem.estimatedPrice) || 0) * 100) / 100,
      aisle: editingItem.aisle,
      brandTier: editingItem.brandTier,
      suggestedStore: editingItem.suggestedStore,
      notes: editingItem.notes,
      dietaryTag: editingItem.dietaryTag,
    });

    setEditingItem(null);
  };

  // Submit Add New Custom Item
  const handleAddNewItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddItem({
      name: newItemName.trim(),
      category: newItemCategory,
      quantityNeeded: Number(newItemQty) || 1,
      unit: newItemUnit || 'pack',
      estimatedPrice: Math.round((Number(newItemPrice) || 0) * 100) / 100,
      suggestedStore: newItemStore || 'CymbalMart Supercenter #104',
      department: newItemDept || 'Grocery',
      aisle: newItemAisle || 'Aisle 1 - General Store',
      brandTier: newItemBrandTier,
      notes: newItemNotes.trim() || undefined,
      dietaryTag: newItemDietary.trim() || undefined,
      isCustom: true,
    });

    // Reset Form
    setNewItemName('');
    setNewItemPrice(4.99);
    setNewItemQty(1);
    setNewItemNotes('');
    setNewItemDietary('');
    setIsAddingItem(false);
  };

  const categoriesList: ProductCategory[] = [
    'Produce',
    'Meat & Seafood',
    'Plant Protein',
    'Dairy & Deli',
    'Bakery & Bread',
    'Pantry & Dry Goods',
    'Beverages & Mixers',
    'Alcohol',
    'Ice',
    'Tableware & Disposables',
    'Decorations & Balloons',
    'Miscellaneous',
  ];

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.suggestedStore && item.suggestedStore.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.aisle && item.aisle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        filterStatus === 'all' ? true : filterStatus === 'unbought' ? !item.checked : item.checked;

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesBrandTier = selectedBrandTier === 'all' || item.brandTier === selectedBrandTier;

      return matchesSearch && matchesStatus && matchesCategory && matchesBrandTier;
    });
  }, [items, searchQuery, filterStatus, selectedCategory, selectedBrandTier]);

  // Group by Aisle
  const groupedByAisle = useMemo<Record<string, ShoppingItem[]>>(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    filteredItems.forEach((item) => {
      const aisleKey = item.aisle || 'Aisle 1 - General Store';
      if (!groups[aisleKey]) groups[aisleKey] = [];
      groups[aisleKey].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Group by Category
  const groupedByCategory = useMemo<Record<string, ShoppingItem[]>>(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Group by Store
  const groupedByStore = useMemo<Record<string, ShoppingItem[]>>(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    filteredItems.forEach((item) => {
      const storeKey = item.suggestedStore || 'CymbalMart Supercenter #104';
      if (!groups[storeKey]) {
        groups[storeKey] = [];
      }
      groups[storeKey].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Brand Tier Badge with interactive switcher
  const renderBrandTierSelector = (item: ShoppingItem) => {
    const tier = item.brandTier || 'Cymbal Essentials';
    let badgeClass = 'bg-white/10 text-white/70 border-white/20';
    if (tier === 'Cymbal Essentials') {
      badgeClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 font-semibold';
    } else if (tier === 'Cymbal Organic') {
      badgeClass = 'bg-lime-950/80 text-lime-300 border-lime-700/60 font-semibold';
    } else if (tier === 'Cymbal Choice') {
      badgeClass = 'bg-amber-950/80 text-amber-300 border-amber-700/60 font-semibold';
    } else if (tier === 'National Brand') {
      badgeClass = 'bg-stone-900 text-stone-300 border-stone-700';
    }

    return (
      <div className="inline-flex items-center gap-1">
        <select
          value={tier}
          onChange={(e) => handleBrandTierSwap(item, e.target.value as CymbalBrandTier)}
          className={`text-[10px] px-2 py-0.5 rounded border ${badgeClass} cursor-pointer hover:opacity-90 focus:outline-none font-sans`}
          title="Change brand tier to update price & budget"
        >
          <option value="Cymbal Essentials">Cymbal Essentials (-25%)</option>
          <option value="Cymbal Organic">Cymbal Organic</option>
          <option value="Cymbal Choice">Cymbal Choice</option>
          <option value="National Brand">National Brand</option>
        </select>
      </div>
    );
  };

  // Reusable Shopping Item Row
  const renderItemRow = (item: ShoppingItem, showAisleTag = false) => {
    const isEditingThisPrice = editingPriceId === item.id;

    return (
      <div
        key={item.id}
        className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition rounded-md group ${
          item.checked ? 'opacity-40 bg-black/30' : ''
        }`}
      >
        {/* Left Side: Checkbox & Info */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <button
            onClick={() => handleToggle(item.id, item.checked)}
            className="mt-0.5 p-1 text-white/60 hover:text-white transition shrink-0"
            title={item.checked ? 'Mark as needed' : 'Mark as acquired'}
          >
            {item.checked ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Circle className="w-5 h-5 text-white/30" />
            )}
          </button>

          <div className="min-w-0 space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  item.checked ? 'line-through text-white/50' : 'text-white'
                }`}
              >
                {item.name}
              </span>
              {renderBrandTierSelector(item)}
              {showAisleTag && item.aisle && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/60 font-mono border border-white/10">
                  {item.aisle}
                </span>
              )}
              {item.dietaryTag && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-sans border border-emerald-500/30">
                  {item.dietaryTag}
                </span>
              )}
              {item.isCustom && (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/10 text-white/60 uppercase font-bold tracking-wider font-mono">
                  Custom
                </span>
              )}
            </div>

            <div className="text-xs text-white/50 font-sans flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Qty:</span>
                {/* Stepper */}
                <button
                  onClick={() => handleQuantityStep(item, -1)}
                  disabled={item.quantityNeeded <= 1}
                  className="p-0.5 rounded hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20 transition"
                  title="Decrease quantity (auto-recalculates price)"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-bold text-white font-mono min-w-[1.2rem] text-center">
                  {item.quantityNeeded}
                </span>
                <button
                  onClick={() => handleQuantityStep(item, 1)}
                  className="p-0.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition"
                  title="Increase quantity (auto-recalculates price)"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <span className="text-white/60 text-[11px]">{item.unit}</span>
              </div>

              {item.packSizeSuggestion && (
                <>
                  <span>•</span>
                  <span>{item.packSizeSuggestion}</span>
                </>
              )}
              {item.notes && (
                <>
                  <span>•</span>
                  <span className="italic text-white/40">{item.notes}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Price & Edit Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 font-mono text-xs pl-8 sm:pl-0">
          {/* Price Editor */}
          {isEditingThisPrice ? (
            <div className="flex items-center gap-1 bg-[#1a1a1a] p-1 rounded border border-white/30">
              <span className="text-white/60 text-xs">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tempPriceInput}
                onChange={(e) => setTempPriceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSavePriceEdit(item.id);
                  if (e.key === 'Escape') setEditingPriceId(null);
                }}
                className="w-16 bg-transparent text-white font-mono text-xs px-1 focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => handleSavePriceEdit(item.id)}
                className="p-1 rounded bg-white text-black hover:bg-white/90"
                title="Save Price"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={() => setEditingPriceId(null)}
                className="p-1 text-white/40 hover:text-white"
                title="Cancel"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleStartPriceEdit(item)}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-white font-medium text-sm transition group/price"
              title="Click to quickly edit price (auto-recalculates budget)"
            >
              <span>${(Number(item.estimatedPrice) || 0).toFixed(2)}</span>
              <Edit2 className="w-2.5 h-2.5 text-white/30 opacity-0 group-hover/price:opacity-100 transition-opacity" />
            </button>
          )}

          {/* Full Edit Modal Trigger */}
          <button
            onClick={() => setEditingItem(item)}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition"
            title="Edit item details, brand, department, and notes"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Item */}
          <button
            onClick={() => onDeleteItem(item.id)}
            className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-950/30 rounded transition"
            title="Remove item from shopping list (auto-recalculates budget)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Real-Time Budget Health & Alignment */}
      <div className="bg-[#111111] border border-white/15 rounded-lg p-5 sm:p-6 shadow-md space-y-4 font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                Procurement Health
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Recalculation Active
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide mt-1">
              Party Shopping Docket
            </h3>
            <p className="text-xs text-white/50 font-sans mt-0.5">
              Updates to quantities, prices, or brand tiers automatically recalculate your total spending in real time.
            </p>
          </div>

          {/* Financial Snapshot */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <div className="bg-black/50 border border-white/10 px-3 py-2 rounded-lg">
              <span className="text-white/40 block text-[10px] uppercase font-sans tracking-wider">Target Budget</span>
              <span className="text-white text-base font-medium">${targetBudget.toFixed(2)}</span>
            </div>
            <div className="bg-black/50 border border-white/10 px-3 py-2 rounded-lg">
              <span className="text-white/40 block text-[10px] uppercase font-sans tracking-wider">Estimated Total</span>
              <span
                className={`text-base font-bold ${
                  isOverBudget ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                ${totalEstimated.toFixed(2)}
              </span>
            </div>
            <div className="bg-black/50 border border-white/10 px-3 py-2 rounded-lg">
              <span className="text-white/40 block text-[10px] uppercase font-sans tracking-wider">Difference</span>
              <span
                className={`text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border inline-block mt-0.5 ${
                  isOverBudget
                    ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                    : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                }`}
              >
                {isOverBudget ? `+$${budgetDifference.toFixed(2)} over` : `-$${budgetDifference.toFixed(2)} under`}
              </span>
            </div>
          </div>
        </div>

        {/* Live Budget Utilization Gauge */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-white/60 font-sans">
            <span>
              Budget Utilization: <strong className="text-white">{budgetPercentUsed}%</strong> (${totalEstimated.toFixed(2)} of ${targetBudget.toFixed(2)})
            </span>
            <span>
              Acquired: <strong className="text-white">{percentBought}%</strong> (${boughtTotal.toFixed(2)})
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-white/10 flex">
            <div
              className={`h-full transition-all duration-300 ${
                isOverBudget ? 'bg-amber-500' : 'bg-white'
              }`}
              style={{ width: `${Math.min(100, budgetPercentUsed)}%` }}
            />
          </div>
        </div>

        {/* Action Controls & Bulk Brand Optimizer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddingItem(!isAddingItem)}
              className="px-3.5 py-2 rounded-lg bg-white text-black hover:bg-white/90 text-xs font-sans uppercase tracking-wider font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Item</span>
            </button>

            {nationalBrandCount > 0 && (
              <button
                onClick={handleOptimizeAllToCymbalEssentials}
                className="px-3.5 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 text-xs font-sans uppercase tracking-wider font-bold transition flex items-center gap-1.5 shadow-xs"
                title="Convert National Brands to Cymbal Essentials to save ~25% and recalculate budget"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Optimize to Cymbal Essentials ({nationalBrandCount} items)</span>
              </button>
            )}

            <button
              onClick={() =>
                onOpenAiChat(
                  `Please review my shopping list at CymbalMart and swap items to Cymbal Essentials or rebalance quantities to bring the total cost under our $${targetBudget} budget while maintaining ample food for all guests.`
                )
              }
              className="px-3.5 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-sans uppercase tracking-wider font-bold transition flex items-center gap-1.5 shadow-xs"
              title="Ask CymbalMart Assistant to optimize budget"
            >
              <BotMessageSquare className="w-3.5 h-3.5 text-white" />
              <span>Ask CymbalMart Assistant</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onCheckAll(true)}
              className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-sans uppercase tracking-wider transition"
            >
              Check All
            </button>
            <button
              onClick={() => onCheckAll(false)}
              className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-sans uppercase tracking-wider transition"
            >
              Uncheck All
            </button>
          </div>
        </div>
      </div>

      {/* Add Custom Item Form (Collapsible) */}
      {isAddingItem && (
        <form
          onSubmit={handleAddNewItemSubmit}
          className="bg-[#141414] border border-white/20 rounded-lg p-5 space-y-4 font-sans text-xs animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="font-serif text-sm font-bold text-white">Add Custom Item to Shopping Docket</h4>
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                Item Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cymbal Organic Sparkling Apple Cider"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                Department
              </label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as ProductCategory)}
                className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
              >
                {categoriesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                Brand Tier
              </label>
              <select
                value={newItemBrandTier}
                onChange={(e) => setNewItemBrandTier(e.target.value as CymbalBrandTier)}
                className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
              >
                <option value="Cymbal Essentials">Cymbal Essentials</option>
                <option value="Cymbal Organic">Cymbal Organic</option>
                <option value="Cymbal Choice">Cymbal Choice</option>
                <option value="National Brand">National Brand</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                Physical Aisle
              </label>
              <input
                type="text"
                placeholder="e.g. Aisle 6 - Snacks & Chips"
                value={newItemAisle}
                onChange={(e) => setNewItemAisle(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={newItemQty}
                onChange={(e) => setNewItemQty(Number(e.target.value))}
                className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                Unit
              </label>
              <input
                type="text"
                placeholder="e.g. pack, bottle, lbs"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                Estimated Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="px-4 py-2 rounded border border-white/20 text-white/70 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-white/90"
            >
              Add Item & Recalculate Budget
            </button>
          </div>
        </form>
      )}

      {/* Filter & View Toolbar */}
      <div className="bg-[#111111] border border-white/15 rounded-lg p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 font-sans text-xs shadow-md">
        {/* View Mode Buttons */}
        <div className="flex items-center gap-1 bg-[#1a1a1a] p-1 rounded-lg border border-white/10 w-full sm:w-auto justify-center">
          <button
            onClick={() => setViewMode('aisle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs uppercase font-bold tracking-wider transition ${
              viewMode === 'aisle'
                ? 'bg-white text-black shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>By Store Aisle</span>
          </button>

          <button
            onClick={() => setViewMode('category')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs uppercase font-bold tracking-wider transition ${
              viewMode === 'category'
                ? 'bg-white text-black shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>By Department</span>
          </button>

          <button
            onClick={() => setViewMode('store')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs uppercase font-bold tracking-wider transition ${
              viewMode === 'store'
                ? 'bg-white text-black shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>By Store Location</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search items, aisles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181818] border border-white/15 rounded pl-8 pr-3 py-1.5 text-white placeholder:text-white/30 text-xs focus:outline-none focus:border-white/40"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-[#181818] border border-white/15 rounded p-0.5">
            {(['all', 'unbought', 'bought'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded text-[11px] uppercase tracking-wider transition ${
                  filterStatus === st
                    ? 'bg-white/20 text-white font-bold'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Brand Tier Filter */}
          <select
            value={selectedBrandTier}
            onChange={(e) => setSelectedBrandTier(e.target.value)}
            className="bg-[#181818] border border-white/15 rounded px-2 py-1.5 text-white/80 focus:outline-none text-[11px]"
          >
            <option value="all">All Product Tiers</option>
            <option value="Cymbal Essentials">Cymbal Essentials</option>
            <option value="Cymbal Organic">Cymbal Organic</option>
            <option value="Cymbal Choice">Cymbal Choice</option>
            <option value="National Brand">National Brands</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#181818] border border-white/15 rounded px-2 py-1.5 text-white/80 focus:outline-none text-[11px]"
          >
            <option value="all">All Departments</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Items Display */}
      <div className="space-y-4">
        {viewMode === 'aisle' && (
          Object.keys(groupedByAisle).length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/15 rounded-lg text-white/50 text-xs font-sans">
              No shopping items match the active search or filters.
            </div>
          ) : (
            (Object.entries(groupedByAisle) as [string, ShoppingItem[]][]).map(([aisle, aisleItems]) => {
              const aisleTotal = aisleItems.reduce((a, b) => a + (Number(b.estimatedPrice) || 0), 0);
              const aisleChecked = aisleItems.filter((i) => i.checked).length;

              return (
                <div
                  key={aisle}
                  className="bg-[#111111] border border-white/15 rounded-lg overflow-hidden shadow-md"
                >
                  <div className="bg-white/[0.03] border-b border-white/10 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-white/10 text-white flex items-center justify-center font-mono text-xs font-bold border border-white/20">
                        <Compass className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-serif font-bold text-white tracking-wide">{aisle}</h4>
                        <span className="text-[11px] text-white/50 font-sans">
                          {aisleChecked}/{aisleItems.length} items acquired
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs text-white/80">
                      <span className="text-white font-bold">${aisleTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="divide-y divide-white/5">
                    {aisleItems.map((item) => renderItemRow(item, false))}
                  </div>
                </div>
              );
            })
          )
        )}

        {viewMode === 'category' && (
          Object.keys(groupedByCategory).length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/15 rounded-lg text-white/50 text-xs font-sans">
              No shopping items match the active search or filters.
            </div>
          ) : (
            (Object.entries(groupedByCategory) as [string, ShoppingItem[]][]).map(
              ([category, catItems]) => {
                const catTotal = catItems.reduce((a, b) => a + (Number(b.estimatedPrice) || 0), 0);
                const catChecked = catItems.filter((i) => i.checked).length;

                return (
                  <div
                    key={category}
                    className="bg-[#111111] border border-white/15 rounded-lg overflow-hidden shadow-md"
                  >
                    <div className="bg-white/[0.03] border-b border-white/10 px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-white/10 text-white flex items-center justify-center font-mono text-xs font-bold border border-white/20">
                          <Layers className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-serif font-bold text-white tracking-wide">
                            {category}
                          </h4>
                          <span className="text-[11px] text-white/50 font-sans">
                            {catChecked}/{catItems.length} items acquired
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs text-white/80">
                        <span className="text-white font-bold">${catTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="divide-y divide-white/5">
                      {catItems.map((item) => renderItemRow(item, true))}
                    </div>
                  </div>
                );
              }
            )
          )
        )}

        {viewMode === 'store' && (
          Object.keys(groupedByStore).length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/15 rounded-lg text-white/50 text-xs font-sans">
              No shopping items match the active search or filters.
            </div>
          ) : (
            (Object.entries(groupedByStore) as [string, ShoppingItem[]][]).map(([store, storeItems]) => {
              const storeTotal = storeItems.reduce((a, b) => a + (Number(b.estimatedPrice) || 0), 0);
              const storeChecked = storeItems.filter((i) => i.checked).length;

              return (
                <div
                  key={store}
                  className="bg-[#111111] border border-white/15 rounded-lg overflow-hidden shadow-md"
                >
                  <div className="bg-white/[0.03] border-b border-white/10 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-white/10 text-white flex items-center justify-center font-mono text-xs font-bold border border-white/20">
                        <Store className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-serif font-bold text-white tracking-wide">{store}</h4>
                        <span className="text-[11px] text-white/50 font-sans">
                          {storeChecked}/{storeItems.length} items acquired
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs text-white/80">
                      <span className="text-white font-bold">${storeTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="divide-y divide-white/5">
                    {storeItems.map((item) => renderItemRow(item, true))}
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      {/* Full Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/20 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-sans text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-white">Edit Shopping Item</h3>
                <p className="text-white/40 text-[11px]">
                  Updates will immediately recalculate the party budget total.
                </p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 text-white/40 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItemEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                  Item Description / Name
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                    Department
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, category: e.target.value as ProductCategory })
                    }
                    className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                    Brand Tier
                  </label>
                  <select
                    value={editingItem.brandTier || 'Cymbal Essentials'}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        brandTier: e.target.value as CymbalBrandTier,
                      })
                    }
                    className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="Cymbal Essentials">Cymbal Essentials</option>
                    <option value="Cymbal Organic">Cymbal Organic</option>
                    <option value="Cymbal Choice">Cymbal Choice</option>
                    <option value="National Brand">National Brand</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                    Quantity Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingItem.quantityNeeded}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        quantityNeeded: Number(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                    Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                    Estimated Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingItem.estimatedPrice}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        estimatedPrice: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                    Physical Store Aisle
                  </label>
                  <input
                    type="text"
                    value={editingItem.aisle || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, aisle: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                    Dietary Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gluten-Free, Vegan"
                    value={editingItem.dietaryTag || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, dietaryTag: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                  Host Preparation Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Buy morning of event, keep chilled"
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                />
              </div>

              {/* 1-Click Cymbal Essentials Discount Prompt */}
              {editingItem.brandTier !== 'Cymbal Essentials' && (
                <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-3 flex items-center justify-between">
                  <div className="text-[11px] text-emerald-300">
                    <strong>Cymbal Essentials Brand Swap:</strong> Save 25% on this item (${(editingItem.estimatedPrice * 0.75).toFixed(2)})
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingItem({
                        ...editingItem,
                        brandTier: 'Cymbal Essentials',
                        estimatedPrice: Math.round(editingItem.estimatedPrice * 0.75 * 100) / 100,
                      })
                    }
                    className="px-2.5 py-1 rounded bg-emerald-500 text-black font-bold uppercase text-[10px] tracking-wider hover:bg-emerald-400"
                  >
                    Apply 25% Off
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded border border-white/20 text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-white/90 shadow-md"
                >
                  Save Changes & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Sticky Total & Checkout Bar */}
      <div className="bg-[#0D0D0D] border border-white/15 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-white/40 block text-[10px] uppercase tracking-wider">Acquired Progress</span>
            <strong className="text-white text-sm">
              {checkedCount} of {totalCount} Items Bought ({percentBought}%)
            </strong>
          </div>
          <span className="text-white/20">|</span>
          <div>
            <span className="text-white/40 block text-[10px] uppercase tracking-wider">Remaining to Procure</span>
            <strong className="text-white text-sm font-mono">${remainingTotal.toFixed(2)}</strong>
          </div>
          <span className="text-white/20">|</span>
          <div>
            <span className="text-white/40 block text-[10px] uppercase tracking-wider">Total Projected Spend</span>
            <strong
              className={`text-sm font-mono font-bold ${
                isOverBudget ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              ${totalEstimated.toFixed(2)}
            </strong>
          </div>
        </div>

        {onOpenCheckout && (
          <button
            onClick={onOpenCheckout}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-white/90 transition shadow-lg flex items-center justify-center gap-2"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Proceed to CymbalMart Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
