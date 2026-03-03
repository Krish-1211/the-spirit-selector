import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { selectedStore } = useStore();
  const { addItem } = useCart();

  const inventory = selectedStore ? product.storeInventory[selectedStore.id] : null;
  const status = inventory?.status ?? "Out of Stock";

  return (
    <div className="group flex flex-col rounded-sm border border-border bg-card transition-colors hover:border-primary/30">
      <Link to={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">{product.brand}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="mb-2 font-serif text-base font-semibold leading-snug text-foreground transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{product.abv}% ABV</span>
          <span className="h-3 w-px bg-border" />
          <span>{product.volume}</span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-sans text-lg font-bold text-foreground">${product.price.toFixed(2)}</span>
          <span
            className={`text-xs font-medium ${
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
        <button
          onClick={() => addItem(product)}
          disabled={status === "Out of Stock"}
          className="mt-3 w-full rounded-sm bg-primary py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "Out of Stock" ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
