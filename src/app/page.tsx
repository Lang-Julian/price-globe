"use client";

import { useState, useCallback, useMemo } from "react";
import { Category, Country, getProductsByCategory, products, countryColors, countryFlags, countries } from "@/data/prices";
import CategoryNav from "@/components/CategoryNav";
import CountryToggle from "@/components/CountryToggle";
import ProductSelector from "@/components/ProductSelector";
import PriceChart from "@/components/PriceChart";
import InsightCard from "@/components/InsightCard";
import TravelAdvisor from "@/components/TravelAdvisor";
import DailyBudget from "@/components/DailyBudget";

export default function Home() {
  const [category, setCategory] = useState<Category>("hotel");
  const [activeCountries, setActiveCountries] = useState<Country[]>(["usa", "germany", "thailand", "japan"]);
  const [activeProductId, setActiveProductId] = useState<string>("hotel-3star");
  const [highlightMonth, setHighlightMonth] = useState<string | null>(null);

  const categoryProducts = useMemo(() => getProductsByCategory(category), [category]);
  const activeProduct = useMemo(
    () => products.find((p) => p.id === activeProductId) || categoryProducts[0],
    [activeProductId, categoryProducts],
  );

  const handleCategoryChange = useCallback((cat: Category) => {
    setCategory(cat);
    const prods = getProductsByCategory(cat);
    if (prods.length > 0) setActiveProductId(prods[0].id);
  }, []);

  const handleCountryToggle = useCallback((country: Country) => {
    setActiveCountries((prev) => {
      if (prev.includes(country)) {
        return prev.length <= 1 ? prev : prev.filter((c) => c !== country);
      }
      return [...prev, country];
    });
  }, []);

  return (
    <div className="min-h-screen bg-mesh">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-zinc-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-3 sm:pt-5 sm:pb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="shrink-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Price Globe
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">
                6 Länder &middot; 5 Kategorien &middot; 20 Produkte
              </p>
            </div>
            <CountryToggle active={activeCountries} onToggle={handleCountryToggle} />
          </div>
          <CategoryNav active={category} onChange={handleCategoryChange} />
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Product Selector */}
        <ProductSelector
          products={categoryProducts}
          activeId={activeProduct.id}
          onChange={setActiveProductId}
        />

        {/* Chart Section */}
        <section className="chart-glow rounded-2xl bg-zinc-900/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {activeProduct.nameDE}
              </h2>
              <p className="text-zinc-500 text-xs mt-1 tracking-wide">
                Jan 2023 — Mär 2026 &middot; USD
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {activeCountries.map((c) => {
                const latest = activeProduct.data[activeProduct.data.length - 1];
                return (
                  <div key={c} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: countryColors[c] }} />
                    <span className="text-xs text-zinc-500">{countryFlags[c]}</span>
                    <span className="text-xs font-mono text-zinc-300">${(latest[c] as number).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <PriceChart
            product={activeProduct}
            activeCountries={activeCountries}
            highlightMonth={highlightMonth}
          />
        </section>

        {/* Insights */}
        <InsightCard
          product={activeProduct}
          activeCountries={activeCountries}
          onHighlightMonth={setHighlightMonth}
        />

        {/* Daily Budget Calculator */}
        <DailyBudget activeCountries={activeCountries} />

        {/* Travel Advisor */}
        <TravelAdvisor activeCountries={activeCountries} />

        {/* Product Grid */}
        <section>
          <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-medium">
            {categoryProducts.length} Produkte in dieser Kategorie
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {categoryProducts.map((product) => {
              const latest = product.data[product.data.length - 1];
              const isActive = product.id === activeProduct.id;
              return (
                <button
                  key={product.id}
                  onClick={() => setActiveProductId(product.id)}
                  className={`
                    group text-left px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer
                    ${isActive
                      ? "bg-zinc-800/80 border-zinc-600/50 shadow-lg shadow-black/20"
                      : "bg-zinc-900/30 border-zinc-800/40 hover:bg-zinc-800/40 hover:border-zinc-700/50"
                    }
                  `}
                >
                  <p className={`text-sm mb-2 ${isActive ? "text-white font-medium" : "text-zinc-300 group-hover:text-white"} transition-colors`}>
                    {product.nameDE}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {activeCountries.slice(0, 4).map((c) => (
                      <div key={c} className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full opacity-50" style={{ backgroundColor: countryColors[c] }} />
                        <span className="text-[11px] font-mono text-zinc-500">
                          ${(latest[c] as number).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {activeCountries.length > 4 && (
                      <span className="text-[10px] text-zinc-600">+{activeCountries.length - 4}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/40 mt-16 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-600 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-medium text-zinc-400">Price Globe</span>
              <span>&middot;</span>
              <span>Open Source</span>
              <span>&middot;</span>
              <span>MIT License</span>
            </div>
            <p>Daten: Numbeo, Statista, Hotels.com HPI, USDA, Destatis, Booking.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
