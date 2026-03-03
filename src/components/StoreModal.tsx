import { useState } from "react";
import { X, Search, MapPin, Clock, Check } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { stores, Store } from "@/data/stores";

export default function StoreModal() {
  const { showStoreModal, setShowStoreModal, selectedStore, setSelectedStore, fulfillment, setFulfillment } = useStore();
  const [zip, setZip] = useState("");

  if (!showStoreModal) return null;

  const filteredStores = zip
    ? stores.filter((s) => s.zip.startsWith(zip) || s.city.toLowerCase().includes(zip.toLowerCase()))
    : stores;

  const handleSelect = (store: Store) => {
    setSelectedStore(store);
    setShowStoreModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg border border-border bg-card p-0 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-serif text-2xl font-bold text-foreground">Select Your Store</h2>
          {selectedStore && (
            <button onClick={() => setShowStoreModal(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Fulfillment toggle */}
          <div className="mb-5 flex rounded-sm border border-border p-0.5">
            <button
              onClick={() => setFulfillment("pickup")}
              className={`flex-1 rounded-sm py-2.5 text-sm font-medium transition-colors ${
                fulfillment === "pickup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pickup
            </button>
            <button
              onClick={() => setFulfillment("delivery")}
              className={`flex-1 rounded-sm py-2.5 text-sm font-medium transition-colors ${
                fulfillment === "delivery" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Delivery
            </button>
          </div>

          {/* ZIP search */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter ZIP code or city"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="h-11 w-full rounded-sm border border-border bg-secondary pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Store list */}
          <div className="max-h-[340px] space-y-3 overflow-y-auto pr-1">
            {filteredStores.map((store) => {
              const isSelected = selectedStore?.id === store.id;
              return (
                <div
                  key={store.id}
                  className={`rounded-sm border p-4 transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{store.name}</h3>
                        {isSelected && (
                          <span className="flex items-center gap-1 rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                            <Check className="h-3 w-3" /> My Store
                          </span>
                        )}
                      </div>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {store.address}, {store.city}, {store.state} {store.zip}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {store.hours}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {store.distance !== undefined && (
                        <span className="text-xs text-muted-foreground">{store.distance} mi</span>
                      )}
                      {!isSelected && (
                        <button
                          onClick={() => handleSelect(store)}
                          className="rounded-sm bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          Select Store
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
