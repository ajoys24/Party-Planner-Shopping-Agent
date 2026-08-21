import React, { useState, useMemo } from 'react';
import { PartyPlan, ShoppingItem } from '../types';
import {
  Share2,
  X,
  Copy,
  Check,
  Printer,
  FileText,
  MessageSquare,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Group items by category
  const groupedByCategory = useMemo(() => {
    const groups: { [key: string]: ShoppingItem[] } = {};
    plan.shoppingList.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [plan.shoppingList]);

  // Generate Aisle / Notes Format
  const notesFormattedText = useMemo(() => {
    let text = `🛒 ${plan.title.toUpperCase()} - SHOPPING LIST\n`;
    text += `Event: ${plan.eventType} | ${plan.guestCount.total} Guests | Est: ${plan.budget.currency}${plan.budget.estimatedTotal}\n\n`;

    (Object.entries(groupedByCategory) as [string, ShoppingItem[]][]).forEach(([category, items]) => {
      text += `📍 ${category.toUpperCase()}\n`;
      items.forEach((item) => {
        const checkMark = item.checked ? '[x]' : '[ ]';
        const packInfo = item.packSizeSuggestion ? ` (${item.packSizeSuggestion})` : '';
        const storeInfo = item.suggestedStore ? ` @ ${item.suggestedStore}` : '';
        text += `${checkMark} ${item.name} - ${item.quantityNeeded} ${item.unit}${packInfo} ~${plan.budget.currency}${item.estimatedPrice.toFixed(2)}${storeInfo}\n`;
      });
      text += '\n';
    });

    return text.trim();
  }, [plan, groupedByCategory]);

  // Generate Compact WhatsApp / SMS message
  const smsFormattedText = useMemo(() => {
    let text = `🎉 Shopping list for ${plan.title} (${plan.guestCount.total} guests):\n\n`;
    plan.shoppingList.forEach((item) => {
      const mark = item.checked ? '✅' : '▫️';
      text += `${mark} ${item.name} (${item.quantityNeeded} ${item.unit})\n`;
    });
    text += `\nEstimated Total: ${plan.budget.currency}${plan.budget.estimatedTotal}`;
    return text;
  }, [plan]);

  const handleCopy = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="bg-[#0D0D0D] rounded-lg max-w-2xl w-full max-h-[90vh] shadow-2xl border border-white/15 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 my-auto text-white">
        {/* Header */}
        <div className="p-5 bg-[#141414] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif text-white tracking-wide">Export & Transmit Procurement Docket</h3>
              <p className="text-xs text-white/40">
                Formatted itemized dockets for digital notes, messaging dispatch, or print
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm bg-[#0D0D0D]">
          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleCopy(notesFormattedText, 'notes')}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] border border-white/10 hover:border-white/30 transition text-white"
            >
              <div className="p-2 rounded bg-white/10 text-white border border-white/15">
                {copiedFormat === 'notes' ? <Check className="w-5 h-5 text-emerald-400" /> : <FileText className="w-5 h-5" />}
              </div>
              <span className="font-bold text-xs uppercase tracking-wider">
                {copiedFormat === 'notes' ? 'Copied to Clipboard!' : 'Notes Format'}
              </span>
              <span className="text-[10px] text-white/40 text-center font-mono-custom">Apple Notes / Keep / Todoist</span>
            </button>

            <button
              onClick={() => handleCopy(smsFormattedText, 'sms')}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] border border-white/10 hover:border-white/30 transition text-white"
            >
              <div className="p-2 rounded bg-white/10 text-white border border-white/15">
                {copiedFormat === 'sms' ? <Check className="w-5 h-5 text-emerald-400" /> : <MessageSquare className="w-5 h-5 text-white" />}
              </div>
              <span className="font-bold text-xs uppercase tracking-wider">
                {copiedFormat === 'sms' ? 'Copied for Dispatch!' : 'WhatsApp / SMS'}
              </span>
              <span className="text-[10px] text-white/40 text-center font-mono-custom">Clean compact message</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] border border-white/10 hover:border-white/30 transition text-white"
            >
              <div className="p-2 rounded bg-white/10 text-white border border-white/15">
                <Printer className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider">Print Copy</span>
              <span className="text-[10px] text-white/40 text-center font-mono-custom">Letterhead / PDF</span>
            </button>
          </div>

          {/* Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[10px] text-white/50">Docket Preview:</span>
              <span className="text-white/40 text-xs font-mono-custom">{plan.shoppingList.length} items total</span>
            </div>
            <pre className="p-4 bg-[#080808] text-white/80 rounded-lg text-xs font-mono-custom max-h-60 overflow-y-auto leading-relaxed border border-white/10 select-all whitespace-pre-wrap">
              {notesFormattedText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#141414] border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded bg-white hover:bg-white/90 text-black text-xs font-bold uppercase tracking-widest transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
