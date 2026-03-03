import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { products } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import { SlidersHorizontal, X } from "lucide-react";

export default function Products() {
  const { selectedStore } = useStore();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const searchParam = searchParams.get("search") || "";

  const [filters, setFilters] = useState({
    category: categoryParam,
    brand: "",
    priceRange: [0, 9999] as [number, number],
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync category from URL on first render
  useState(() => {
    if (categoryParam) setFilters((f) => ({ ...f, category: categoryParam }));
  });

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filters.category && p.category !== filters.category) return false;
      if (filters.brand && p.brand !== filters.brand) return false;
      if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;
      if (searchParam && !p.name.toLowerCase().includes(searchParam.toLowerCase()) && !p.brand.toLowerCase().includes(searchParam.toLowerCase())) return false;
      return true;
    });
  }, [filters, searchParam]);

  return (
    <main className="min-h-screen">
      {/* Top bar */}
      <div className="border-b border-border bg-card/50 py-4">
        <div className="container flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              {filters.category || "All Spirits"}
            </h1>
            {selectedStore && (
              <p className="mt-1 text-xs text-muted-foreground">
                Showing inventory for {selectedStore.name}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-10">
          {/* Sidebar - desktop */}
          <div className="hidden w-52 flex-shrink-0 lg:block">
            <FilterSidebar filters={filters} onChange={setFilters} />
          </div>

          {/* Mobile filters */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 bg-background/90 p-6 lg:hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-lg font-bold text-foreground">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <FilterSidebar filters={filters} onChange={(f) => { setFilters(f); setShowMobileFilters(false); }} />
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <p className="py-20 text-center text-muted-foreground">No products found matching your criteria.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 md:gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
