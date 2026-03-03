import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { fulfillment, setFulfillment } = useStore();
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const tax = subtotal * 0.0875;
  const total = subtotal + tax;

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
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-4 rounded-sm border border-border bg-card p-4"
              >
                <Link to={`/product/${product.id}`} className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-sm">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.brand}</p>
                  <Link to={`/product/${product.id}`} className="font-serif text-sm font-semibold text-foreground hover:text-primary">
                    {product.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">{product.volume}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-foreground">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-sans text-sm font-bold text-foreground">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                      <button onClick={() => removeItem(product.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="h-fit rounded-sm border border-border bg-card p-6">
            <h3 className="mb-5 font-serif text-lg font-bold text-foreground">Order Summary</h3>

            {/* Fulfillment toggle */}
            <div className="mb-5 flex rounded-sm border border-border p-0.5">
              <button
                onClick={() => setFulfillment("pickup")}
                className={`flex-1 rounded-sm py-2 text-xs font-medium transition-colors ${
                  fulfillment === "pickup"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pickup
              </button>
              <button
                onClick={() => setFulfillment("delivery")}
                className={`flex-1 rounded-sm py-2 text-xs font-medium transition-colors ${
                  fulfillment === "delivery"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Delivery
              </button>
            </div>

            <div className="space-y-3 border-b border-border pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Tax</span>
                <span className="text-foreground">${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between py-4 text-lg font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">${total.toFixed(2)}</span>
            </div>

            {/* Age confirm */}
            <label className="mb-5 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                I confirm I am 21 years of age or older and agree to the terms of purchase.
              </span>
            </label>

            <button
              disabled={!ageConfirmed}
              className="w-full rounded-sm bg-primary py-4 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
