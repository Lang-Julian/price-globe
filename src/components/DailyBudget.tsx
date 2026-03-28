"use client";

import { useMemo, useState } from "react";
import { Country, countries, countryColors, countryFlags, countryNames, products } from "@/data/prices";

type BudgetStyle = "backpacker" | "mid" | "comfort";

const styles: { id: BudgetStyle; label: string; description: string }[] = [
  { id: "backpacker", label: "Backpacker", description: "Hostel, Street Food, ÖPNV" },
  { id: "mid", label: "Mittelklasse", description: "3★ Hotel, Restaurants, Taxi" },
  { id: "comfort", label: "Komfort", description: "5★ Hotel, Fine Dining, Uber" },
];

// Product IDs for each budget tier
const budgetProducts: Record<BudgetStyle, { hotel: string; meals: string[]; transport: string; drinks: string }> = {
  backpacker: {
    hotel: "hostel",
    meals: ["meal-cheap", "meal-cheap", "meal-cheap"],
    transport: "public-transport",
    drinks: "water-restaurant",
  },
  mid: {
    hotel: "hotel-3star",
    meals: ["meal-cheap", "mcmeal", "meal-mid"],
    transport: "uber-5km",
    drinks: "cappuccino",
  },
  comfort: {
    hotel: "hotel-5star",
    meals: ["mcmeal", "meal-mid", "meal-mid"],
    transport: "uber-5km",
    drinks: "domestic-beer",
  },
};

interface DailyBudgetProps {
  activeCountries: Country[];
}

export default function DailyBudget({ activeCountries }: DailyBudgetProps) {
  const [style, setStyle] = useState<BudgetStyle>("mid");

  const budgets = useMemo(() => {
    const cfg = budgetProducts[style];
    const latest = (id: string, country: Country): number => {
      const product = products.find((p) => p.id === id);
      if (!product) return 0;
      const last = product.data[product.data.length - 1];
      return (last[country] as number) || 0;
    };

    return activeCountries.map((c) => {
      const hotel = latest(cfg.hotel, c);
      const meals = cfg.meals.reduce((sum, id) => sum + latest(id, c), 0);
      // For monthly transport, divide by 30 for daily
      const transportRaw = latest(cfg.transport, c);
      const transport = cfg.transport === "public-transport" ? transportRaw / 30 : transportRaw * 2; // 2 rides
      const drinks = latest(cfg.drinks, c) * 2; // 2 drinks
      const total = hotel + meals + transport + drinks;

      return {
        country: c,
        hotel,
        meals,
        transport,
        drinks,
        total,
      };
    }).sort((a, b) => a.total - b.total);
  }, [activeCountries, style]);

  const maxTotal = Math.max(...budgets.map((b) => b.total));

  return (
    <section className="rounded-2xl border border-blue-900/30 bg-blue-950/15 overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-blue-900/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-blue-400 text-sm">&#9830;</span>
          <h3 className="text-sm font-semibold text-blue-300 tracking-tight">
            Tagesbudget-Rechner
          </h3>
        </div>
        <p className="text-zinc-500 text-xs">
          Hotel + 3 Mahlzeiten + Transport + 2 Getränke pro Tag
        </p>
      </div>

      {/* Style Selector */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex gap-2">
          {styles.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`
                flex-1 text-left px-3 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer border
                ${style === s.id
                  ? "bg-white/[0.06] border-white/[0.1] text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                }
              `}
            >
              <span className="font-medium block">{s.label}</span>
              <span className="text-[10px] text-zinc-600 block mt-0.5">{s.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Budget Bars */}
      <div className="px-5 pb-5 space-y-3">
        {budgets.map((b) => {
          const barWidth = (b.total / maxTotal) * 100;
          const hotelPct = (b.hotel / b.total) * 100;
          const mealsPct = (b.meals / b.total) * 100;
          const transportPct = (b.transport / b.total) * 100;

          return (
            <div key={b.country} className="group">
              <div className="flex items-baseline justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{countryFlags[b.country]}</span>
                  <span className="text-sm text-zinc-300 font-medium">{countryNames[b.country]}</span>
                </div>
                <span className="text-lg font-mono text-white font-semibold tabular-nums">
                  ${b.total.toFixed(0)}
                  <span className="text-xs text-zinc-500 font-normal">/Tag</span>
                </span>
              </div>

              {/* Stacked bar */}
              <div className="h-3 bg-zinc-800/30 rounded-full overflow-hidden flex" style={{ width: `${barWidth}%` }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${hotelPct}%`, backgroundColor: countryColors[b.country], opacity: 0.9 }}
                  title={`Hotel: $${b.hotel.toFixed(0)}`}
                />
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${mealsPct}%`, backgroundColor: countryColors[b.country], opacity: 0.6 }}
                  title={`Essen: $${b.meals.toFixed(0)}`}
                />
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${transportPct}%`, backgroundColor: countryColors[b.country], opacity: 0.35 }}
                  title={`Transport: $${b.transport.toFixed(0)}`}
                />
                <div
                  className="h-full transition-all duration-500"
                  style={{ flex: 1, backgroundColor: countryColors[b.country], opacity: 0.2 }}
                  title={`Getränke: $${b.drinks.toFixed(0)}`}
                />
              </div>

              {/* Breakdown on hover/always on mobile */}
              <div className="flex gap-3 mt-1.5 text-[10px] text-zinc-600">
                <span>Hotel ${b.hotel.toFixed(0)}</span>
                <span>Essen ${b.meals.toFixed(0)}</span>
                <span>Transport ${b.transport.toFixed(0)}</span>
                <span>Drinks ${b.drinks.toFixed(0)}</span>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex items-center gap-4 pt-2 text-[10px] text-zinc-600">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-zinc-400 opacity-90" /> Hotel</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-zinc-400 opacity-60" /> Essen</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-zinc-400 opacity-35" /> Transport</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-zinc-400 opacity-20" /> Drinks</div>
        </div>
      </div>
    </section>
  );
}
