import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API endpoint: Generate Complete Party & Shopping Plan
  app.post("/api/gemini/generate-party-plan", async (req, res) => {
    try {
      const {
        title,
        eventType,
        theme,
        adults = 15,
        kids = 0,
        durationHours = 4,
        targetBudget = 300,
        currency = "$",
        dietaryRestrictions = [],
        venueType = "Home / Backyard",
        equipment = ["Grill", "Oven", "Stovetop"],
        drinkPreference = "family_mix",
        additionalNotes = "",
        rawPrompt,
      } = req.body;

      const ai = getGeminiClient();

      const promptContext = rawPrompt
        ? `User custom prompt: "${rawPrompt}"\nCreate a comprehensive party plan and fully itemized shopping list.`
        : `Event: ${title || `${eventType} Celebration`}
Type: ${eventType}
Theme/Vibe: ${theme}
Guests: ${adults} adults, ${kids} kids (Total: ${adults + kids})
Duration: ${durationHours} hours
Target Budget: ${currency}${targetBudget}
Dietary Restrictions / Allergies: ${dietaryRestrictions.length ? dietaryRestrictions.join(", ") : "None specified (ensure general appeal)"}
Venue: ${venueType}
Kitchen Equipment available: ${equipment.join(", ")}
Beverage preference: ${drinkPreference}
Additional host notes/requests: ${additionalNotes || "Make it fun, delicious, and easy to host"}`;

      if (!ai) {
        // High quality programmatic fallback if no API key set
        return res.json({
          plan: generateHeuristicPlan({
            title: title || `${eventType || "Celebration"} Gathering`,
            eventType: eventType || "Party",
            theme: theme || "Casual & Fun",
            adults: Number(adults) || 12,
            kids: Number(kids) || 0,
            durationHours: Number(durationHours) || 4,
            targetBudget: Number(targetBudget) || 250,
            currency,
            dietaryRestrictions,
            venueType,
            equipment,
            drinkPreference,
            additionalNotes,
          }),
          source: "heuristic",
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `You are the world's best professional Party Planner & Grocery Shopping Logistics Agent.
Given the following event parameters, generate an exceptional, highly realistic, and complete party blueprint with full itemized shopping list across departments and recommended stores (Costco/Wholesale, Supermarket, Liquor Store, Party Store).

Key requirements:
1. QUANTITY PRECISION: Apply expert culinary and host formulas:
   - Protein: 6-8 oz per adult, 4 oz per kid.
   - Appetizers: 4-6 pieces per person for casual parties, 6-8 for cocktail style.
   - Ice: 1.5 lbs per guest.
   - Drinks: 1.25 standard drinks per adult per hour; 2 non-alcoholic servings per kid/adult.
   - Tableware: 1.5-2 plates/cups per person + trash bags + cocktail napkins.
   - Smart pack sizing: Round up to standard supermarket pack sizes (e.g. 8-pack buns, 12-pack sodas).
2. DIETARY LABELS & REASONABLE OPTIONS: Guarantee dedicated options if vegetarian, vegan, gluten-free, or nut-free are requested.
3. REALISTIC PRICING: Provide reasonable estimated USD prices for every item and category subtotal.
4. ACTIONABLE PREP TIMELINE: Provide 4 distinct milestones (e.g. "3 Days Before", "1 Day Before", "Morning of Party", "30 Minutes Before Guest Arrival").
5. STORE ROUTING: Assign each item to the best store category (e.g., "Wholesale Club (Costco/Sam's)", "Supermarket", "Liquor Store / Beverage Depot", "Party Supply & Dollar Store").

${promptContext}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              eventType: { type: Type.STRING },
              theme: { type: Type.STRING },
              vibeAndNotes: { type: Type.STRING },
              playlistVibe: { type: Type.STRING },
              guestCount: {
                type: Type.OBJECT,
                properties: {
                  adults: { type: Type.INTEGER },
                  kids: { type: Type.INTEGER },
                  total: { type: Type.INTEGER },
                },
                required: ["adults", "kids", "total"],
              },
              durationHours: { type: Type.NUMBER },
              budget: {
                type: Type.OBJECT,
                properties: {
                  targetBudget: { type: Type.NUMBER },
                  currency: { type: Type.STRING },
                  estimatedTotal: { type: Type.NUMBER },
                },
                required: ["targetBudget", "currency", "estimatedTotal"],
              },
              dietaryRestrictions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              venueType: { type: Type.STRING },
              equipment: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    phase: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["time", "phase", "description"],
                },
              },
              menu: {
                type: Type.OBJECT,
                properties: {
                  appetizers: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        servings: { type: Type.INTEGER },
                        dietaryTags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        prepDifficulty: { type: Type.STRING },
                        prepAheadTime: { type: Type.STRING },
                        ingredients: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              quantity: { type: Type.NUMBER },
                              unit: { type: Type.STRING },
                              category: { type: Type.STRING },
                              estimatedCost: { type: Type.NUMBER },
                            },
                            required: ["name", "quantity", "unit", "category", "estimatedCost"],
                          },
                        },
                        quickInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ["id", "name", "description", "servings", "dietaryTags", "prepDifficulty", "ingredients"],
                    },
                  },
                  mains: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        servings: { type: Type.INTEGER },
                        dietaryTags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        prepDifficulty: { type: Type.STRING },
                        prepAheadTime: { type: Type.STRING },
                        ingredients: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              quantity: { type: Type.NUMBER },
                              unit: { type: Type.STRING },
                              category: { type: Type.STRING },
                              estimatedCost: { type: Type.NUMBER },
                            },
                            required: ["name", "quantity", "unit", "category", "estimatedCost"],
                          },
                        },
                        quickInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ["id", "name", "description", "servings", "dietaryTags", "prepDifficulty", "ingredients"],
                    },
                  },
                  sides: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        servings: { type: Type.INTEGER },
                        dietaryTags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        prepDifficulty: { type: Type.STRING },
                        prepAheadTime: { type: Type.STRING },
                        ingredients: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              quantity: { type: Type.NUMBER },
                              unit: { type: Type.STRING },
                              category: { type: Type.STRING },
                              estimatedCost: { type: Type.NUMBER },
                            },
                            required: ["name", "quantity", "unit", "category", "estimatedCost"],
                          },
                        },
                        quickInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ["id", "name", "description", "servings", "dietaryTags", "prepDifficulty", "ingredients"],
                    },
                  },
                  desserts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        servings: { type: Type.INTEGER },
                        dietaryTags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        prepDifficulty: { type: Type.STRING },
                        prepAheadTime: { type: Type.STRING },
                        ingredients: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              quantity: { type: Type.NUMBER },
                              unit: { type: Type.STRING },
                              category: { type: Type.STRING },
                              estimatedCost: { type: Type.NUMBER },
                            },
                            required: ["name", "quantity", "unit", "category", "estimatedCost"],
                          },
                        },
                        quickInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ["id", "name", "description", "servings", "dietaryTags", "prepDifficulty", "ingredients"],
                    },
                  },
                  drinks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        type: { type: Type.STRING },
                        description: { type: Type.STRING },
                        batchServings: { type: Type.INTEGER },
                        alcoholic: { type: Type.BOOLEAN },
                        ingredients: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              quantity: { type: Type.NUMBER },
                              unit: { type: Type.STRING },
                              estimatedCost: { type: Type.NUMBER },
                            },
                            required: ["name", "quantity", "unit", "estimatedCost"],
                          },
                        },
                        batchingInstructions: { type: Type.STRING },
                      },
                      required: ["id", "name", "type", "description", "batchServings", "alcoholic", "ingredients"],
                    },
                  },
                },
                required: ["appetizers", "mains", "sides", "desserts", "drinks"],
              },
              shoppingList: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    quantityNeeded: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    packSizeSuggestion: { type: Type.STRING },
                    estimatedPrice: { type: Type.NUMBER },
                    suggestedStore: { type: Type.STRING },
                    department: { type: Type.STRING },
                    aisle: { type: Type.STRING },
                    brandTier: { type: Type.STRING },
                    notes: { type: Type.STRING },
                    dietaryTag: { type: Type.STRING },
                    checked: { type: Type.BOOLEAN },
                  },
                  required: ["id", "name", "category", "quantityNeeded", "unit", "estimatedPrice", "suggestedStore", "department"],
                },
              },
              budgetBreakdown: {
                type: Type.OBJECT,
                properties: {
                  food: { type: Type.NUMBER },
                  drinks: { type: Type.NUMBER },
                  tablewareAndSupplies: { type: Type.NUMBER },
                  decorations: { type: Type.NUMBER },
                  buffer: { type: Type.NUMBER },
                },
                required: ["food", "drinks", "tablewareAndSupplies", "decorations", "buffer"],
              },
              prepTimeline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timeframe: { type: Type.STRING },
                    tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["timeframe", "tasks"],
                },
              },
              hostTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              "title",
              "eventType",
              "theme",
              "vibeAndNotes",
              "guestCount",
              "durationHours",
              "budget",
              "dietaryRestrictions",
              "venueType",
              "equipment",
              "schedule",
              "menu",
              "shoppingList",
              "budgetBreakdown",
              "prepTimeline",
              "hostTips",
            ],
          },
        },
      });

      const parsedPlan = JSON.parse(response.text || "{}");
      parsedPlan.id = `party_${Date.now()}`;
      parsedPlan.createdAt = new Date().toISOString();
      parsedPlan.updatedAt = new Date().toISOString();

      // Ensure all shopping items have unique IDs and checked: false
      if (Array.isArray(parsedPlan.shoppingList)) {
        parsedPlan.shoppingList = parsedPlan.shoppingList.map((item: any, idx: number) => ({
          ...item,
          id: item.id || `shop_${idx}_${Date.now()}`,
          checked: false,
        }));
      }

      res.json({ plan: parsedPlan, source: "gemini" });
    } catch (err: any) {
      console.error("Gemini plan generation error:", err);
      // Fallback gracefully to high-yield heuristic plan so user never encounters a blank screen
      const fallback = generateHeuristicPlan(req.body);
      res.json({ plan: fallback, source: "fallback_error", error: err.message });
    }
  });

  // API endpoint: Conversational Agent Chat & Plan Refinement
  app.post("/api/gemini/agent-chat", async (req, res) => {
    try {
      const { message, currentPlan, chatHistory = [] } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          reply: `I received your request: "${message}". To unlock full real-time AI reasoning, attach your Gemini API key in Settings > Secrets. In the meantime, you can interactively edit, check off items, and scale your shopping list right here!`,
          planUpdates: null,
        });
      }

      const systemPrompt = `You are "CymbalMart Assistant", the friendly, knowledgeable, and efficient customer service & party planning AI assistant for CymbalMart.
You interact directly with CymbalMart customers and party hosts to help them plan events, find products in CymbalMart Supercenters, navigate physical store aisles, optimize budgets with CymbalMart private brands (Cymbal Essentials, Cymbal Organic, Cymbal Choice), scale recipes, answer store service questions (Curbside Pickup, Express 2-Hour Delivery, Bakery orders), and resolve shopping dilemmas.

CymbalMart Store Knowledge:
- House Brands: "Cymbal Essentials" (unbeatable everyday value), "Cymbal Organic" (USDA certified organic staples), "Cymbal Choice" (curated gourmet & premium imports).
- Standard Supercenter Aisles:
  * Aisle 1: Fresh Produce, Organic Greens, Herbs, Citruses
  * Aisle 2: Artisan Cheeses, Charcuterie, Delicatessen & Prepared Foods
  * Aisle 3: Fresh Bakery, Artisan Breads, Brioche, Custom Celebration Cakes
  * Aisle 6: Pantry, Grains, Marinades, Condiments, Artisan Snacks & Dips
  * Aisle 8: Beverages, Seltzers, Mixers, Juices, Tonic Waters, Craft Soda
  * Aisle 9: Beer, Wine & Spirits (when applicable)
  * Aisle 12: Butcher Counter, Quality Meats, Seafood & Poultry
  * Aisle 14: Party Supplies, Tableware, Eco-Friendly Plates, Cutlery, Balloons, Decor
  * Front Register / Customer Service: Bagged Ice, Propane Exchange, Party Balloons Helium Fill, Curbside Pickup Desk
- Fulfillment Options:
  * Express 2-Hour Delivery ($4.99 or free on $50+ with CymbalMart+)
  * Free Curbside Pickup (Dedicated bays 1-12, ready in under 1 hour)
  * In-Store Self-Guided Scan & Go via mobile app

Active Customer Party Plan Summary:
- Title: ${currentPlan?.title || "Party"}
- Guests: ${currentPlan?.guestCount?.adults || 10} adults, ${currentPlan?.guestCount?.kids || 0} kids (Total: ${currentPlan?.guestCount?.total || 10})
- Budget: ${currentPlan?.budget?.currency || "$"}${currentPlan?.budget?.targetBudget || 200} (Est: ${currentPlan?.budget?.currency || "$"}${currentPlan?.budget?.estimatedTotal || 200})
- Dietary Restrictions: ${currentPlan?.dietaryRestrictions?.join(", ") || "None"}
- Menu Items: ${currentPlan?.menu ? [
        ...(currentPlan.menu.appetizers || []).map((i: any) => i.name),
        ...(currentPlan.menu.mains || []).map((i: any) => i.name),
        ...(currentPlan.menu.sides || []).map((i: any) => i.name),
        ...(currentPlan.menu.desserts || []).map((i: any) => i.name),
      ].join(", ") : "Standard menu"}

Customer Interaction Directives:
1. Always introduce or carry yourself as CymbalMart Assistant. Be cheerful, helpful, polite, and concise.
2. If the customer asks store questions (e.g. aisle locations, store hours, return policy, delivery info), give clear, accurate CymbalMart answers.
3. If the customer asks to modify, scale, add dishes, swap ingredients, trim budget, or adjust for dietary needs, provide a warm explanation AND generate an 'updatedPlan' JSON object matching the full PartyPlan structure.
4. If no shopping plan changes are requested (pure customer question), keep 'updatedPlan' as null.
5. Provide 2-4 quick follow-up prompt suggestions that the customer might want to click next.`;

      const contents = [
        { role: "user", parts: [{ text: `${systemPrompt}\n\nCustomer Request: ${message}` }] },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Host message: "${message}".
Please answer the host's question or execute their requested modifications to the party plan and shopping list.
Return your answer in JSON format with:
- "reply": (string, markdown supported, clear and friendly with bullet points if helpful)
- "updatedPlan": (the entire updated PartyPlan object if modified, or null if it was an informational Q&A)
- "suggestedActions": array of { "label": string, "actionType": "scale_guests" | "adjust_budget" | "add_dietary" | "custom_prompt", "payload": any }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              updatedPlan: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  eventType: { type: Type.STRING },
                  theme: { type: Type.STRING },
                  vibeAndNotes: { type: Type.STRING },
                  playlistVibe: { type: Type.STRING },
                  guestCount: {
                    type: Type.OBJECT,
                    properties: {
                      adults: { type: Type.INTEGER },
                      kids: { type: Type.INTEGER },
                      total: { type: Type.INTEGER },
                    },
                    required: ["adults", "kids", "total"],
                  },
                  durationHours: { type: Type.NUMBER },
                  budget: {
                    type: Type.OBJECT,
                    properties: {
                      targetBudget: { type: Type.NUMBER },
                      currency: { type: Type.STRING },
                      estimatedTotal: { type: Type.NUMBER },
                    },
                    required: ["targetBudget", "currency", "estimatedTotal"],
                  },
                  dietaryRestrictions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  venueType: { type: Type.STRING },
                  equipment: { type: Type.ARRAY, items: { type: Type.STRING } },
                  schedule: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING },
                        phase: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                      required: ["time", "phase", "description"],
                    },
                  },
                  menu: {
                    type: Type.OBJECT,
                    properties: {
                      appetizers: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                      mains: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                      sides: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                      desserts: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                      drinks: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                    },
                    required: ["appetizers", "mains", "sides", "desserts", "drinks"],
                  },
                  shoppingList: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        category: { type: Type.STRING },
                        quantityNeeded: { type: Type.NUMBER },
                        unit: { type: Type.STRING },
                        packSizeSuggestion: { type: Type.STRING },
                        estimatedPrice: { type: Type.NUMBER },
                        suggestedStore: { type: Type.STRING },
                        department: { type: Type.STRING },
                        aisle: { type: Type.STRING },
                        brandTier: { type: Type.STRING },
                        notes: { type: Type.STRING },
                        dietaryTag: { type: Type.STRING },
                        checked: { type: Type.BOOLEAN },
                      },
                      required: ["id", "name", "category", "quantityNeeded", "unit", "estimatedPrice", "suggestedStore", "department"],
                    },
                  },
                  budgetBreakdown: {
                    type: Type.OBJECT,
                    properties: {
                      food: { type: Type.NUMBER },
                      drinks: { type: Type.NUMBER },
                      tablewareAndSupplies: { type: Type.NUMBER },
                      decorations: { type: Type.NUMBER },
                      buffer: { type: Type.NUMBER },
                    },
                    required: ["food", "drinks", "tablewareAndSupplies", "decorations", "buffer"],
                  },
                  prepTimeline: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        timeframe: { type: Type.STRING },
                        tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ["timeframe", "tasks"],
                    },
                  },
                  hostTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
              suggestedActions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    actionType: { type: Type.STRING },
                    payload: { type: Type.STRING },
                  },
                  required: ["label", "actionType"],
                },
              },
            },
            required: ["reply"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed.updatedPlan && currentPlan?.id) {
        parsed.updatedPlan.id = currentPlan.id;
        parsed.updatedPlan.updatedAt = new Date().toISOString();
      }

      res.json({
        reply: parsed.reply,
        updatedPlan: parsed.updatedPlan || null,
        suggestedActions: parsed.suggestedActions || [],
      });
    } catch (err: any) {
      console.error("Agent chat error:", err);
      res.json({
        reply: `I encountered an issue processing that adjustment: ${err.message}. You can manually edit your items and budget while I reconnect!`,
        updatedPlan: null,
      });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Party Planner Shopping Agent running on http://localhost:${PORT}`);
  });
}

// Deterministic Rich Heuristic Plan Generator for instantaneous offline/first-render and fallback experience
function generateHeuristicPlan(input: any) {
  const adults = Number(input.adults) || 12;
  const kids = Number(input.kids) || 0;
  const totalGuests = adults + kids;
  const eventType = input.eventType || "Party";
  const theme = input.theme || "Backyard Summer Celebration";
  const currency = input.currency || "$";
  const targetBudget = Number(input.targetBudget) || 280;

  const isBBQ = eventType.toLowerCase().includes("bbq") || theme.toLowerCase().includes("bbq") || theme.toLowerCase().includes("grill");
  const isKids = kids > 5 || eventType.toLowerCase().includes("kid") || theme.toLowerCase().includes("birthday");

  // Quantity calculations
  const burgerPatties = Math.ceil(adults * 1.5 + kids * 1);
  const bunPacks = Math.ceil(burgerPatties / 8);
  const iceBags = Math.ceil((totalGuests * 1.5) / 10);
  const drinkCans = Math.ceil(adults * 4 + kids * 3);
  const platePacks = Math.ceil((totalGuests * 2) / 25);
  const napkinPacks = Math.ceil((totalGuests * 3) / 50);

  const shoppingItems = [
    {
      id: "shop_1",
      name: isBBQ ? "Cymbal Butcher Prime Ground Beef Patties" : "Cymbal Fresh Marinated Chicken Skewers",
      category: "Meat & Seafood",
      quantityNeeded: Math.ceil(adults * 0.5 + kids * 0.3),
      unit: "lbs",
      packSizeSuggestion: `Approx ${Math.ceil(adults * 0.5 + kids * 0.3)} lbs total (packs of 3-4 lbs)`,
      estimatedPrice: Math.round(totalGuests * 4.5),
      suggestedStore: "CymbalMart Supercenter",
      department: "Meat & Seafood",
      aisle: "Aisle 12 - Butcher Counter",
      brandTier: "Cymbal Choice",
      notes: "Get 80/20 lean-to-fat for juicy flavor on the grill",
      checked: false,
    },
    {
      id: "shop_2",
      name: "Cymbal Plant-Based Burger Patties",
      category: "Plant Protein",
      quantityNeeded: 4,
      unit: "patties",
      packSizeSuggestion: "1 pack of 4 patties",
      estimatedPrice: 8.99,
      suggestedStore: "CymbalMart Supercenter",
      department: "Plant-Based Deli",
      aisle: "Aisle 2 - Plant Deli",
      brandTier: "Cymbal Organic",
      notes: "Dedicated vegetarian/vegan option",
      dietaryTag: "Vegan",
      checked: false,
    },
    {
      id: "shop_3",
      name: "Cymbal Bakery Brioche Burger Buns",
      category: "Bakery & Bread",
      quantityNeeded: bunPacks * 8,
      unit: "buns",
      packSizeSuggestion: `${bunPacks} packs of 8 buns`,
      estimatedPrice: Math.round(bunPacks * 4.29 * 100) / 100,
      suggestedStore: "CymbalMart Supercenter",
      department: "Bakery & Bread",
      aisle: "Aisle 3 - Bakery",
      brandTier: "Cymbal Essentials",
      notes: "Fresh bakery brioche elevates the meal",
      checked: false,
    },
    {
      id: "shop_4",
      name: "Cymbal Choice Sharp Cheddar Slices",
      category: "Dairy & Deli",
      quantityNeeded: 2,
      unit: "packs",
      packSizeSuggestion: "2 packs of 12 slices",
      estimatedPrice: 7.5,
      suggestedStore: "CymbalMart Supercenter",
      department: "Dairy & Deli",
      aisle: "Aisle 2 - Cheese Wall",
      brandTier: "Cymbal Choice",
      checked: false,
    },
    {
      id: "shop_5",
      name: "Cymbal Fresh Romaine & Vine Tomatoes",
      category: "Produce",
      quantityNeeded: 1,
      unit: "bundle",
      packSizeSuggestion: "2 romaine hearts, 4 tomatoes, 2 red onions",
      estimatedPrice: 9.8,
      suggestedStore: "CymbalMart Supercenter",
      department: "Produce",
      aisle: "Aisle 1 - Produce Wall",
      brandTier: "Cymbal Essentials",
      notes: "Wash and slice into a burger toppings platter",
      checked: false,
    },
    {
      id: "shop_6",
      name: "Cymbal Fresh Sweet Corn on the Cob",
      category: "Produce",
      quantityNeeded: totalGuests,
      unit: "ears",
      packSizeSuggestion: `${Math.ceil(totalGuests / 4)} packs of 4 ears`,
      estimatedPrice: Math.round(totalGuests * 0.9),
      suggestedStore: "CymbalMart Supercenter",
      department: "Produce",
      aisle: "Aisle 1 - Fresh Produce",
      brandTier: "Cymbal Essentials",
      notes: "Grill in husks or foil with garlic herb butter",
      checked: false,
    },
    {
      id: "shop_7",
      name: "Cymbal Organic Tortilla Chips & Salsa",
      category: "Pantry & Dry Goods",
      quantityNeeded: 3,
      unit: "bags",
      packSizeSuggestion: "2 large tortilla chip bags + 2 tubs salsa",
      estimatedPrice: 14.5,
      suggestedStore: "CymbalMart Supercenter",
      department: "Pantry & Dry Goods",
      aisle: "Aisle 6 - Snacks & Chips",
      brandTier: "Cymbal Organic",
      checked: false,
    },
    {
      id: "shop_8",
      name: "Cymbal Sparkling Seltzers & Soda (24-pk)",
      category: "Beverages & Mixers",
      quantityNeeded: drinkCans,
      unit: "cans/bottles",
      packSizeSuggestion: `${Math.ceil(drinkCans / 12)} variety 12-packs`,
      estimatedPrice: Math.round(drinkCans * 0.75),
      suggestedStore: "CymbalMart Supercenter",
      department: "Beverages & Mixers",
      aisle: "Aisle 8 - Beverages",
      brandTier: "Cymbal Essentials",
      checked: false,
    },
    {
      id: "shop_9",
      name: "CymbalMart Party Ice Bags (10 lb)",
      category: "Ice",
      quantityNeeded: iceBags * 10,
      unit: "lbs",
      packSizeSuggestion: `${iceBags} bags of 10 lbs ice`,
      estimatedPrice: iceBags * 3.25,
      suggestedStore: "CymbalMart Supercenter",
      department: "Ice",
      aisle: "Front Entrance Freezer",
      brandTier: "Cymbal Essentials",
      notes: "1 bag for drink coolers, 1 bag for serving bucket",
      checked: false,
    },
    {
      id: "shop_10",
      name: "Cymbal Heavy-Duty Compostable Plates",
      category: "Tableware & Disposables",
      quantityNeeded: platePacks * 25,
      unit: "plates",
      packSizeSuggestion: `${platePacks} packs of 25 heavy-duty plates`,
      estimatedPrice: Math.round(platePacks * 7.99 * 100) / 100,
      suggestedStore: "CymbalMart Supercenter",
      department: "Tableware & Disposables",
      aisle: "Aisle 14 - Party Supplies",
      brandTier: "Cymbal Essentials",
      checked: false,
    },
    {
      id: "shop_11",
      name: "Cymbal Paper Napkins & Heavy Duty Bags",
      category: "Tableware & Disposables",
      quantityNeeded: napkinPacks * 50,
      unit: "napkins",
      packSizeSuggestion: `${napkinPacks} packs napkins + 1 box contractor trash bags`,
      estimatedPrice: 11.5,
      suggestedStore: "CymbalMart Supercenter",
      department: "Tableware & Disposables",
      aisle: "Aisle 14 - Party Supplies",
      brandTier: "Cymbal Essentials",
      checked: false,
    },
    {
      id: "shop_12",
      name: "Festive String Lights & Table Decor",
      category: "Decorations & Balloons",
      quantityNeeded: 1,
      unit: "kit",
      packSizeSuggestion: "Themed table cloth + ambient lighting kit",
      estimatedPrice: 18.0,
      suggestedStore: "CymbalMart Supercenter",
      department: "Decorations & Balloons",
      aisle: "Aisle 15 - Party & Patio",
      brandTier: "Cymbal Choice",
      checked: false,
    },
  ];

  const estimatedTotal = shoppingItems.reduce((acc, item) => acc + item.estimatedPrice, 0);

  return {
    id: `party_${Date.now()}`,
    title: input.title || `${theme} Gathering`,
    eventType,
    theme,
    vibeAndNotes: `An upbeat, effortless party featuring crowd-pleasing grilled favorites, refreshing signature drink bar, and seamless host staging.`,
    playlistVibe: "Upbeat summer acoustic, indie pop & classic groove classics",
    guestCount: {
      adults,
      kids,
      total: totalGuests,
    },
    durationHours: Number(input.durationHours) || 4,
    budget: {
      targetBudget,
      currency,
      estimatedTotal: Math.round(estimatedTotal),
    },
    dietaryRestrictions: input.dietaryRestrictions || ["Vegetarian options available"],
    venueType: input.venueType || "Backyard & Patio",
    equipment: input.equipment || ["BBQ Grill", "Coolers", "Oven"],
    schedule: [
      { time: "0:00 (Arrival)", phase: "Welcome & Appetizers", description: "Guests arrive, signature welcome punch & chips with salsa and guacamole ready." },
      { time: "+1:15", phase: "Main Grill Service", description: "Hot burgers, sausages, grilled corn and fresh side salads served buffet style." },
      { time: "+2:30", phase: "Lawn Games & Mingling", description: "Cornhole, music volume up, dessert station setup." },
      { time: "+3:30", phase: "Dessert & S'mores", description: "Warm cookies, berry crumble, coffee & tea service." },
      { time: "+4:00", phase: "Farewell", description: "Leftover pack-up station & host wind-down." },
    ],
    menu: {
      appetizers: [
        {
          id: "app_1",
          name: "Fiesta Guacamole & Fire-Roasted Salsa Platter",
          description: "Fresh avocados mashed with lime, cilantro, and sea salt served with warm tortilla chips.",
          servings: totalGuests,
          dietaryTags: ["Vegan", "Gluten-Free"],
          prepDifficulty: "Easy",
          prepAheadTime: "2 hours before",
          ingredients: [
            { name: "Ripe Avocados", quantity: 6, unit: "pieces", category: "Produce", estimatedCost: 7.5 },
            { name: "Limes & Fresh Cilantro", quantity: 1, unit: "bunch", category: "Produce", estimatedCost: 3.0 },
            { name: "Tortilla Chips", quantity: 2, unit: "bags", category: "Pantry & Dry Goods", estimatedCost: 7.0 },
          ],
          quickInstructions: ["Mash avocados with lime juice and salt.", "Fold in diced onions and cilantro.", "Serve immediately in a wide bowl with crisp chips."],
        },
      ],
      mains: [
        {
          id: "main_1",
          name: "Gourmet Smash Cheeseburgers & BBQ Skewers",
          description: "Juicy seared patties topped with aged cheddar, caramelized onions, and house burger sauce.",
          servings: adults,
          dietaryTags: [],
          prepDifficulty: "Medium",
          prepAheadTime: "Day before (patty forming)",
          ingredients: [
            { name: "Ground Chuck 80/20", quantity: 6, unit: "lbs", category: "Meat & Seafood", estimatedCost: 28.0 },
            { name: "Brioche Buns", quantity: 16, unit: "buns", category: "Bakery & Bread", estimatedCost: 8.5 },
            { name: "Aged Cheddar Slices", quantity: 16, unit: "slices", category: "Dairy & Deli", estimatedCost: 5.5 },
          ],
          quickInstructions: ["Preheat grill/griddle to high.", "Sear patties 2-3 mins per side until charred crust forms.", "Top with cheese, cover for 30s to melt, serve on toasted buns."],
        },
        {
          id: "main_2",
          name: "Grilled Portobello & Beyond Plant Burgers",
          description: "Marinated balsamic portobello mushrooms and plant patties with avocado.",
          servings: 4,
          dietaryTags: ["Vegetarian", "Vegan"],
          prepDifficulty: "Easy",
          ingredients: [
            { name: "Beyond Meat Patties", quantity: 4, unit: "patties", category: "Plant Protein", estimatedCost: 8.99 },
            { name: "Portobello Mushroom Caps", quantity: 4, unit: "caps", category: "Produce", estimatedCost: 6.0 },
          ],
          quickInstructions: ["Brush mushrooms with balsamic and olive oil.", "Grill 4 mins per side.", "Assemble on toasted buns."],
        },
      ],
      sides: [
        {
          id: "side_1",
          name: "Charred Street Corn with Cotija & Lime",
          description: "Sweet corn grilled in husks, brushed with chili-lime crema and cotija cheese.",
          servings: totalGuests,
          dietaryTags: ["Vegetarian", "Gluten-Free"],
          prepDifficulty: "Easy",
          ingredients: [
            { name: "Sweet Yellow Corn", quantity: 12, unit: "ears", category: "Produce", estimatedCost: 9.0 },
            { name: "Cotija Cheese & Lime", quantity: 1, unit: "pack", category: "Dairy & Deli", estimatedCost: 4.5 },
          ],
          quickInstructions: ["Grill corn directly over coals until lightly charred.", "Brush with lime mayo/crema and sprinkle with cotija."],
        },
        {
          id: "side_2",
          name: "Summer Berry & Cucumber Arugula Salad",
          description: "Crisp greens tossed with strawberries, sliced cucumbers, candied pecans, and lemon vinaigrette.",
          servings: totalGuests,
          dietaryTags: ["Vegan", "Gluten-Free"],
          prepDifficulty: "Easy",
          ingredients: [
            { name: "Baby Arugula & Spinach", quantity: 2, unit: "tubs", category: "Produce", estimatedCost: 7.0 },
            { name: "Fresh Strawberries & Cucumber", quantity: 2, unit: "pints", category: "Produce", estimatedCost: 6.5 },
          ],
          quickInstructions: ["Toss greens with sliced fruit.", "Dress with vinaigrette right before service."],
        },
      ],
      desserts: [
        {
          id: "des_1",
          name: "Warm Salted Butterscotch Chocolate Chip Cookies",
          description: "Freshly baked bakery-style cookies with Maldon sea salt flakes.",
          servings: totalGuests + 4,
          dietaryTags: ["Vegetarian"],
          prepDifficulty: "Easy",
          ingredients: [
            { name: "Cookie Dough / Bakery Mix", quantity: 2, unit: "dozen", category: "Bakery & Bread", estimatedCost: 8.5 },
          ],
          quickInstructions: ["Bake at 350F for 11 mins.", "Sprinkle sea salt while warm."],
        },
      ],
      drinks: [
        {
          id: "drk_1",
          name: "Sparkling Citrus Hibiscus Party Punch (Pitcher/Bowl)",
          type: "Punch",
          description: "Crisp hibiscus herbal tea brewed and mixed with sparkling lemonade and fresh citrus wheels.",
          batchServings: 20,
          alcoholic: false,
          ingredients: [
            { name: "Hibiscus Tea Bags", quantity: 6, unit: "bags", estimatedCost: 3.5 },
            { name: "Sparkling Lemonade", quantity: 3, unit: "liters", estimatedCost: 5.5 },
            { name: "Fresh Oranges & Lemons", quantity: 4, unit: "fruits", estimatedCost: 3.5 },
          ],
          batchingInstructions: "Brew 4 cups strong hibiscus tea ahead and chill. In a large punch dispenser, combine chilled tea, sparkling lemonade, and sliced citrus over ice. Add optional gin/vodka on the side for guests!",
        },
      ],
    },
    shoppingList: shoppingItems,
    budgetBreakdown: {
      food: Math.round(estimatedTotal * 0.55),
      drinks: Math.round(estimatedTotal * 0.22),
      tablewareAndSupplies: Math.round(estimatedTotal * 0.13),
      decorations: Math.round(estimatedTotal * 0.06),
      buffer: Math.round(estimatedTotal * 0.04),
    },
    prepTimeline: [
      {
        timeframe: "3 Days Before",
        tasks: [
          "Confirm guest RSVPs and any final allergy notices.",
          "Order bulk paper supplies and decorations online or visit party store.",
          "Check propane tank or charcoal supply.",
        ],
      },
      {
        timeframe: "1 Day Before",
        tasks: [
          "Supermarket grocery run for fresh meats, produce, and bakery buns.",
          "Shape hamburger patties and store between parchment sheets in fridge.",
          "Brew hibiscus punch base and chill in pitcher.",
          "Set up patio tables, chairs, and string lights.",
        ],
      },
      {
        timeframe: "Morning of Event (3-4 hours prior)",
        tasks: [
          "Pick up party ice bags and load drink coolers.",
          "Slice tomatoes, onions, lettuce, and prep toppings tray.",
          "Mix guacamole and set out serving bowls.",
          "Queue up party playlist and check Bluetooth speakers.",
        ],
      },
      {
        timeframe: "30 Minutes Before Arrival",
        tasks: [
          "Pour punch into serving dispenser with fresh ice and citrus wheels.",
          "Fire up grill to pre-heat grates.",
          "Set out chips and dips on the welcome table.",
          "Light candles or patio torches.",
        ],
      },
    ],
    hostTips: [
      "Keep a dedicated 'Vegetarian / Gluten-Free' grill zone or foil sheet so there is zero cross-contamination.",
      "Pre-chill all canned drinks in ice water with a sprinkle of salt—it cools warm drinks in under 15 minutes!",
      "Put two trash cans in obvious spots (one for trash, one for recyclables) so your yard stays spotless.",
      "Prep 15% extra buns and ice—they're cheap and the #1 items parties run out of!",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

startServer();
