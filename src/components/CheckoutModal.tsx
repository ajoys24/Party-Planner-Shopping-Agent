import React, { useState } from 'react';
import { PartyPlan, ShoppingItem, OrderFulfillment } from '../types';
import confetti from 'canvas-confetti';
import {
  X,
  ShoppingBag,
  Truck,
  Store,
  MapPin,
  Clock,
  CheckCircle2,
  Receipt,
  Car,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Printer,
  Compass,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
  onUpdatePlan: (updated: PartyPlan) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  plan,
  onUpdatePlan,
}) => {
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'delivery' | 'pickup' | 'in_store'>('pickup');
  const [timeSlot, setTimeSlot] = useState('Today, 2:00 PM – 4:00 PM');
  const [deliveryAddress, setDeliveryAddress] = useState('1402 River Oak Way, Austin, TX 78704');
  const [deliveryNotes, setDeliveryNotes] = useState('Leave at front porch under covered patio. Keep ice bags chilled in shade.');
  const [carDescription, setCarDescription] = useState('Silver Toyota RAV4 (Bay 4)');
  const [driverTip, setDriverTip] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');

  if (!isOpen) return null;

  const items = plan.shoppingList;
  const itemsSubtotal = items.reduce((acc, item) => acc + item.estimatedPrice, 0);
  
  // Calculate Cymbal brand savings (approx 18% savings)
  const cymbalBrandSavings = Math.round(itemsSubtotal * 0.18 * 100) / 100;
  const deliveryFee = fulfillmentMethod === 'delivery' ? 4.99 : 0;
  const tipAmount = fulfillmentMethod === 'delivery' ? driverTip : 0;
  const estimatedTax = Math.round((itemsSubtotal * 0.0825) * 100) / 100;
  const grandTotal = Math.round((itemsSubtotal + deliveryFee + tipAmount + estimatedTax) * 100) / 100;

  // Group items by aisle for in-store walkthrough or fulfillment
  const aislesMap: { [aisle: string]: ShoppingItem[] } = {};
  items.forEach((item) => {
    const aisleName = item.aisle || 'General Store';
    if (!aislesMap[aisleName]) aislesMap[aisleName] = [];
    aislesMap[aisleName].push(item);
  });

  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedOrderId = `CM-${Math.floor(100000 + Math.random() * 900000)}`;
      const fulfillmentData: OrderFulfillment = {
        method: fulfillmentMethod,
        status: 'submitted',
        orderId: generatedOrderId,
        storeName: plan.storeLocation || 'CymbalMart Supercenter #104 (Austin North)',
        timeSlot,
        address: fulfillmentMethod === 'delivery' ? deliveryAddress : undefined,
        carDescription: fulfillmentMethod === 'pickup' ? carDescription : undefined,
        tipAmount: fulfillmentMethod === 'delivery' ? tipAmount : undefined,
        submittedAt: new Date().toISOString(),
      };

      onUpdatePlan({
        ...plan,
        fulfillment: fulfillmentData,
        updatedAt: new Date().toISOString(),
      });

      setIsSubmitting(false);
      setOrderConfirmed(true);
      setConfirmedOrderId(generatedOrderId);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFFFFF', '#D1D5DB', '#9CA3AF', '#3B82F6'],
        });
      } catch (e) {
        // ignore if not supported
      }
    }, 1200);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#0D0D0D] border border-white/15 rounded-lg max-w-4xl w-full text-white shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-serif font-bold text-sm">
              CM
            </div>
            <div>
              <div className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-white/50">
                CYMBALMART INSTANT FULFILLMENT
              </div>
              <h2 className="text-base font-serif text-white">
                {orderConfirmed ? 'Order Confirmation & Fulfillment Docket' : 'Refine & Finalize CymbalMart Order'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {orderConfirmed ? (
            /* Order Confirmed Screen */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-sans uppercase tracking-widest text-emerald-400 font-bold">
                  Order Successfully Transmitted
                </div>
                <h3 className="text-2xl font-serif text-white">
                  Order #{confirmedOrderId}
                </h3>
                <p className="text-xs text-white/70 max-w-md mx-auto font-sans leading-relaxed">
                  Your event grocery order has been routed to <strong>{plan.storeLocation || 'CymbalMart Supercenter #104'}</strong>. Our personal shoppers are staging your party basket now.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-900/40 text-emerald-300 text-xs font-mono border border-emerald-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Scheduled: {timeSlot}</span>
                </div>
              </div>

              {/* Order Receipt Card */}
              <div className="bg-[#121212] border border-white/10 rounded-lg p-5 font-sans space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Receipt className="w-4 h-4 text-white/80" />
                    <span>FULFILLMENT SPECIFICATION</span>
                  </div>
                  <span className="text-xs font-mono uppercase text-white/40">
                    STATUS: DISPATCHED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase tracking-wider">Fulfillment Type</span>
                    <strong className="text-white capitalize">
                      {fulfillmentMethod === 'delivery' ? 'Express 2-Hour Delivery' : fulfillmentMethod === 'pickup' ? 'Free Curbside Pickup' : 'Self-Serve In-Store Walkthrough'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase tracking-wider">Store Location</span>
                    <strong className="text-white">{plan.storeLocation || 'CymbalMart Supercenter #104'}</strong>
                  </div>
                  {fulfillmentMethod === 'delivery' && (
                    <div className="sm:col-span-2">
                      <span className="text-white/40 block text-[10px] uppercase tracking-wider">Delivery Destination</span>
                      <strong className="text-white">{deliveryAddress}</strong>
                    </div>
                  )}
                  {fulfillmentMethod === 'pickup' && (
                    <div className="sm:col-span-2">
                      <span className="text-white/40 block text-[10px] uppercase tracking-wider">Pickup Vehicle Details</span>
                      <strong className="text-white">{carDescription}</strong>
                    </div>
                  )}
                </div>

                {/* Staged Items List by Aisle */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                    Packaged Shopping Docket ({items.length} items)
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-2 pr-2">
                    {Object.entries(aislesMap).map(([aisle, aisleItems]) => (
                      <div key={aisle} className="bg-white/[0.02] border border-white/5 rounded p-2.5 space-y-1">
                        <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest flex items-center justify-between">
                          <span>{aisle}</span>
                          <span>{aisleItems.length} items</span>
                        </div>
                        <div className="divide-y divide-white/5">
                          {aisleItems.map((item) => (
                            <div key={item.id} className="py-1 flex items-center justify-between text-xs">
                              <span className="text-white/80">
                                {item.quantityNeeded} {item.unit} • {item.name}
                              </span>
                              <span className="font-mono text-white/60">${item.estimatedPrice.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-white/60">
                    <span>Items Subtotal ({items.length} items)</span>
                    <span className="font-mono text-white/90">${itemsSubtotal.toFixed(2)}</span>
                  </div>
                  {fulfillmentMethod === 'delivery' && (
                    <div className="flex justify-between text-white/60">
                      <span>Express Delivery Fee</span>
                      <span className="font-mono text-white/90">${deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {fulfillmentMethod === 'delivery' && driverTip > 0 && (
                    <div className="flex justify-between text-white/60">
                      <span>Driver Tip</span>
                      <span className="font-mono text-white/90">${tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/60">
                    <span>Estimated Sales Tax (8.25%)</span>
                    <span className="font-mono text-white/90">${estimatedTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Cymbal Brand Savings Applied</span>
                    <span className="font-mono">-${cymbalBrandSavings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                    <span>Final Charged Total</span>
                    <span className="font-mono text-base">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={handlePrintReceipt}
                  className="w-full sm:w-auto px-4 py-2 rounded border border-white/20 hover:border-white/40 text-xs font-sans uppercase tracking-wider text-white/80 hover:text-white flex items-center justify-center gap-2 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Order Docket</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2 rounded bg-white text-black font-sans text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition shadow-md"
                >
                  Return to Event Plan
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Configuration Form */
            <div className="space-y-6">
              {/* Step 1: Select Fulfillment Method */}
              <div className="space-y-3">
                <label className="text-[11px] font-sans font-bold uppercase tracking-widest text-white/60 block">
                  Select Fulfillment Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod('pickup')}
                    className={`p-4 rounded-lg border text-left transition flex flex-col justify-between space-y-2 ${
                      fulfillmentMethod === 'pickup'
                        ? 'bg-white/10 border-white text-white'
                        : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Store className="w-5 h-5 text-white" />
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        FREE
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-serif font-bold text-white">Curbside Pickup</div>
                      <div className="text-[11px] text-white/50 font-sans mt-0.5">
                        Ready in 2 hrs at store bay
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod('delivery')}
                    className={`p-4 rounded-lg border text-left transition flex flex-col justify-between space-y-2 ${
                      fulfillmentMethod === 'delivery'
                        ? 'bg-white/10 border-white text-white'
                        : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Truck className="w-5 h-5 text-white" />
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                        $4.99
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-serif font-bold text-white">Express Delivery</div>
                      <div className="text-[11px] text-white/50 font-sans mt-0.5">
                        Delivered straight to party venue
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod('in_store')}
                    className={`p-4 rounded-lg border text-left transition flex flex-col justify-between space-y-2 ${
                      fulfillmentMethod === 'in_store'
                        ? 'bg-white/10 border-white text-white'
                        : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Compass className="w-5 h-5 text-white" />
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono">
                        IN-STORE
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-serif font-bold text-white">Aisle Walkthrough</div>
                      <div className="text-[11px] text-white/50 font-sans mt-0.5">
                        Optimal walking route in-store
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: Time & Location Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#121212] border border-white/10 rounded-lg p-4 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                    Select Target Window
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-[#181818] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white text-xs"
                  >
                    <option value="Today, 2:00 PM – 4:00 PM">Today, 2:00 PM – 4:00 PM (Express)</option>
                    <option value="Today, 4:00 PM – 6:00 PM">Today, 4:00 PM – 6:00 PM (Pre-Event)</option>
                    <option value="Tomorrow, 9:00 AM – 11:00 AM">Tomorrow, 9:00 AM – 11:00 AM (Morning Prep)</option>
                    <option value="Tomorrow, 1:00 PM – 3:00 PM">Tomorrow, 1:00 PM – 3:00 PM (Party Day)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                    Selected CymbalMart Supercenter
                  </label>
                  <div className="flex items-center gap-2 bg-[#181818] border border-white/15 rounded px-3 py-2 text-white/90 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-white/50 shrink-0" />
                    <span className="truncate">{plan.storeLocation || 'CymbalMart Supercenter #104 (Austin North)'}</span>
                  </div>
                </div>

                {fulfillmentMethod === 'delivery' && (
                  <>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                        Venue Delivery Address
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full bg-[#181818] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white text-xs"
                        placeholder="Street Address, City, State, Zip"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                        Driver Instructions (Ice Handling / Gate Codes)
                      </label>
                      <input
                        type="text"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        className="w-full bg-[#181818] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white text-xs"
                        placeholder="Gate code, porch notes, coolers placement..."
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                        Optional Driver Tip
                      </label>
                      <div className="flex items-center gap-2">
                        {[5, 10, 15, 20].map((tip) => (
                          <button
                            key={tip}
                            type="button"
                            onClick={() => setDriverTip(tip)}
                            className={`px-3 py-1.5 rounded border text-xs font-mono transition ${
                              driverTip === tip
                                ? 'bg-white text-black border-white font-bold'
                                : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                            }`}
                          >
                            ${tip}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {fulfillmentMethod === 'pickup' && (
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                      Curbside Vehicle Identification
                    </label>
                    <input
                      type="text"
                      value={carDescription}
                      onChange={(e) => setCarDescription(e.target.value)}
                      className="w-full bg-[#181818] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-white text-xs"
                      placeholder="e.g. Blue Honda CRV (Bay 3)"
                    />
                  </div>
                )}
              </div>

              {/* Step 3: Itemized Aisle Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">
                    Aisle Routing Summary ({items.length} items)
                  </span>
                  <span className="text-white/40 text-[11px]">
                    {Object.keys(aislesMap).length} Supercenter Aisles Synced
                  </span>
                </div>

                <div className="bg-[#121212] border border-white/10 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 font-sans">
                  {Object.entries(aislesMap).map(([aisle, aisleItems]) => (
                    <div key={aisle} className="flex items-center justify-between py-1 border-b border-white/5 text-xs last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white/40" />
                        <span className="font-mono text-white/80">{aisle}</span>
                      </div>
                      <span className="text-white/50 text-[11px]">
                        {aisleItems.length} items • ${aisleItems.reduce((a, b) => a + b.estimatedPrice, 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Cost & Savings Summary */}
              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 font-sans text-xs space-y-2">
                <div className="flex justify-between text-white/60">
                  <span>Cart Items Subtotal ({items.length} items)</span>
                  <span className="font-mono text-white">${itemsSubtotal.toFixed(2)}</span>
                </div>
                {fulfillmentMethod === 'delivery' && (
                  <div className="flex justify-between text-white/60">
                    <span>Express Delivery Service</span>
                    <span className="font-mono text-white">${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                {fulfillmentMethod === 'delivery' && (
                  <div className="flex justify-between text-white/60">
                    <span>Driver Tip</span>
                    <span className="font-mono text-white">${driverTip.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/60">
                  <span>Estimated Tax</span>
                  <span className="font-mono text-white">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-medium pt-1">
                  <span>Cymbal Brand Savings (Applied)</span>
                  <span className="font-mono">-${cymbalBrandSavings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span>Grand Total</span>
                  <span className="font-mono text-base">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded border border-white/15 text-xs uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/5 transition font-sans"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded bg-white text-black font-sans text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Place CymbalMart Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
