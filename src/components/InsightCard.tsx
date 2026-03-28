"use client";

import { Product, Country, countryNames, countryColors, countryFlags, findCheapestMonths, calculateSavings, formatMonth } from "@/data/prices";

interface InsightCardProps {
  product: Product;
  activeCountries: Country[];
  onHighlightMonth: (month: string | null) => void;
}

export default function InsightCard({ product, activeCountries, onHighlightMonth }: InsightCardProps) {
  const avgPrices = activeCountries.map((c) => ({
    country: c,
    avg: product.data.reduce((sum, d) => sum + (d[c] as number), 0) / product.data.length,
  })).sort((a, b) => a.avg - b.avg);

  const cheapest = avgPrices[0];
  const mostExpensive = avgPrices[avgPrices.length - 1];
  const savings = calculateSavings(product, mostExpensive.country, cheapest.country);
  const cheapMonths = findCheapestMonths(product, cheapest.country, 3);

  return (
    <section className="rounded-2xl bg-zinc-900/40 border border-zinc-800/40 overflow-hidden">
      {product.insight && (
        <div className="px-5 pt-5 pb-4 border-b border-zinc-800/30">
          <p className="text-zinc-300 text-sm leading-relaxed">{product.insight}</p>
        </div>
      )}
      <div className="p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest shrink-0">Bester Preis</span>
            <span className="text-lg leading-none">{countryFlags[cheapest.country]}</span>
            <span className="text-white font-medium text-sm">{countryNames[cheapest.country]}</span>
            <span className="text-zinc-400 font-mono text-sm">${cheapest.avg.toFixed(2)}</span>
          </div>
          <span className="ml-auto text-emerald-400/90 text-sm font-mono font-medium tabular-nums">
            &minus;{savings}%
          </span>
        </div>

        <div>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Günstigste Monate</p>
          <div className="flex gap-2 flex-wrap">
            {cheapMonths.map(({ month, price }) => (
              <button
                key={month}
                className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/30 hover:border-zinc-600/40 text-zinc-300 text-xs px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
                onMouseEnter={() => onHighlightMonth(month)}
                onMouseLeave={() => onHighlightMonth(null)}
              >
                <span className="text-zinc-500">{formatMonth(month)}</span>
                <span className="font-mono text-emerald-400/80">${price.toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {avgPrices.map(({ country, avg }) => {
            const width = (avg / mostExpensive.avg) * 100;
            const isCheapest = country === cheapest.country;
            return (
              <div key={country} className="flex items-center gap-3">
                <span className="text-sm w-6 text-center shrink-0">{countryFlags[country]}</span>
                <div className="flex-1 bg-zinc-800/30 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${width}%`,
                      backgroundColor: isCheapest ? "#4ade80" : countryColors[country],
                      opacity: isCheapest ? 0.8 : 0.3,
                    }}
                  />
                </div>
                <span className="text-xs text-zinc-500 font-mono w-16 text-right tabular-nums shrink-0">
                  ${avg.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
