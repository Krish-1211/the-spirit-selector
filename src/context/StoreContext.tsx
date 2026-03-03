import { createContext, useContext, useState, ReactNode } from "react";
import { Store } from "@/data/stores";

interface StoreContextType {
  selectedStore: Store | null;
  setSelectedStore: (store: Store) => void;
  fulfillment: "pickup" | "delivery";
  setFulfillment: (type: "pickup" | "delivery") => void;
  showStoreModal: boolean;
  setShowStoreModal: (show: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [showStoreModal, setShowStoreModal] = useState(false);

  return (
    <StoreContext.Provider
      value={{ selectedStore, setSelectedStore, fulfillment, setFulfillment, showStoreModal, setShowStoreModal }}
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
