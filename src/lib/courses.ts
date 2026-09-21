export type BillingType = "one_time" | "monthly";

export interface Course {
  id: string;
  tier: string;
  title: string;
  focus: string;
  modules: string[];
  priceLabel: string;
  amountPaise: number; // authoritative price, in paise (INR * 100)
  billing: BillingType;
  accent: "bull" | "amber" | "violet";
}

// Single source of truth for pricing. The /api/checkout route looks up
// amountPaise from here by id — it never trusts a price sent from the
// client — so this file is the only place a price change needs to happen.
export const COURSES: Course[] = [
  {
    id: "level-1-foundation",
    tier: "Level 1: Foundation",
    title: "Intraday & Basic Setup",
    focus: "5-Hour Class",
    modules: [
      "Primary vs Secondary Markets",
      "SEBI guidelines",
      "NIFTY50 / SENSEX indices",
      "DOW Theory",
      "Breakout / Breakdown patterns",
      "Candlestick anatomy",
      "Support & Resistance",
    ],
    priceLabel: "₹6,000",
    amountPaise: 600000,
    billing: "one_time",
    accent: "bull",
  },
  {
    id: "level-2-technicals",
    tier: "Level 2: Technicals",
    title: "Golden Candlesticks & Strategy",
    focus: "Advanced chart reading",
    modules: [
      "14 Secret Golden Candlesticks (Indecision, Trend Reversals, Breakouts)",
      "Multi-bagger stock selection",
      "FII / DII tracking",
      "NSE Heatmaps",
      "Live Back-Chart Analysis",
    ],
    priceLabel: "₹8,000",
    amountPaise: 800000,
    billing: "one_time",
    accent: "bull",
  },
  {
    id: "option-selling-mastery",
    tier: "Option Selling Mastery",
    title: "Premium-Decay Focus",
    focus: "10 Modules",
    modules: [
      "Margin / SPAN optimization",
      "Open Interest analysis",
      "Option Greeks",
      "Bullish / Bearish spreads",
      "Sideways straddles / strangles",
      "Risk management",
    ],
    priceLabel: "Premium Tier",
    amountPaise: 1200000,
    billing: "one_time",
    accent: "amber",
  },
  {
    id: "level-3-4-fno-pro",
    tier: "Level 3 & 4: F&O Pro",
    title: "Advanced Derivatives",
    focus: "Includes 2 live post-course market sessions",
    modules: [
      "Futures & Options deep-dive",
      "Option Greeks",
      "Moneyness (ITM / ATM / OTM)",
      "Price Action",
      "Upstox Order Placement",
      "2 Live Post-Course Market Sessions",
    ],
    priceLabel: "₹15,000",
    amountPaise: 1500000,
    billing: "one_time",
    accent: "violet",
  },
  {
    id: "long-term-wealth",
    tier: "Long-Term Wealth",
    title: "ETF & Compounding",
    focus: "Monthly plan",
    modules: [
      "Introduction to ETFs",
      "Power of Compounding",
      "SIP Strategies",
      "Portfolio Allocation",
      "Tax Planning",
      "20-Year Wealth Blueprint",
    ],
    priceLabel: "₹2,000 / month",
    amountPaise: 200000,
    billing: "monthly",
    accent: "violet",
  },
];

export function getCourseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}
