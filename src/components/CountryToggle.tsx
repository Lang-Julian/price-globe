"use client";

import { Country, countries } from "@/data/prices";

interface CountryToggleProps {
  active: Country[];
  onToggle: (country: Country) => void;
}

export default function CountryToggle({ active, onToggle }: CountryToggleProps) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      {countries.map((c) => {
        const isActive = active.includes(c.id);
        return (
          <button
            key={c.id}
            onClick={() => onToggle(c.id)}
            className={`
              flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium
              transition-all duration-200 cursor-pointer
              ${isActive
                ? "bg-white/[0.06] border border-white/[0.12] text-white"
                : "border border-transparent text-zinc-600 hover:text-zinc-400"
              }
            `}
          >
            <span className="text-sm leading-none">{c.flag}</span>
            <span className="hidden lg:inline">{c.nameDE}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
