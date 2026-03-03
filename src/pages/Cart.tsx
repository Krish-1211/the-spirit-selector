import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { api } from "@/lib/api";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart();
  const { selectedStore, fulfillment, setFulfillment } = useStore();
  const navigate = useNavigate();

  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [confirmed, setConfirmed] = useState<{ order_number: number } | null>(null);
  const [error, setError] = useState("");

  const deliveryFee = fulfillment === "delivery" ? 5.99 : 0;
  const tax = subtotal * 0.10;
  const total = subtotal + tax + deliveryFee;

  const placeOrder = async () => {
    if (!selectedStore) return setError("Please select a store first.");
    if (!ageConfirmed) return;
    setPlacing(true);
    setError("");
    try {
      const payload = {
        store_id: selectedStore.id,
        delivery_type: fulfillment,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          unit_price: parseFloat(String((i.product as any).price)),
        })),
      };
      const res = await api.post<{ order: { order_number: number } }>("/orders", payload);
      clearCart();
      setConfirmed(res.order);
    } catch (err: any) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  // Order confirmed screen
  if (confirmed) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center px-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <div>
          <p className="font-serif text-2xl font-bold text-foreground">Order Confirmed!</p>
          <p className="mt-2 text-muted-foreground">
            Your order <span className="font-bold text-foreground">#{confirmed.order_number}</span> has been placed.
          </p>
          {selectedStore && (
            <p className="mt-1 text-sm text-muted-foreground">
              {fulfillment === "pickup" ? `Ready for pickup at ${selectedStore.name}` : `Delivery from ${selectedStore.name}`}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate("/products")}
          className="rounded-sm bg-primary px-8 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Continue Shopping
        </button>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="font-serif text-xl text-muted-foreground">Your cart is empty.</p>
        <Link
          to="/products"
          className="rounded-sm bg-primary px-8 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Shop Now
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container py-8">
        <h1 className="mb-8 font-serif text-3xl font-bold text-foreground">Your Cart</h1>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div className="space-y-4">
            {items.map(({ product, quantity }) => {
              const price = parseFloat(String((product as any).price));
              const imageUrl = (product as any).image_url || (product as any).image || null;
              const volume = (product as any).volume_ml
                ? (product as any).volume_ml >= 1000
                  ? `${(product as any).volume_ml / 1000}L`
                  : `${(product as any).volume_ml}ml`
                : (product as any).volume || "";

              return (
                <div key={product.id} className="flex gap-4 rounded-sm border border-border bg-card p-4">
                  <Link to={`/product/${product.id}`} className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-secondary">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground uppercase">{(product as any).category}</div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.brand}</p>
                    <Link to={`/product/${product.id}`} className="font-serif text-sm font-semibold text-foreground hover:text-primary">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">{volume}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(product.id, quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-foreground">{quantity}</span>
                        <button onClick={() => updateQuantity(product.id, quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-sans text-sm font-bold text-foreground">${(price * quantity).toFixed(2)}</span>
                        <button onClick={() => removeItem(product.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="h-fit rounded-sm border border-border bg-card p-6">
            <h3 className="mb-5 font-serif text-lg font-bold text-foreground">Order Summary</h3>

            {/* Store display */}
            {selectedStore && (
              <p className="mb-4 text-xs text-muted-foreground">
                Store: <span className="font-semibold text-foreground">{selectedStore.name}</span>
              </p>
            )}

            {/* Fulfillment toggle */}
            <div className="mb-5 flex rounded-sm border border-border p-0.5">
              {(["pickup", "delivery"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFulfillment(type)}
                  className={`flex-1 rounded-sm py-2 text-xs font-medium capitalize transition-colors ${fulfillment === type ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-3 border-b border-border pb-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
              {fulfillment === "delivery" && (
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>
              )}
            </div>

            <div className="flex justify-between py-4 text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {/* Age confirm */}
            <label className="mb-4 flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
              <span className="text-xs leading-relaxed text-muted-foreground">
                I confirm I am 21 years of age or older and agree to the terms of purchase.
              </span>
            </label>

            {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

            <button
              onClick={placeOrder}
              disabled={!ageConfirmed || placing}
              className="w-full rounded-sm bg-primary py-4 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {placing ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order...</> : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
