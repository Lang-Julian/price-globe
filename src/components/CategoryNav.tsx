"use client";

import { categories, Category } from "@/data/prices";

interface CategoryNavProps {
  active: Category;
  onChange: (category: Category) => void;
}

export default function CategoryNav({ active, onChange }: CategoryNavProps) {
  return (
    <nav className="flex gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      {categories.map((cat) => {
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
              whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer
              ${isActive
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300"
              }
            `}
          >
            {isActive && (
              <span className="absolute inset-0 bg-white/[0.07] rounded-xl border border-white/[0.08]" />
            )}
            <span className="relative z-10">{cat.icon}</span>
            <span className="relative z-10">{cat.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
