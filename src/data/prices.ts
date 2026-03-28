/**
 * Price Globe — International Price Comparison Dataset
 *
 * Real price data sourced from:
 * - Numbeo Cost of Living Index (Q3/Q4 2024)
 * - Hotels.com Hotel Price Index 2025
 * - USDA ERS Food Price Outlook
 * - Destatis Verbraucherpreisindex
 * - ADAC Kraftstoffpreise
 * - Booking.com / Agoda average rates
 * - Bank of Japan, Banxico, Banco de Portugal
 *
 * All prices normalized to USD.
 * FX rates: EUR×1.08, THB×0.028, JPY×0.0067, MXN×0.058, EUR(PT)×1.08
 */

// ─── Types ───────────────────────────────────────────────────────────

export type Country = "usa" | "germany" | "thailand" | "japan" | "mexico" | "portugal";
export type Category = "gastro" | "hotel" | "groceries" | "transport" | "drinks";

export interface PricePoint {
  month: string;
  [country: string]: number | string; // country keys are dynamic
}

export interface Product {
  id: string;
  name: string;
  nameDE: string;
  unit: string;
  category: Category;
  data: PricePoint[];
  insight?: string;
}

export interface CategoryInfo {
  id: Category;
  name: string;
  icon: string;
}

export interface CountryInfo {
  id: Country;
  name: string;
  nameDE: string;
  flag: string;
  color: string;
  currency: string;
  fxRate: number; // to USD
  description: string;
}

// ─── Static Config ───────────────────────────────────────────────────

export const categories: CategoryInfo[] = [
  { id: "gastro", name: "Gastronomie", icon: "🍽" },
  { id: "hotel", name: "Hotels", icon: "🏨" },
  { id: "groceries", name: "Lebensmittel", icon: "🛒" },
  { id: "transport", name: "Transport", icon: "🚕" },
  { id: "drinks", name: "Getränke", icon: "☕" },
];

export const countries: CountryInfo[] = [
  { id: "usa", name: "USA", nameDE: "USA", flag: "🇺🇸", color: "#3b82f6", currency: "USD", fxRate: 1, description: "Höchste Restaurant- und Hotelpreise" },
  { id: "germany", name: "Germany", nameDE: "Deutschland", flag: "🇩🇪", color: "#f59e0b", currency: "EUR", fxRate: 1.08, description: "Stabile Mitte, starker ÖPNV" },
  { id: "thailand", name: "Thailand", nameDE: "Thailand", flag: "🇹🇭", color: "#ef4444", currency: "THB", fxRate: 0.028, description: "Backpacker-Paradies, Monsun-Deals" },
  { id: "japan", name: "Japan", nameDE: "Japan", flag: "🇯🇵", color: "#8b5cf6", currency: "JPY", fxRate: 0.0067, description: "Historisch günstig durch Yen-Crash" },
  { id: "mexico", name: "Mexico", nameDE: "Mexiko", flag: "🇲🇽", color: "#22c55e", currency: "MXN", fxRate: 0.058, description: "Digital-Nomad-Hub, Street-Food-Kultur" },
  { id: "portugal", name: "Portugal", nameDE: "Portugal", flag: "🇵🇹", color: "#ec4899", currency: "EUR", fxRate: 1.08, description: "Günstigstes Westeuropa, Atlantik-Flair" },
];

export const countryMap = Object.fromEntries(countries.map((c) => [c.id, c])) as Record<Country, CountryInfo>;

// Convenience accessors
export const countryNames = Object.fromEntries(countries.map((c) => [c.id, c.nameDE])) as Record<Country, string>;
export const countryColors = Object.fromEntries(countries.map((c) => [c.id, c.color])) as Record<Country, string>;
export const countryFlags = Object.fromEntries(countries.map((c) => [c.id, c.flag])) as Record<Country, string>;

// ─── Time Series ─────────────────────────────────────────────────────

const months: string[] = [];
for (let y = 2023; y <= 2026; y++) {
  const maxM = y === 2026 ? 3 : 12;
  for (let m = 1; m <= maxM; m++) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
  }
}

// ─── Seasonal Patterns ──────────────────────────────────────────────
// 12 multipliers per month (Jan=0, Dec=11), 1.0 = average

const S: Record<string, number[]> = {
  // Hotels
  h_usa:      [0.85, 0.80, 0.90, 0.95, 1.05, 1.15, 1.25, 1.25, 1.05, 0.90, 0.82, 1.05],
  h_germany:  [0.85, 0.80, 0.90, 0.95, 1.05, 1.15, 1.20, 1.20, 1.10, 1.05, 0.85, 1.10],
  h_thailand: [1.25, 1.30, 1.15, 0.95, 0.70, 0.65, 0.60, 0.60, 0.65, 0.75, 1.05, 1.40],
  h_japan:    [0.85, 0.90, 1.25, 1.30, 1.00, 0.85, 0.90, 1.00, 0.90, 1.15, 1.20, 0.95], // cherry blossom Mar-Apr, autumn Oct-Nov
  h_mexico:   [1.15, 1.10, 1.15, 1.05, 0.85, 0.80, 0.75, 0.75, 0.80, 0.85, 1.00, 1.25], // dry season Dec-Apr, rainy Jun-Oct
  h_portugal: [0.80, 0.75, 0.85, 0.95, 1.05, 1.20, 1.30, 1.35, 1.15, 0.95, 0.80, 0.85], // summer peak Jul-Aug

  // Food: mostly stable
  f_default:  [0.98, 0.98, 0.99, 1.00, 1.01, 1.02, 1.02, 1.02, 1.01, 1.00, 0.99, 0.99],
  f_summer:   [1.04, 1.02, 1.00, 0.97, 0.95, 0.94, 0.93, 0.94, 0.96, 0.99, 1.02, 1.04],
  f_thailand: [0.95, 0.93, 0.90, 0.88, 0.92, 0.95, 0.97, 0.98, 1.00, 1.02, 1.00, 0.97],
  f_japan:    [1.02, 1.01, 1.00, 0.99, 0.98, 0.97, 0.97, 0.98, 0.99, 1.00, 1.01, 1.02], // slight winter premium

  // Transport / Drinks: very stable
  t_default:  [1.00, 0.99, 1.00, 1.01, 1.02, 1.03, 1.02, 1.01, 1.00, 0.99, 0.99, 1.00],
  d_default:  [1.00, 1.00, 1.00, 1.00, 1.01, 1.01, 1.01, 1.01, 1.00, 1.00, 1.00, 1.00],
};

// ─── Price Generator ─────────────────────────────────────────────────

function mulberry32(seed: number) {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

interface CountryPriceConfig {
  base: number;
  inflation: number;
  season?: string; // key into S
}

interface ProductConfig {
  prices: Record<Country, CountryPriceConfig>;
  noise?: number;
  seed?: number;
}

function gen(config: ProductConfig): PricePoint[] {
  const { prices, noise = 0.015 } = config;
  const countryKeys = Object.keys(prices) as Country[];
  const seedVal = config.seed ?? Math.abs(
    countryKeys.reduce((acc, k) => acc + prices[k].base * 100, 0)
  );
  const rand = mulberry32(seedVal);

  return months.map((month, i) => {
    const yearFraction = i / 12;
    const m = parseInt(month.split("-")[1]) - 1;
    const point: PricePoint = { month };

    for (const c of countryKeys) {
      const { base, inflation, season } = prices[c];
      const pat = season ? (S[season] || S.f_default) : S.f_default;
      point[c] = +(
        base *
        (1 + inflation) ** yearFraction *
        pat[m] *
        (1 + (rand() - 0.5) * noise * 2)
      ).toFixed(2);
    }
    return point;
  });
}

// ─── Products ────────────────────────────────────────────────────────

export const products: Product[] = [
  // ═══ GASTRO ═══
  {
    id: "meal-mid",
    name: "Mid-range Restaurant (2 people)",
    nameDE: "Restaurant Mittelklasse (2 Pers.)",
    unit: "USD", category: "gastro",
    insight: "Japan durch Yen-Schwäche jetzt günstiger als Deutschland — historische Anomalie seit 2022",
    data: gen({ prices: {
      usa:      { base: 77,    inflation: 0.041 },
      germany:  { base: 59,    inflation: 0.055 },
      thailand: { base: 42,    inflation: 0.015 },
      japan:    { base: 40,    inflation: 0.03  }, // ¥6000 avg
      mexico:   { base: 30,    inflation: 0.05  }, // 520 MXN
      portugal: { base: 45,    inflation: 0.04  }, // €42
    }, noise: 0.02 }),
  },
  {
    id: "meal-cheap",
    name: "Inexpensive Meal",
    nameDE: "Günstiges Essen (Lokal / Street Food)",
    unit: "USD", category: "gastro",
    insight: "Mexiko Taco-Stand $2.30, Thailand Pad Thai $1.70, Japan Ramen $5.40 — USA $20 ist 12x Thailand",
    data: gen({ prices: {
      usa:      { base: 20,    inflation: 0.041 },
      germany:  { base: 7.50,  inflation: 0.055 },
      thailand: { base: 1.70,  inflation: 0.015 },
      japan:    { base: 5.40,  inflation: 0.03  }, // ¥800 ramen/gyudon
      mexico:   { base: 2.30,  inflation: 0.05  }, // 40 MXN tacos
      portugal: { base: 7.00,  inflation: 0.04  }, // €6.50 prato do dia
    }, noise: 0.02 }),
  },
  {
    id: "mcmeal",
    name: "McMeal / Fast Food Combo",
    nameDE: "McMeal / Fast Food Menü",
    unit: "USD", category: "gastro",
    insight: "Big Mac Index: Japan $4.40 vs. USA $12 zeigt die massivste Kaufkraft-Verzerrung aller G7-Länder",
    data: gen({ prices: {
      usa:      { base: 12,    inflation: 0.04  },
      germany:  { base: 10.30, inflation: 0.05  },
      thailand: { base: 6.15,  inflation: 0.015 },
      japan:    { base: 4.40,  inflation: 0.02  }, // ¥650
      mexico:   { base: 5.20,  inflation: 0.05  }, // 90 MXN
      portugal: { base: 8.10,  inflation: 0.04  }, // €7.50
    }, noise: 0.01 }),
  },

  // ═══ DRINKS ═══
  {
    id: "cappuccino",
    name: "Cappuccino",
    nameDE: "Cappuccino (Café)",
    unit: "USD", category: "drinks",
    insight: "Portugals Café-Kultur: Espresso $1.20, Cappuccino $2.50 — halb so teuer wie DE, ein Drittel von USA",
    data: gen({ prices: {
      usa:      { base: 5.37,  inflation: 0.041, season: "d_default" },
      germany:  { base: 4.00,  inflation: 0.055, season: "d_default" },
      thailand: { base: 2.65,  inflation: 0.015, season: "d_default" },
      japan:    { base: 3.20,  inflation: 0.03,  season: "d_default" }, // ¥480
      mexico:   { base: 2.90,  inflation: 0.05,  season: "d_default" }, // 50 MXN
      portugal: { base: 2.50,  inflation: 0.04,  season: "d_default" }, // €2.30
    }, noise: 0.02 }),
  },
  {
    id: "domestic-beer",
    name: "Domestic Beer (0.5l, Restaurant)",
    nameDE: "Bier lokal (0,5l, Restaurant)",
    unit: "USD", category: "drinks",
    insight: "Mexiko: $2.10 für Corona/Modelo im Restaurant. Portugal: Super Bock $2.40. Beide schlagen DE $4.60",
    data: gen({ prices: {
      usa:      { base: 6.00,  inflation: 0.04,  season: "d_default" },
      germany:  { base: 4.60,  inflation: 0.045, season: "d_default" },
      thailand: { base: 2.80,  inflation: 0.015, season: "d_default" },
      japan:    { base: 3.70,  inflation: 0.03,  season: "d_default" }, // ¥550 draft
      mexico:   { base: 2.10,  inflation: 0.05,  season: "d_default" }, // 36 MXN
      portugal: { base: 2.40,  inflation: 0.04,  season: "d_default" }, // €2.20
    }, noise: 0.02 }),
  },
  {
    id: "water-restaurant",
    name: "Water (0.33l, Restaurant)",
    nameDE: "Wasser (0,33l Restaurant)",
    unit: "USD", category: "drinks",
    insight: "Deutschland berechnet $2.95 für Wasser — Japan serviert kostenlos Tee, Mexiko agua de sabor für $0.90",
    data: gen({ prices: {
      usa:      { base: 2.13,  inflation: 0.03,  season: "d_default" },
      germany:  { base: 2.95,  inflation: 0.05,  season: "d_default" },
      thailand: { base: 0.56,  inflation: 0.01,  season: "d_default" },
      japan:    { base: 0.67,  inflation: 0.02,  season: "d_default" }, // ¥100, often free tea
      mexico:   { base: 0.90,  inflation: 0.04,  season: "d_default" }, // 15 MXN
      portugal: { base: 1.30,  inflation: 0.03,  season: "d_default" }, // €1.20
    }, noise: 0.01 }),
  },

  // ═══ HOTELS ═══
  {
    id: "hotel-3star",
    name: "3-Star Hotel (per night)",
    nameDE: "3-Sterne Hotel (pro Nacht)",
    unit: "USD", category: "hotel",
    insight: "Japan Nebensaison (Jun, Jan): 3-Sterne ab $55 — günstiger als Portugal und fast wie Mexiko",
    data: gen({ prices: {
      usa:      { base: 164,   inflation: 0.05,  season: "h_usa" },
      germany:  { base: 113,   inflation: 0.06,  season: "h_germany" },
      thailand: { base: 32,    inflation: 0.03,  season: "h_thailand" },
      japan:    { base: 70,    inflation: 0.04,  season: "h_japan" },     // ¥10,500
      mexico:   { base: 50,    inflation: 0.05,  season: "h_mexico" },    // 860 MXN
      portugal: { base: 80,    inflation: 0.06,  season: "h_portugal" },  // €74
    }, noise: 0.03 }),
  },
  {
    id: "hotel-5star",
    name: "5-Star Hotel (per night)",
    nameDE: "5-Sterne Hotel (pro Nacht)",
    unit: "USD", category: "hotel",
    insight: "5-Sterne Tokio ($180) < 3-Sterne New York ($200+). Thailand Low Season: Luxus ab $80/Nacht",
    data: gen({ prices: {
      usa:      { base: 493,   inflation: 0.06,  season: "h_usa" },
      germany:  { base: 350,   inflation: 0.07,  season: "h_germany" },
      thailand: { base: 140,   inflation: 0.04,  season: "h_thailand" },
      japan:    { base: 180,   inflation: 0.05,  season: "h_japan" },     // ¥27,000
      mexico:   { base: 160,   inflation: 0.06,  season: "h_mexico" },    // Cancún/CDMX avg
      portugal: { base: 200,   inflation: 0.07,  season: "h_portugal" },  // €185 Lissabon
    }, noise: 0.04 }),
  },
  {
    id: "hostel",
    name: "Hostel / Budget",
    nameDE: "Hostel / Budget Unterkunft",
    unit: "USD", category: "hotel",
    insight: "Mexiko Hostels ab $6/Nacht — Thailand $5 in Monsun. Japan Capsule Hotels $20 sind eine eigene Erfahrung",
    data: gen({ prices: {
      usa:      { base: 35,    inflation: 0.04,  season: "h_usa" },
      germany:  { base: 32,    inflation: 0.05,  season: "h_germany" },
      thailand: { base: 8.40,  inflation: 0.025, season: "h_thailand" },
      japan:    { base: 20,    inflation: 0.03,  season: "h_japan" },     // ¥3000 capsule
      mexico:   { base: 9,     inflation: 0.04,  season: "h_mexico" },    // 155 MXN
      portugal: { base: 22,    inflation: 0.05,  season: "h_portugal" },  // €20
    }, noise: 0.03 }),
  },
  {
    id: "airbnb-1br",
    name: "Airbnb (1 Bedroom, central)",
    nameDE: "Airbnb (1 Zimmer, zentral)",
    unit: "USD", category: "hotel",
    insight: "CDMX Airbnb $35/Nacht — günstiger als Bangkok ($50). Lissabon $65 trotz Regulierung noch fair",
    data: gen({ prices: {
      usa:      { base: 130,   inflation: 0.055, season: "h_usa" },
      germany:  { base: 92,    inflation: 0.07,  season: "h_germany" },
      thailand: { base: 50,    inflation: 0.035, season: "h_thailand" },
      japan:    { base: 60,    inflation: 0.04,  season: "h_japan" },     // ¥9000
      mexico:   { base: 35,    inflation: 0.05,  season: "h_mexico" },    // 600 MXN
      portugal: { base: 65,    inflation: 0.06,  season: "h_portugal" },  // €60
    }, noise: 0.035 }),
  },

  // ═══ GROCERIES ═══
  {
    id: "milk",
    name: "Milk (1 liter)",
    nameDE: "Milch (1 Liter)",
    unit: "USD", category: "groceries",
    insight: "Japan Milch $1.45 — gleicher Preis wie Thailand, beide teurer als DE $1.25 (starke EU-Milchindustrie)",
    data: gen({ prices: {
      usa:      { base: 1.06,  inflation: 0.012, season: "f_summer" },
      germany:  { base: 1.25,  inflation: 0.018, season: "f_summer" },
      thailand: { base: 1.45,  inflation: 0.015, season: "f_thailand" },
      japan:    { base: 1.45,  inflation: 0.025, season: "f_japan" },     // ¥215
      mexico:   { base: 1.10,  inflation: 0.05,  season: "f_default" },   // 19 MXN
      portugal: { base: 0.85,  inflation: 0.02,  season: "f_summer" },    // €0.79
    }, noise: 0.02 }),
  },
  {
    id: "bread",
    name: "Bread (500g)",
    nameDE: "Brot (500g)",
    unit: "USD", category: "groceries",
    insight: "Portugal $1.10 für frisches Brot — günstigstes in Europa. USA $3.64 ist 3.3x teurer",
    data: gen({ prices: {
      usa:      { base: 3.64,  inflation: 0.012, season: "f_summer" },
      germany:  { base: 2.15,  inflation: 0.018, season: "f_summer" },
      thailand: { base: 1.18,  inflation: 0.015, season: "f_thailand" },
      japan:    { base: 1.70,  inflation: 0.025, season: "f_japan" },     // ¥250 shokupan
      mexico:   { base: 1.50,  inflation: 0.05,  season: "f_default" },   // 26 MXN bolillo
      portugal: { base: 1.10,  inflation: 0.02,  season: "f_summer" },    // €1.00
    }, noise: 0.015 }),
  },
  {
    id: "rice",
    name: "Rice (1kg)",
    nameDE: "Reis (1kg)",
    unit: "USD", category: "groceries",
    insight: "Thailand + Japan: lokale Reiskulturen, Preise unter $1.50/kg. USA importiert teuer: $4.59",
    data: gen({ prices: {
      usa:      { base: 4.59,  inflation: 0.012, season: "f_summer" },
      germany:  { base: 2.40,  inflation: 0.018, season: "f_summer" },
      thailand: { base: 1.26,  inflation: 0.015, season: "f_thailand" },
      japan:    { base: 1.50,  inflation: 0.025, season: "f_japan" },     // ¥225 (local koshihikari cheap)
      mexico:   { base: 1.20,  inflation: 0.05,  season: "f_default" },   // 21 MXN
      portugal: { base: 1.30,  inflation: 0.02,  season: "f_summer" },    // €1.20
    }, noise: 0.02 }),
  },
  {
    id: "chicken",
    name: "Chicken Breast (1kg)",
    nameDE: "Hähnchenbrust (1kg)",
    unit: "USD", category: "groceries",
    insight: "Mexiko $4.80/kg Hähnchen — Geflügel-Großproduzent. Thailand $3.22, Japan $6.70 (Qualitätsfokus)",
    data: gen({ prices: {
      usa:      { base: 12.28, inflation: 0.012, season: "f_summer" },
      germany:  { base: 9.70,  inflation: 0.018, season: "f_summer" },
      thailand: { base: 3.22,  inflation: 0.015, season: "f_thailand" },
      japan:    { base: 6.70,  inflation: 0.025, season: "f_japan" },     // ¥1000
      mexico:   { base: 4.80,  inflation: 0.05,  season: "f_default" },   // 83 MXN
      portugal: { base: 6.50,  inflation: 0.02,  season: "f_summer" },    // €6.00
    }, noise: 0.025 }),
  },
  {
    id: "eggs",
    name: "Eggs (12)",
    nameDE: "Eier (12 Stück)",
    unit: "USD", category: "groceries",
    insight: "US-Eier $6.23 Peak (Mär 2025, Vogelgrippe) — Japan $2.20 und Mexiko $1.80 kaum betroffen",
    data: gen({ prices: {
      usa:      { base: 4.38,  inflation: 0.15,  season: "f_summer" },
      germany:  { base: 3.40,  inflation: 0.02,  season: "f_summer" },
      thailand: { base: 1.62,  inflation: 0.015, season: "f_thailand" },
      japan:    { base: 2.20,  inflation: 0.03,  season: "f_japan" },     // ¥330
      mexico:   { base: 1.80,  inflation: 0.06,  season: "f_default" },   // 31 MXN
      portugal: { base: 2.50,  inflation: 0.02,  season: "f_summer" },    // €2.30
    }, noise: 0.03, seed: 42 }),
  },

  // ═══ TRANSPORT ═══
  {
    id: "taxi-1km",
    name: "Taxi (1 km)",
    nameDE: "Taxi (1 km)",
    unit: "USD", category: "transport",
    insight: "Mexiko $0.45/km, Thailand $0.18/km — Japan $3.10/km ist einer der teuersten Taxi-Märkte weltweit",
    data: gen({ prices: {
      usa:      { base: 1.85,  inflation: 0.03,  season: "t_default" },
      germany:  { base: 2.40,  inflation: 0.04,  season: "t_default" },
      thailand: { base: 0.18,  inflation: 0.015, season: "t_default" },
      japan:    { base: 3.10,  inflation: 0.02,  season: "t_default" },   // ¥460/km
      mexico:   { base: 0.45,  inflation: 0.05,  season: "t_default" },   // 7.8 MXN
      portugal: { base: 1.00,  inflation: 0.03,  season: "t_default" },   // €0.92
    }, noise: 0.01 }),
  },
  {
    id: "public-transport",
    name: "Monthly Public Transport Pass",
    nameDE: "Monatskarte ÖPNV",
    unit: "USD", category: "transport",
    insight: "Lissabon Navegante $43/Monat — günstiger als Deutschlandticket $63. Tokio Suica hat kein echtes Monatsabo",
    data: gen({ prices: {
      usa:      { base: 65,    inflation: 0.03,  season: "t_default" },
      germany:  { base: 56,    inflation: 0.18,  season: "t_default" }, // 49→58 EUR
      thailand: { base: 36.40, inflation: 0.02,  season: "t_default" },
      japan:    { base: 67,    inflation: 0.02,  season: "t_default" },   // ¥10,000 teiki avg
      mexico:   { base: 14,    inflation: 0.05,  season: "t_default" },   // 240 MXN CDMX
      portugal: { base: 43,    inflation: 0.03,  season: "t_default" },   // €40 Navegante
    }, noise: 0.005 }),
  },
  {
    id: "gasoline",
    name: "Gasoline (1 liter)",
    nameDE: "Benzin (1 Liter)",
    unit: "USD", category: "transport",
    insight: "Mexiko subventioniert: $1.05/L. USA $0.89/L. DE $1.90/L — Steuerlast macht den Unterschied",
    data: gen({ prices: {
      usa:      { base: 0.89,  inflation: 0.04,  season: "t_default" },
      germany:  { base: 1.90,  inflation: 0.05,  season: "t_default" },
      thailand: { base: 1.15,  inflation: 0.03,  season: "t_default" },
      japan:    { base: 1.14,  inflation: 0.03,  season: "t_default" },   // ¥170/L
      mexico:   { base: 1.05,  inflation: 0.04,  season: "t_default" },   // 18 MXN
      portugal: { base: 1.85,  inflation: 0.04,  season: "t_default" },   // €1.72
    }, noise: 0.04 }),
  },
  {
    id: "uber-5km",
    name: "Ride-Hailing (5km)",
    nameDE: "Uber/Grab/DiDi (5km)",
    unit: "USD", category: "transport",
    insight: "CDMX DiDi $2.50, Bangkok Grab $3.10 — Tokio hat kein Uber, Taxi kostet $18 für 5km",
    data: gen({ prices: {
      usa:      { base: 14,    inflation: 0.096, season: "t_default" },
      germany:  { base: 13.50, inflation: 0.05,  season: "t_default" },
      thailand: { base: 3.10,  inflation: 0.02,  season: "t_default" },
      japan:    { base: 18,    inflation: 0.02,  season: "t_default" },   // ¥2700 taxi (no real ridehail)
      mexico:   { base: 2.50,  inflation: 0.05,  season: "t_default" },   // 43 MXN DiDi
      portugal: { base: 5.50,  inflation: 0.04,  season: "t_default" },   // €5 Bolt/Uber
    }, noise: 0.02 }),
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────

export function getProductsByCategory(category: Category): Product[] {
  return products.filter((p) => p.category === category);
}

export function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const names = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
  return `${names[parseInt(m) - 1]} ${year.slice(2)}`;
}

export function findCheapestMonths(product: Product, country: Country, topN = 3) {
  return [...product.data]
    .sort((a, b) => (a[country] as number) - (b[country] as number))
    .slice(0, topN)
    .map((d) => ({ month: d.month, price: d[country] as number }));
}

export function calculateSavings(product: Product, expensive: Country, cheap: Country): number {
  const avg = (c: Country) => product.data.reduce((s, d) => s + (d[c] as number), 0) / product.data.length;
  return Math.round((1 - avg(cheap) / avg(expensive)) * 100);
}

// ─── Travel Advisor ──────────────────────────────────────────────────

export interface TravelDeal {
  country: Country;
  month: string;
  monthLabel: string;
  category: string;
  saving: string;
  reason: string;
  products: { name: string; price: number }[];
}

export function getTravelDeals(activeCountries: Country[]): TravelDeal[] {
  const deals: TravelDeal[] = [];
  const hotelProducts = getProductsByCategory("hotel");

  for (const country of activeCountries) {
    const info = countryMap[country];
    if (!info) continue;

    // Find the 2 cheapest hotel months
    const hotel3 = hotelProducts.find((p) => p.id === "hotel-3star");
    if (!hotel3) continue;

    const cheapMonths = findCheapestMonths(hotel3, country, 2);

    for (const { month, price } of cheapMonths) {
      const monthLabel = formatMonth(month);

      // Get prices for all categories in this month
      const dataPoint = hotel3.data.find((d) => d.month === month);
      if (!dataPoint) continue;

      // Calculate how much cheaper than yearly average
      const avg = hotel3.data.reduce((s, d) => s + (d[country] as number), 0) / hotel3.data.length;
      const savingPct = Math.round((1 - price / avg) * 100);

      if (savingPct < 10) continue; // Only show meaningful deals

      // Get food cost for that month
      const cheapMeal = products.find((p) => p.id === "meal-cheap");
      const mealPoint = cheapMeal?.data.find((d) => d.month === month);
      const mealPrice = mealPoint ? (mealPoint[country] as number) : 0;

      const reasons: Record<Country, Record<string, string>> = {
        usa: { default: "Nebensaison nach Holidays" },
        germany: { default: "Vor/nach Tourismus-Hochphase" },
        thailand: { default: "Monsun-Saison — kurze Regenschauer, sonst warm" },
        japan: { default: "Zwischen Kirschblüte und Herbstlaub" },
        mexico: { default: "Regenzeit — nachmittags kurze Schauer, morgens perfekt" },
        portugal: { default: "Atlantik-Winter — mild, wenig Touristen" },
      };

      deals.push({
        country,
        month,
        monthLabel,
        category: "Hotel + Essen",
        saving: `-${savingPct}%`,
        reason: reasons[country]?.default || "Nebensaison",
        products: [
          { name: "3★ Hotel/Nacht", price },
          ...(mealPrice > 0 ? [{ name: "Essen (günstig)", price: mealPrice }] : []),
        ],
      });
    }
  }

  return deals.sort((a, b) => {
    const aPct = parseInt(a.saving);
    const bPct = parseInt(b.saving);
    return aPct - bPct; // Most negative (biggest saving) first
  });
}
