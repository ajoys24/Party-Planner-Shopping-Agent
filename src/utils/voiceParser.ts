import { PartyPlan, ShoppingItem, ProductCategory, CymbalBrandTier } from '../types';

export type VoiceActionType =
  | 'NAVIGATE_TAB'
  | 'CREATE_PARTY'
  | 'OPEN_NEW_PARTY_MODAL'
  | 'ADD_SHOPPING_ITEM'
  | 'TOGGLE_SHOPPING_ITEM'
  | 'CHECK_ALL_ITEMS'
  | 'UNCHECK_ALL_ITEMS'
  | 'DELETE_SHOPPING_ITEM'
  | 'ADJUST_QUANTITY'
  | 'OPTIMIZE_BUDGET'
  | 'READ_SHOPPING_LIST'
  | 'READ_BUDGET'
  | 'READ_PREP_STEP'
  | 'READ_MENU'
  | 'OPEN_CHECKOUT'
  | 'CLOSE_CHECKOUT'
  | 'SELECT_FULFILLMENT'
  | 'PLACE_ORDER'
  | 'OPEN_ASSISTANT'
  | 'ASK_ASSISTANT'
  | 'STOP_SPEAKING'
  | 'UNKNOWN';

export interface VoiceCommandResult {
  action: VoiceActionType;
  spokenResponse: string;
  payload?: any;
}

/**
 * Fuzzy search helper to find best matching shopping item by spoken name
 */
export function findMatchingItem(items: ShoppingItem[], query: string): ShoppingItem | null {
  const cleanQuery = query.toLowerCase().replace(/^(the|a|an|some)\s+/, '').trim();
  if (!cleanQuery) return null;

  // 1. Exact match
  const exact = items.find((i) => i.name.toLowerCase() === cleanQuery);
  if (exact) return exact;

  // 2. Includes match
  const includes = items.find((i) => i.name.toLowerCase().includes(cleanQuery) || cleanQuery.includes(i.name.toLowerCase()));
  if (includes) return includes;

  // 3. Keyword token overlap
  const queryTokens = cleanQuery.split(/\s+/).filter((t) => t.length > 2);
  let bestItem: ShoppingItem | null = null;
  let maxScore = 0;

  items.forEach((item) => {
    const itemLower = item.name.toLowerCase();
    let score = 0;
    queryTokens.forEach((token) => {
      if (itemLower.includes(token)) score += 2;
    });
    if (score > maxScore) {
      maxScore = score;
      bestItem = item;
    }
  });

  return maxScore > 0 ? bestItem : null;
}

/**
 * Parses spoken text into an actionable command for the CymbalMart Party Planner
 */
export function parseVoiceCommand(
  rawTranscript: string,
  currentPlan: PartyPlan,
  isCheckoutOpen: boolean = false
): VoiceCommandResult {
  const text = rawTranscript.trim().toLowerCase();

  // 0. Stop speaking / Silence
  if (
    text === 'stop' ||
    text === 'stop talking' ||
    text === 'be quiet' ||
    text === 'silence' ||
    text === 'cancel speech'
  ) {
    return {
      action: 'STOP_SPEAKING',
      spokenResponse: 'Audio stopped.',
    };
  }

  // 1. Navigation Commands
  if (
    text.includes('go to shopping') ||
    text.includes('show shopping') ||
    text.includes('open shopping') ||
    text.includes('view shopping') ||
    text.includes('shopping list') ||
    text.includes('shopping docket')
  ) {
    return {
      action: 'NAVIGATE_TAB',
      payload: 'shopping',
      spokenResponse: `Switching to your Shopping Docket with ${currentPlan.shoppingList.length} items.`,
    };
  }

  if (
    text.includes('go to overview') ||
    text.includes('show overview') ||
    text.includes('event blueprint') ||
    text.includes('show blueprint') ||
    text.includes('view blueprint')
  ) {
    return {
      action: 'NAVIGATE_TAB',
      payload: 'overview',
      spokenResponse: `Displaying Event Blueprint for ${currentPlan.title}.`,
    };
  }

  if (
    text.includes('go to menu') ||
    text.includes('show menu') ||
    text.includes('view menu') ||
    text.includes('menu and recipes') ||
    text.includes('show recipes')
  ) {
    return {
      action: 'NAVIGATE_TAB',
      payload: 'menu',
      spokenResponse: 'Here is your curated menu and recipe instructions.',
    };
  }

  if (
    text.includes('go to budget') ||
    text.includes('show budget') ||
    text.includes('budget and ratios') ||
    text.includes('budget breakdown') ||
    text.includes('view budget')
  ) {
    return {
      action: 'NAVIGATE_TAB',
      payload: 'budget',
      spokenResponse: `Opening Budget & Ratios. Target budget is $${currentPlan.budget.targetBudget}, currently estimated at $${currentPlan.budget.estimatedTotal}.`,
    };
  }

  if (
    text.includes('go to timeline') ||
    text.includes('prep countdown') ||
    text.includes('show countdown') ||
    text.includes('prep timeline') ||
    text.includes('prep schedule') ||
    text.includes('show timeline')
  ) {
    return {
      action: 'NAVIGATE_TAB',
      payload: 'timeline',
      spokenResponse: 'Switching to your Prep Countdown schedule.',
    };
  }

  // 2. Checkout & Fulfillment Commands
  if (
    text.includes('open checkout') ||
    text.includes('start checkout') ||
    text.includes('finalize and checkout') ||
    text.includes('go to checkout') ||
    text.includes('checkout now')
  ) {
    return {
      action: 'OPEN_CHECKOUT',
      spokenResponse: 'Opening CymbalMart Express Fulfillment & Checkout.',
    };
  }

  if (
    isCheckoutOpen &&
    (text.includes('close checkout') || text.includes('exit checkout') || text.includes('dismiss checkout'))
  ) {
    return {
      action: 'CLOSE_CHECKOUT',
      spokenResponse: 'Closing checkout.',
    };
  }

  if (
    isCheckoutOpen &&
    (text.includes('select curbside') ||
      text.includes('curbside pickup') ||
      text.includes('choose pickup') ||
      text.includes('switch to pickup'))
  ) {
    return {
      action: 'SELECT_FULFILLMENT',
      payload: 'pickup',
      spokenResponse: 'Selected Free Curbside Pickup at Bay 4.',
    };
  }

  if (
    isCheckoutOpen &&
    (text.includes('select express delivery') ||
      text.includes('express delivery') ||
      text.includes('choose delivery') ||
      text.includes('switch to delivery'))
  ) {
    return {
      action: 'SELECT_FULFILLMENT',
      payload: 'delivery',
      spokenResponse: 'Selected Express 2-Hour Delivery to your address.',
    };
  }

  if (
    isCheckoutOpen &&
    (text.includes('select in store') || text.includes('in store walkthrough') || text.includes('in store shopping'))
  ) {
    return {
      action: 'SELECT_FULFILLMENT',
      payload: 'in_store',
      spokenResponse: 'Selected In-Store Self-Guided Shopping walkthrough.',
    };
  }

  if (
    isCheckoutOpen &&
    (text.includes('place order') ||
      text.includes('submit order') ||
      text.includes('confirm order') ||
      text.includes('confirm checkout') ||
      text.includes('complete checkout'))
  ) {
    return {
      action: 'PLACE_ORDER',
      spokenResponse: 'Submitting your CymbalMart order now! Order confirmed.',
    };
  }

  // 3. Quick AI Party Planning via Voice
  // e.g. "plan a taco night for 12 people with 150 dollar budget"
  // e.g. "create barbecue party for 20 guests"
  const planMatch = text.match(/(?:plan|create|generate|make)\s+(?:a|an)?\s*([a-z0-9\s\-]+?)\s+(?:party|event|celebration|gathering|night|dinner|bbq|fiesta)?\s*(?:for\s+(\d+)\s*(?:people|guests|adults)?)?\s*(?:with\s*(?:\$|usd)?\s*(\d+)\s*(?:dollar|dollars|budget)?)?$/i);
  if (
    (text.startsWith('plan ') || text.startsWith('create ') || text.startsWith('make a party')) &&
    !text.includes('shopping list') &&
    !text.includes('item')
  ) {
    let theme = 'Celebration';
    let guests = 12;
    let budget = 200;

    // Extract guests if mentioned
    const guestsMatch = text.match(/(\d+)\s*(?:guests|people|adults|attendees)/i);
    if (guestsMatch) guests = parseInt(guestsMatch[1], 10);

    // Extract budget if mentioned
    const budgetMatch = text.match(/(?:\$|budget\s*of\s*|\b)(\d+)\s*(?:dollars?|bucks?|budget)?/i);
    if (budgetMatch && parseInt(budgetMatch[1], 10) > 10) budget = parseInt(budgetMatch[1], 10);

    // Extract title/theme
    const themeClean = text
      .replace(/^(plan|create|generate|make)\s+(a|an)?/i, '')
      .replace(/\b(for\s+\d+\s+(guests|people|adults)?)\b/i, '')
      .replace(/\b(with\s+(\$)?\d+\s+(dollars?|budget)?)\b/i, '')
      .trim();

    if (themeClean.length > 2) {
      theme = themeClean.charAt(0).toUpperCase() + themeClean.slice(1);
    }

    return {
      action: 'CREATE_PARTY',
      payload: {
        title: `${theme} Celebration`,
        eventType: theme,
        theme: theme,
        adults: guests,
        kids: 0,
        durationHours: 4,
        targetBudget: budget,
        currency: '$',
        dietaryRestrictions: [],
        venueType: 'Home / Backyard',
        equipment: ['Grill', 'Oven', 'Stovetop'],
        drinkPreference: 'family_mix',
        additionalNotes: 'Generated via hands-free voice control',
      },
      spokenResponse: `Generating a new party plan for ${theme} with ${guests} guests and a $${budget} budget.`,
    };
  }

  if (text.includes('open new party') || text.includes('new party plan') || text.includes('create party modal')) {
    return {
      action: 'OPEN_NEW_PARTY_MODAL',
      spokenResponse: 'Opening New Party Planner setup.',
    };
  }

  // 4. Shopping List: Check / Uncheck All
  if (text.includes('check all') || text.includes('mark all as bought') || text.includes('mark all items as done')) {
    return {
      action: 'CHECK_ALL_ITEMS',
      payload: true,
      spokenResponse: 'Marked all shopping items as acquired.',
    };
  }

  if (text.includes('uncheck all') || text.includes('mark all as unbought') || text.includes('reset all items')) {
    return {
      action: 'UNCHECK_ALL_ITEMS',
      payload: false,
      spokenResponse: 'Unchecked all shopping items.',
    };
  }

  // 5. Shopping List: Budget Optimization to Cymbal Essentials
  if (
    text.includes('optimize budget') ||
    text.includes('swap to cymbal essentials') ||
    text.includes('save money') ||
    text.includes('apply cymbal essentials') ||
    text.includes('switch to essentials')
  ) {
    return {
      action: 'OPTIMIZE_BUDGET',
      spokenResponse: 'Optimized eligible national brands to Cymbal Essentials, reducing total cost by approximately 25%.',
    };
  }

  // 6. Shopping List: Add Item
  // e.g. "add 2 packs of limes to shopping list" or "add sour cream" or "add 5 bags of ice"
  if (text.startsWith('add ') || text.includes('add to shopping') || text.includes('add to list')) {
    let itemClause = text
      .replace(/^add\s+/i, '')
      .replace(/\s+to\s+(the\s+)?(shopping\s+)?(list|docket)$/i, '')
      .trim();

    let quantity = 1;
    let unit = 'pack';
    let price = 4.99;
    let category: ProductCategory = 'Pantry & Dry Goods';
    let aisle = 'Aisle 6 - Pantry & Snacks';
    let brandTier: CymbalBrandTier = 'Cymbal Essentials';

    // Check for quantity prefix like "2 packs of" or "3 bags of" or "5 pounds of"
    const qtyMatch = itemClause.match(/^(\d+)\s*(packs?|bags?|bottles?|lbs?|pounds?|boxes?|cans?|bunches?|cartons?)?\s*(?:of\s+)?(.+)$/i);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1], 10) || 1;
      if (qtyMatch[2]) unit = qtyMatch[2].toLowerCase();
      itemClause = qtyMatch[3].trim();
    }

    const itemName = itemClause.charAt(0).toUpperCase() + itemClause.slice(1);

    // Auto-detect category & aisle
    const lowerName = itemName.toLowerCase();
    if (lowerName.includes('lime') || lowerName.includes('lemon') || lowerName.includes('avocado') || lowerName.includes('onion') || lowerName.includes('tomato') || lowerName.includes('cilantro') || lowerName.includes('lettuce') || lowerName.includes('pepper') || lowerName.includes('fruit') || lowerName.includes('vegetable')) {
      category = 'Produce';
      aisle = 'Aisle 1 - Fresh Produce';
      price = 2.49 * quantity;
    } else if (lowerName.includes('meat') || lowerName.includes('beef') || lowerName.includes('steak') || lowerName.includes('chicken') || lowerName.includes('pork') || lowerName.includes('patty') || lowerName.includes('burger') || lowerName.includes('sausage') || lowerName.includes('salmon') || lowerName.includes('shrimp')) {
      category = 'Meat & Seafood';
      aisle = 'Aisle 12 - Butcher Counter';
      price = 8.99 * quantity;
    } else if (lowerName.includes('cheese') || lowerName.includes('sour cream') || lowerName.includes('milk') || lowerName.includes('butter') || lowerName.includes('yogurt') || lowerName.includes('dip') || lowerName.includes('salsa')) {
      category = 'Dairy & Deli';
      aisle = 'Aisle 2 - Deli & Prepared Foods';
      price = 3.99 * quantity;
    } else if (lowerName.includes('bread') || lowerName.includes('bun') || lowerName.includes('tortilla') || lowerName.includes('brioche') || lowerName.includes('cake') || lowerName.includes('cookie') || lowerName.includes('bagel')) {
      category = 'Bakery & Bread';
      aisle = 'Aisle 3 - Fresh Bakery';
      price = 3.49 * quantity;
    } else if (lowerName.includes('beer') || lowerName.includes('wine') || lowerName.includes('tequila') || lowerName.includes('vodka') || lowerName.includes('margarita')) {
      category = 'Alcohol';
      aisle = 'Aisle 9 - Beer & Wine';
      price = 14.99 * quantity;
      brandTier = 'National Brand';
    } else if (lowerName.includes('ice')) {
      category = 'Ice';
      aisle = 'Front Register - Ice Cooler';
      price = 2.99 * quantity;
    } else if (lowerName.includes('soda') || lowerName.includes('seltzer') || lowerName.includes('juice') || lowerName.includes('cola') || lowerName.includes('water') || lowerName.includes('sparkling') || lowerName.includes('tonic')) {
      category = 'Beverages & Mixers';
      aisle = 'Aisle 8 - Beverages & Mixers';
      price = 4.49 * quantity;
    } else if (lowerName.includes('plate') || lowerName.includes('cup') || lowerName.includes('napkin') || lowerName.includes('fork') || lowerName.includes('cutlery') || lowerName.includes('towel') || lowerName.includes('tablecloth')) {
      category = 'Tableware & Disposables';
      aisle = 'Aisle 14 - Party Supplies';
      price = 4.99 * quantity;
    } else if (lowerName.includes('balloon') || lowerName.includes('banner') || lowerName.includes('streamer') || lowerName.includes('confetti') || lowerName.includes('candle')) {
      category = 'Decorations & Balloons';
      aisle = 'Aisle 14 - Party Supplies';
      price = 5.99 * quantity;
    }

    return {
      action: 'ADD_SHOPPING_ITEM',
      payload: {
        name: itemName,
        category,
        quantityNeeded: quantity,
        unit,
        estimatedPrice: Math.round(price * 100) / 100,
        suggestedStore: 'CymbalMart Supercenter #104',
        department: category,
        aisle,
        brandTier,
        isCustom: true,
      },
      spokenResponse: `Added ${quantity} ${unit} of ${itemName} to your shopping list at ${aisle}. Total estimated cost is $${price.toFixed(2)}.`,
    };
  }

  // 7. Shopping List: Check / Mark item as bought
  // e.g. "mark organic limes as bought", "check hamburger buns", "got the ice"
  if (
    text.startsWith('mark ') ||
    text.startsWith('check ') ||
    text.startsWith('got ') ||
    text.includes(' as bought') ||
    text.includes(' as acquired') ||
    text.includes(' as done')
  ) {
    let itemQuery = text
      .replace(/^mark\s+/i, '')
      .replace(/^check\s+/i, '')
      .replace(/^got\s+/i, '')
      .replace(/\s+as\s+(bought|acquired|done|completed)$/i, '')
      .replace(/^the\s+/i, '')
      .trim();

    const matched = findMatchingItem(currentPlan.shoppingList, itemQuery);
    if (matched) {
      return {
        action: 'TOGGLE_SHOPPING_ITEM',
        payload: { id: matched.id, checked: true },
        spokenResponse: `Checked off ${matched.name} from ${matched.aisle || 'your shopping list'}.`,
      };
    }
  }

  // 8. Shopping List: Uncheck item
  if (text.includes('uncheck ') || text.includes('mark ') && text.includes('as unbought')) {
    let itemQuery = text
      .replace(/^uncheck\s+/i, '')
      .replace(/^mark\s+/i, '')
      .replace(/\s+as\s+(unbought|not\s+bought|needed)$/i, '')
      .replace(/^the\s+/i, '')
      .trim();

    const matched = findMatchingItem(currentPlan.shoppingList, itemQuery);
    if (matched) {
      return {
        action: 'TOGGLE_SHOPPING_ITEM',
        payload: { id: matched.id, checked: false },
        spokenResponse: `Unchecked ${matched.name}. It is back on your active shopping list.`,
      };
    }
  }

  // 9. Shopping List: Remove / Delete item
  if (text.startsWith('delete ') || text.startsWith('remove ') || text.includes('remove from list')) {
    let itemQuery = text
      .replace(/^delete\s+/i, '')
      .replace(/^remove\s+/i, '')
      .replace(/\s+from\s+(the\s+)?(shopping\s+)?list$/i, '')
      .replace(/^the\s+/i, '')
      .trim();

    const matched = findMatchingItem(currentPlan.shoppingList, itemQuery);
    if (matched) {
      return {
        action: 'DELETE_SHOPPING_ITEM',
        payload: matched.id,
        spokenResponse: `Removed ${matched.name} from the shopping list and recalculated your budget.`,
      };
    }
  }

  // 10. Voice Readout: Read Shopping List
  if (
    text.includes('read my shopping list') ||
    text.includes('what is on my shopping list') ||
    text.includes('read shopping list') ||
    text.includes('what do i need to buy') ||
    text.includes('read items')
  ) {
    const unbought = currentPlan.shoppingList.filter((i) => !i.checked);
    if (unbought.length === 0) {
      return {
        action: 'READ_SHOPPING_LIST',
        spokenResponse: 'All items on your shopping list have already been acquired! You are completely ready for the party.',
      };
    }

    const topItems = unbought.slice(0, 7);
    const itemList = topItems.map((i) => `${i.quantityNeeded} ${i.unit} of ${i.name} in ${i.aisle || 'Grocery'}`).join(', ');
    const moreText = unbought.length > 7 ? ` and ${unbought.length - 7} more items.` : '.';

    return {
      action: 'READ_SHOPPING_LIST',
      spokenResponse: `You have ${unbought.length} items remaining to acquire: ${itemList}${moreText}`,
    };
  }

  // 11. Voice Readout: Budget Status
  if (
    text.includes('read budget') ||
    text.includes('what is my budget') ||
    text.includes('how much have i spent') ||
    text.includes('what is the total cost') ||
    text.includes('budget status') ||
    text.includes('how much budget is left')
  ) {
    const target = currentPlan.budget.targetBudget;
    const est = currentPlan.budget.estimatedTotal;
    const diff = Math.abs(target - est);
    const isOver = est > target;

    const speech = isOver
      ? `Your target budget is $${target.toFixed(2)}, and the estimated total is $${est.toFixed(2)}, which is $${diff.toFixed(2)} over budget. You can say 'Swap to Cymbal Essentials' to save 25%.`
      : `Your estimated total is $${est.toFixed(2)} out of your $${target.toFixed(2)} budget. You are currently $${diff.toFixed(2)} under budget.`;

    return {
      action: 'READ_BUDGET',
      spokenResponse: speech,
    };
  }

  // 12. Voice Readout: Next Prep Step
  if (
    text.includes('what should i prep next') ||
    text.includes('read next prep step') ||
    text.includes('what is next on the timeline') ||
    text.includes('prep countdown') ||
    text.includes('next task')
  ) {
    const timeline = currentPlan.prepTimeline || [];
    if (timeline.length === 0) {
      return {
        action: 'READ_PREP_STEP',
        spokenResponse: 'All prep countdown tasks are completed! Enjoy your celebration.',
      };
    }
    const nextTimelineGroup = timeline[0];
    const taskList = nextTimelineGroup.tasks.join(', ');
    return {
      action: 'READ_PREP_STEP',
      spokenResponse: `Upcoming prep tasks for ${nextTimelineGroup.timeframe}: ${taskList}.`,
    };
  }

  // 13. Voice Readout: Menu
  if (
    text.includes('what is on the menu') ||
    text.includes('read menu') ||
    text.includes('read recipes') ||
    text.includes('what are we eating')
  ) {
    const mains = (currentPlan.menu.mains || []).map((m) => m.name).join(', ');
    const apps = (currentPlan.menu.appetizers || []).map((a) => a.name).join(', ');
    const drinks = (currentPlan.menu.drinks || []).map((d) => d.name).join(', ');

    const speech = `On the menu for ${currentPlan.title}: Mains include ${mains || 'Chef selections'}. Appetizers: ${apps || 'Finger foods'}. Drinks: ${drinks || 'Assorted beverages'}.`;
    return {
      action: 'READ_MENU',
      spokenResponse: speech,
    };
  }

  // 14. Ask AI Assistant
  if (
    text.startsWith('ask assistant ') ||
    text.startsWith('ask cymbalmart ') ||
    text.startsWith('hey cymbal ') ||
    text.includes('how many ') ||
    text.includes('what wine ') ||
    text.includes('substitute ') ||
    text.includes('how to prepare ')
  ) {
    const query = text
      .replace(/^ask\s+assistant\s+/i, '')
      .replace(/^ask\s+cymbalmart\s+/i, '')
      .replace(/^hey\s+cymbal\s+/i, '');

    return {
      action: 'ASK_ASSISTANT',
      payload: query,
      spokenResponse: `Consulting CymbalMart Assistant for: "${query}".`,
    };
  }

  // 15. General fallback: Ask CymbalMart Assistant
  return {
    action: 'ASK_ASSISTANT',
    payload: rawTranscript,
    spokenResponse: `I'll ask CymbalMart Assistant: "${rawTranscript}".`,
  };
}
