import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, DBStore } from "@/lib/api";

// Re-export so other files that import Store still work
export type Store = DBStore;

interface StoreContextType {
  stores: Store[];
  selectedStore: Store | null;
  setSelectedStore: (store: Store) => void;
  fulfillment: "pickup" | "delivery";
  setFulfillment: (type: "pickup" | "delivery") => void;
  showStoreModal: boolean;
  setShowStoreModal: (show: boolean) => void;
  loadingStores: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [loadingStores, setLoadingStores] = useState(true);

  useEffect(() => {
    api.get<Store[]>("/stores")
      .then((data) => {
        setStores(data);
        // Auto-select first store if none chosen
        if (!selectedStore && data.length > 0) setSelectedStore(data[0]);
      })
      .catch(console.error)
      .finally(() => setLoadingStores(false));
  }, []);

  return (
    <StoreContext.Provider
      value={{ stores, selectedStore, setSelectedStore, fulfillment, setFulfillment, showStoreModal, setShowStoreModal, loadingStores }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
