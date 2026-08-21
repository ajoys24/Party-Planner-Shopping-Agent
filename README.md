# 🎉 CymbalMart Party Planner & AI Shopping Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0+-38B2AC.svg)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Google%20Gen%20AI-Gemini%202.5-orange.svg)](https://ai.google.dev/)

![CymbalMart Party Planner & AI Shopping Agent Preview](./assets/party_shopping_agent.png)

An end-to-end, AI-powered party planning and grocery procurement application built for hosts and shoppers. **CymbalMart Party Planner** translates high-level celebration concepts into fully costed, recipe-accurate culinary blueprints, aisle-by-aisle physical shopping lists, real-time budget recalculation, conversational AI assistance, hands-free voice control, and one-click express fulfillment.

Repository: [https://github.com/ajoys24/Party-Planner-Shopping-Agent](https://github.com/ajoys24/Party-Planner-Shopping-Agent)

---

## 🌟 Key Features

### 1. 🤖 AI Event Blueprint Generation (Gemini 2.5)
- **Concept to Full Blueprint**: Enter an event type (e.g. *Taco Night, Summer BBQ, Milestone Birthday, Mediterranean Dinner*), guest counts (adults & kids), duration, dietary preferences, and target budget.
- **Structured Outputs**: Automatically generates:
  - Curated menu with appetizers, mains, desserts, and signature drinks.
  - Step-by-step culinary preparation instructions and batch scaling formulas.
  - Itemized grocery procurement list matched to actual retail packaging sizes.
  - Departmental budget allocations (Food, Drinks, Tableware, Decor, Contingency buffer).
  - T-Minus prep timeline (2 days before, 1 day before, day-of countdown, and 30 minutes before arrival).

### 2. 🛒 Interactive Shopping Docket & Store Aisle Mapping
- **Physical Supercenter Aisle Routing**: Groups items by store aisle (*Aisle 1 - Produce, Aisle 2 - Deli, Aisle 3 - Bakery, Aisle 6 - Pantry, Aisle 8 - Beverages, Aisle 12 - Butcher Counter, Aisle 14 - Party Supplies*).
- **Brand Tier Hierarchy & Value Optimization**:
  - **Cymbal Essentials**: Unbeatable everyday value tier.
  - **Cymbal Organic**: Certified organic produce & pantry items.
  - **Cymbal Choice**: Premium artisanal butcher cuts & cheeses.
  - **National Brands**: Standard retail items.
- **1-Click Budget Optimization**: Bulk-convert eligible national brands to *Cymbal Essentials* to automatically trim grocery bills by ~25%.

### 3. ⚡ Live Automatic Budget Recalculation
- Adjust quantities, inline prices, brand tiers, or delete items with real-time recalculation of `budget.estimatedTotal`, department allocations, per-guest costs, and visual utilization gauges.
- Add custom products with instant category and aisle inference.

### 4. 🎙️ Hands-Free Voice Control & Audio Readouts (TTS)
- **Continuous Hands-Free Mode**: Cook or navigate store aisles hands-free without tapping buttons.
- **Spoken Actions Supported**:
  - *"Plan a taco fiesta for 15 guests with $150 budget"*
  - *"Add 2 packs of limes"* / *"Add 5 bags of ice"*
  - *"Mark ground beef as bought"* / *"Check off tortilla chips"*
  - *"Optimize budget with Cymbal Essentials"*
  - *"Read my shopping list"* (Speaks unacquired items & aisle locations aloud)
  - *"What is my total cost?"* (Speaks estimated total, budget, and variance)
  - *"What should I prep next?"* (Speaks upcoming countdown task)
  - *"Start checkout"* / *"Select curbside pickup"* / *"Place order"*

### 5. 💬 CymbalMart Assistant Chatbot
- Context-aware shopping & party concierge grounded in the active party plan and store inventory.
- Answers questions about wine pairings, ingredient substitutions, allergy alternatives, and batch cocktail math.
- Directly modifies and synchronizes the active plan via structured AI tool updates.

### 6. 🚚 Multi-Channel Fulfillment & Checkout
- **Free Curbside Pickup**: Dedicated bays 1–12 with vehicle make/color check-in and 1-hour time slot reservation.
- **Express 2-Hour Delivery**: Direct delivery with driver drop-off instructions.
- **In-Store Shopping Walkthrough**: Interactive checklist mode optimized for in-store navigation.
- **Receipt & Checklist Export**: Export to Markdown or copyable grocery lists.

---

## 🛠️ Architecture & Tech Stack

```
Party-Planner-Shopping-Agent/
├── server.ts                   # Express.js backend with Google Gen AI SDK (Gemini 2.5)
├── src/
│   ├── App.tsx                 # Primary state management & tab navigation
│   ├── main.tsx                # React root entrypoint
│   ├── types.ts                # TypeScript interfaces for PartyPlan, ShoppingItem, Menu, etc.
│   ├── components/
│   │   ├── Header.tsx                  # App bar, issue selector, voice trigger, & quick actions
│   │   ├── BlueprintOverview.tsx       # Section 01: Event overview & blueprint highlights
│   │   ├── ShoppingListSection.tsx     # Section 02: Interactive shopping docket & aisle router
│   │   ├── MenuAndRecipesSection.tsx   # Section 03: Recipe cards, yield scaler, & instructions
│   │   ├── BudgetAndLogisticsSection.tsx # Section 04: Budget breakdown & per-guest ratios
│   │   ├── PrepTimelineSection.tsx     # Section 05: Countdown timeline from T-48h to party time
│   │   ├── CheckoutModal.tsx           # Express delivery, Curbside pickup, & In-store checkout
│   │   ├── AgentChatDrawer.tsx         # CymbalMart Assistant conversational interface
│   │   ├── VoiceControlBar.tsx         # Floating dock for voice recognition & controls
│   │   ├── VoiceHelpModal.tsx          # Categorized voice commands manual
│   │   ├── NewPartyModal.tsx           # Event creation modal
│   │   └── ExportModal.tsx             # Printable / exportable plan formats
│   ├── hooks/
│   │   └── useVoiceControl.ts          # Web Speech API hook for STT & continuous listening
│   └── utils/
│       ├── budget.ts                   # Budget and department recalculation utilities
│       ├── voiceParser.ts              # Natural language voice command parser
│       ├── voiceSpeech.ts              # SpeechSynthesis (TTS) audio narration engine
│       └── storage.ts                  # LocalStorage persistence manager
├── package.json
├── tsconfig.json
├── vite.config.ts
└── metadata.json
```

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, tsx, esbuild.
- **AI Integration**: `@google/genai` (Google Gen AI TypeScript SDK) calling `gemini-2.5-flash`.
- **Speech APIs**: Web Speech Recognition API (`webkitSpeechRecognition`) + HTML5 SpeechSynthesis.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or bun
- A Google Gemini API Key ([Get one at Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/ajoys24/Party-Planner-Shopping-Agent.git
cd Party-Planner-Shopping-Agent
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

*(You can refer to `.env.example` as a template)*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🗣️ Voice Commands Cheatsheet

| Category | Example Voice Command | Action |
| :--- | :--- | :--- |
| **Party Creation** | *"Plan a taco fiesta for 15 guests with $150 budget"* | Generates full AI blueprint |
| **Add Groceries** | *"Add 2 packs of organic limes"* | Adds item with aisle & cost |
| **Check Items** | *"Mark ground beef as bought"* / *"Check off chips"* | Checks item off list |
| **Budget Savings** | *"Optimize budget with Cymbal Essentials"* | Swaps to house brand (-25%) |
| **Audio Readout** | *"Read my shopping list"* | Speaks unbought items & aisles |
| **Financials** | *"What is my total cost?"* | Speaks budget metrics & balance |
| **Timeline Task** | *"What should I prep next?"* | Speaks next countdown step |
| **Navigation** | *"Show shopping list"* / *"Show menu"* | Switches active tab |
| **Checkout** | *"Start checkout"* / *"Select curbside pickup"* | Selects fulfillment & orders |

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
