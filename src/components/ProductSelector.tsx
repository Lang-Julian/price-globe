"use client";

import { Product } from "@/data/prices";

interface ProductSelectorProps {
  products: Product[];
  activeId: string;
  onChange: (id: string) => void;
}

export default function ProductSelector({ products, activeId, onChange }: ProductSelectorProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-0.5">
      {products.map((product) => {
        const isActive = activeId === product.id;
        return (
          <button
            key={product.id}
            onClick={() => onChange(product.id)}
            className={`
              px-3.5 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer
              ${isActive
                ? "bg-white/[0.08] text-white font-medium shadow-sm"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
              }
            `}
          >
            {product.nameDE}
          </button>
        );
      })}
    </div>
  );
}
