import { PartyPlan, ShoppingItem } from '../types';

/**
 * Automatically recalculates all budget totals and department allocations
 * whenever the shopping list is updated (items added, edited, deleted, quantities changed, brand tiers swapped).
 */
export function recalculatePartyBudget(
  plan: PartyPlan,
  updatedShoppingList: ShoppingItem[]
): PartyPlan {
  const rawTotal = updatedShoppingList.reduce(
    (sum, item) => sum + (Number(item.estimatedPrice) || 0),
    0
  );
  const estimatedTotal = Math.round(rawTotal * 100) / 100;

  // Calculate department breakdowns
  let food = 0;
  let drinks = 0;
  let tablewareAndSupplies = 0;
  let decorations = 0;

  updatedShoppingList.forEach((item) => {
    const cost = Number(item.estimatedPrice) || 0;
    const cat = item.category;
    if (
      [
        'Produce',
        'Meat & Seafood',
        'Plant Protein',
        'Dairy & Deli',
        'Bakery & Bread',
        'Pantry & Dry Goods',
      ].includes(cat)
    ) {
      food += cost;
    } else if (['Beverages & Mixers', 'Alcohol', 'Ice'].includes(cat)) {
      drinks += cost;
    } else if (['Tableware & Disposables', 'Miscellaneous'].includes(cat)) {
      tablewareAndSupplies += cost;
    } else if (['Decorations & Balloons'].includes(cat)) {
      decorations += cost;
    } else {
      food += cost;
    }
  });

  const buffer = Math.max(0, Math.round(plan.budget.targetBudget - estimatedTotal));

  return {
    ...plan,
    shoppingList: updatedShoppingList,
    budget: {
      ...plan.budget,
      estimatedTotal: Math.round(estimatedTotal),
    },
    budgetBreakdown: {
      food: Math.round(food),
      drinks: Math.round(drinks),
      tablewareAndSupplies: Math.round(tablewareAndSupplies),
      decorations: Math.round(decorations),
      buffer: buffer > 0 ? buffer : Math.round(estimatedTotal * 0.05),
    },
    updatedAt: new Date().toISOString(),
  };
}
