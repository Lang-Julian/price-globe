"use client";

import { Country, getTravelDeals, countryFlags, countryNames, countryColors } from "@/data/prices";

interface TravelAdvisorProps {
  activeCountries: Country[];
}

export default function TravelAdvisor({ activeCountries }: TravelAdvisorProps) {
  const deals = getTravelDeals(activeCountries);

  if (deals.length === 0) return null;

  return (
    <section className="rounded-2xl border border-emerald-900/30 bg-emerald-950/20 overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-emerald-900/20">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 text-sm">&#9672;</span>
          <h3 className="text-sm font-semibold text-emerald-300 tracking-tight">
            Travel Advisor — Wann & Wo am günstigsten?
          </h3>
        </div>
        <p className="text-zinc-500 text-xs mt-1">
          Basierend auf saisonalen Hotelpreisen und lokalen Essenskosten
        </p>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {deals.slice(0, 6).map((deal, i) => (
            <div
              key={`${deal.country}-${deal.month}-${i}`}
              className="group flex items-start gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/30 hover:border-zinc-700/40 transition-all duration-200"
            >
              <div className="flex flex-col items-center shrink-0 w-10">
                <span className="text-xl leading-none">{countryFlags[deal.country]}</span>
                <span
                  className="text-[10px] font-mono font-bold mt-1.5 px-1.5 py-0.5 rounded"
                  style={{ color: "#4ade80", backgroundColor: "rgba(74, 222, 128, 0.1)" }}
                >
                  {deal.saving}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-white">
                    {countryNames[deal.country]}
                  </span>
                  <span className="text-xs text-zinc-500">{deal.monthLabel}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{deal.reason}</p>
                <div className="flex gap-3 mt-2">
                  {deal.products.map((p) => (
                    <div key={p.name} className="text-xs">
                      <span className="text-zinc-600">{p.name}</span>
                      <span className="text-emerald-400/80 font-mono ml-1">${p.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
