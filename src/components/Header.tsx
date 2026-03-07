import { Search, ShoppingCart, User, MapPin, ChevronDown, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const { selectedStore, fulfillment, setFulfillment, setShowStoreModal } = useStore();
  const { totalItems } = useCart();
  const { customer, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowAccountMenu(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center gap-4 lg:h-20">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <h1 className="font-serif text-xl font-bold tracking-wide text-foreground lg:text-2xl">
            COMPANY<span className="text-primary">.</span>
          </h1>
        </Link>

        {/* Search */}
        <div className="relative mx-4 hidden flex-1 md:block lg:mx-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search spirits, wines, beers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            }}
            className="h-10 w-full rounded-sm border border-border bg-secondary pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Store selector */}
        <button
          onClick={() => setShowStoreModal(true)}
          className="hidden items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm transition-colors hover:border-primary/50 lg:flex"
        >
          <MapPin className="h-4 w-4 text-primary" />
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {fulfillment === "pickup" ? "Pickup at" : "Delivery from"}
            </p>
            <p className="max-w-[160px] truncate text-xs font-medium text-foreground">
              {selectedStore ? `${selectedStore.city}, ${selectedStore.state}` : "Select Store"}
            </p>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>

        {/* Fulfillment toggle */}
        <div className="hidden items-center rounded-sm border border-border p-0.5 text-xs xl:flex">
          <button
            onClick={() => setFulfillment("pickup")}
            className={`rounded-sm px-3 py-1.5 font-medium transition-colors ${fulfillment === "pickup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Pickup
          </button>
          <button
            onClick={() => setFulfillment("delivery")}
            className={`rounded-sm px-3 py-1.5 font-medium transition-colors ${fulfillment === "delivery" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Delivery
          </button>
        </div>

        {/* Account */}
        <div className="relative" ref={menuRef}>
          {customer ? (
            <>
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary uppercase transition-colors hover:bg-primary/20"
              >
                {customer.first_name[0]}{customer.last_name[0]}
              </button>
              {showAccountMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-sm border border-border bg-card shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{customer.first_name} {customer.last_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                  </div>
                  <button
                    onClick={() => { logout(); setShowAccountMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-red-400 hover:bg-secondary/50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link to="/account" className="rounded-sm p-2 text-muted-foreground transition-colors hover:text-foreground">
              <User className="h-5 w-5" />
            </Link>
          )}
        </div>

        {/* Cart */}
        <Link
          to="/cart"
          className="relative rounded-sm p-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
