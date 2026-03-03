import { useParams, Link } from "react-router-dom";
import { products } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, MapPin } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { selectedStore } = useStore();
  const { addItem } = useCart();

  const product = products.find((p) => p.id === id);
  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  const inventory = selectedStore ? product.storeInventory[selectedStore.id] : null;
  const status = inventory?.status ?? "Out of Stock";

  return (
    <main className="min-h-screen">
      <div className="container py-8">
        <Link
          to="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="aspect-[4/5] overflow-hidden rounded-sm border border-border bg-card">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{product.brand}</p>
            <h1 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>
            <p className="mb-6 text-2xl font-bold text-foreground">${product.price.toFixed(2)}</p>

            <div className="mb-6 border-t border-border pt-6">
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </div>

            {/* Specs */}
            <div className="mb-6 grid grid-cols-2 gap-4 border-t border-border pt-6">
              {([
                ["Category", product.category],
                ["ABV", `${product.abv}%`],
                ["Volume", product.volume],
                ["Brand", product.brand],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>

            {/* Tasting notes */}
            <div className="mb-6 border-t border-border pt-6">
              <h3 className="mb-2 font-serif text-sm font-bold uppercase tracking-wider text-foreground">
                Tasting Notes
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{product.tastingNotes}</p>
            </div>

            {/* Store availability */}
            {selectedStore && (
              <div className="mb-6 flex items-center gap-2 rounded-sm border border-border bg-secondary px-4 py-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {selectedStore.name}:
                </span>
                <span
                  className={`text-sm font-semibold ${
                    status === "In Stock"
                      ? "text-green-500"
                      : status === "Low Stock"
                      ? "text-yellow-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {status}
                </span>
              </div>
            )}

            <button
              onClick={() => addItem(product)}
              disabled={status === "Out of Stock"}
              className="mt-auto w-full rounded-sm bg-primary py-4 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "Out of Stock" ? "Unavailable at This Store" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
