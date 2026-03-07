import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, DBProduct } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import ProductRecommendations from "@/components/ProductRecommendations";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { selectedStore } = useStore();
  const { addItem } = useCart();
  const [product, setProduct] = useState<DBProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedStore?.id) params.set("store_id", selectedStore.id);
    api.get<DBProduct>(`/products/${id}?${params}`)
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, selectedStore?.id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  const price = parseFloat(product.price);
  const volume = product.volume_ml
    ? product.volume_ml >= 1000
      ? `${product.volume_ml / 1000}L`
      : `${product.volume_ml}ml`
    : null;

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
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm uppercase tracking-widest">
                {product.category}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{product.brand}</p>
            <h1 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>
            <p className="mb-6 text-2xl font-bold text-foreground">${price.toFixed(2)}</p>

            <div className="mb-6 border-t border-border pt-6">
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </div>

            {/* Specs */}
            <div className="mb-6 grid grid-cols-2 gap-4 border-t border-border pt-6">
              {([
                ["Category", product.category],
                product.alcohol_percentage ? ["ABV", `${product.alcohol_percentage}%`] : null,
                volume ? ["Volume", volume] : null,
                ["Brand", product.brand],
                ["SKU", product.sku],
              ] as ([string, string] | null)[]).filter(Boolean).map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>

            {/* Tasting notes */}
            {product.tasting_notes && (
              <div className="mb-6 border-t border-border pt-6">
                <h3 className="mb-2 font-serif text-sm font-bold uppercase tracking-wider text-foreground">
                  Tasting Notes
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{product.tasting_notes}</p>
              </div>
            )}

            <button
              onClick={() => addItem(product as any)}
              className="mt-auto w-full rounded-sm bg-primary py-4 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Product Recommendations */}
        <ProductRecommendations productId={product.id} />
      </div>
    </main>
  );
}
