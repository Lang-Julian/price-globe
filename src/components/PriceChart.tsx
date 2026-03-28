"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import { Product, Country, countryColors, countryNames, countryFlags, formatMonth } from "@/data/prices";

interface PriceChartProps {
  product: Product;
  activeCountries: Country[];
  highlightMonth?: string | null;
}

export default function PriceChart({ product, activeCountries, highlightMonth }: PriceChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const chartData = useMemo(() => {
    return product.data.map((d) => ({ ...d, label: formatMonth(d.month) }));
  }, [product]);

  const yDomain = useMemo(() => {
    let min = Infinity, max = -Infinity;
    for (const d of product.data) {
      for (const c of activeCountries) {
        const v = d[c] as number;
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    const pad = (max - min) * 0.12;
    return [Math.max(0, +(min - pad).toFixed(0)), +(max + pad).toFixed(0)];
  }, [product, activeCountries]);

  if (!mounted) {
    return <div className="w-full h-[280px] sm:h-[360px] rounded-xl bg-zinc-800/20 animate-pulse" />;
  }

  return (
    <div className="w-full h-[280px] sm:h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
          <defs>
            {activeCountries.map((c) => (
              <linearGradient key={`g-${c}`} id={`g-${c}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={countryColors[c]} stopOpacity={0.1} />
                <stop offset="100%" stopColor={countryColors[c]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="none" stroke="rgba(63,63,70,0.15)" vertical={false} />
          <XAxis
            dataKey="label" stroke="transparent"
            tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false}
            interval="preserveStartEnd" minTickGap={50} dy={8}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false}
            domain={yDomain} tickFormatter={(v: number) => `$${v}`} dx={-4}
          />
          <Tooltip
            cursor={{ stroke: "rgba(161,161,170,0.12)", strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-zinc-900/95 backdrop-blur-md border border-zinc-700/50 rounded-xl px-4 py-3 shadow-2xl shadow-black/40">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">{label}</p>
                  <div className="space-y-1.5">
                    {[...payload]
                      .sort((a, b) => (b.value as number) - (a.value as number))
                      .map((entry) => {
                        const country = entry.dataKey as Country;
                        return (
                          <div key={country} className="flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                            <span className="text-zinc-400 text-xs">
                              {countryFlags[country]} {countryNames[country]}
                            </span>
                            <span className="text-white font-mono text-sm ml-auto pl-4 font-medium">
                              ${(entry.value as number).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            }}
          />
          {highlightMonth && (
            <ReferenceLine x={formatMonth(highlightMonth)} stroke="#4ade80" strokeDasharray="6 4" strokeWidth={1.5} strokeOpacity={0.6} />
          )}
          {activeCountries.map((c) => (
            <Area key={`a-${c}`} type="monotone" dataKey={c} fill={`url(#g-${c})`} stroke="none" />
          ))}
          {activeCountries.map((c) => (
            <Line
              key={c} type="monotone" dataKey={c}
              stroke={countryColors[c]} strokeWidth={2} dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: countryColors[c], fill: "#09090b" }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
