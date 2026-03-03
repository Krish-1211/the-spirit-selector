interface Filters {
  category: string;
  brand: string;
  priceRange: [number, number];
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  brands?: string[];
  categories?: string[];
}

export default function FilterSidebar({ filters, onChange, brands = [], categories = [] }: Props) {
  return (
    <aside className="space-y-8">
      {/* Category */}
      <div>
        <h4 className="mb-3 font-serif text-sm font-bold uppercase tracking-wider text-foreground">Category</h4>
        <div className="space-y-2">
          <button
            onClick={() => onChange({ ...filters, category: "" })}
            className={`block w-full text-left text-sm transition-colors ${!filters.category ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange({ ...filters, category: cat })}
              className={`block w-full text-left text-sm transition-colors ${filters.category === cat ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <h4 className="mb-3 font-serif text-sm font-bold uppercase tracking-wider text-foreground">Brand</h4>
        <div className="space-y-2">
          <button
            onClick={() => onChange({ ...filters, brand: "" })}
            className={`block w-full text-left text-sm transition-colors ${!filters.brand ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => onChange({ ...filters, brand: b })}
              className={`block w-full text-left text-sm transition-colors ${filters.brand === b ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="mb-3 font-serif text-sm font-bold uppercase tracking-wider text-foreground">Price Range</h4>
        <div className="space-y-2">
          {([
            [0, 9999, "All Prices"],
            [0, 50, "Under $50"],
            [50, 100, "$50 – $100"],
            [100, 250, "$100 – $250"],
            [250, 9999, "$250+"],
          ] as [number, number, string][]).map(([min, max, label]) => (
            <button
              key={label}
              onClick={() => onChange({ ...filters, priceRange: [min, max] })}
              className={`block w-full text-left text-sm transition-colors ${filters.priceRange[0] === min && filters.priceRange[1] === max
                  ? "font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
