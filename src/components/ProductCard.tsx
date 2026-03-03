import { Link } from "react-router-dom";
import { DBProduct } from "@/lib/api";
import { useCart } from "@/context/CartContext";

interface Props {
  product: DBProduct;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const price = parseFloat(product.price);

  return (
    <div className="group flex flex-col rounded-sm border border-border bg-card transition-colors hover:border-primary/30">
      <Link to={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-card flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">
            {product.category}
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">{product.brand}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="mb-2 font-serif text-base font-semibold leading-snug text-foreground transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
          {product.alcohol_percentage && <span>{product.alcohol_percentage}% ABV</span>}
          {product.alcohol_percentage && product.volume_ml && <span className="h-3 w-px bg-border" />}
          {product.volume_ml && <span>{product.volume_ml >= 1000 ? `${product.volume_ml / 1000}L` : `${product.volume_ml}ml`}</span>}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-sans text-lg font-bold text-foreground">${price.toFixed(2)}</span>
        </div>
        <button
          onClick={() => addItem(product as any)}
          className="mt-3 w-full rounded-sm bg-primary py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
