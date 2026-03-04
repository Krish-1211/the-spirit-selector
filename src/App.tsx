import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StoreProvider } from "@/context/StoreContext";
import { CartProvider } from "@/context/CartContext";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import Header from "@/components/Header";
import StoreModal from "@/components/StoreModal";
import AdminLayout from "@/components/admin/AdminLayout";
import AgeVerificationModal from "@/components/AgeVerificationModal";


// Public pages
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import CustomerAuthPage from "./pages/CustomerAuthPage";

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminInventoryPage from "./pages/admin/AdminInventoryPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminInvoicesPage from "./pages/admin/AdminInvoicesPage";
import AdminClientsPage from "./pages/admin/AdminClientsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

// ── Protected admin routes wrapper ────────────────────────────────────────────
function AdminRoutes() {
  const { user, isLoading } = useAdminAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/products" element={<AdminProductsPage />} />
        <Route path="/inventory" element={<AdminInventoryPage />} />
        <Route path="/orders" element={<AdminOrdersPage />} />
        <Route path="/invoices" element={<AdminInvoicesPage />} />
        <Route path="/clients" element={<AdminClientsPage />} />
        <Route path="/settings" element={<AdminSettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

// ── Public storefront wrapper ─────────────────────────────────────────────────
function PublicRoutes() {
  return (
    <>
      <Header />
      <StoreModal />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/account" element={<CustomerAuthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminAuthProvider>
        <CustomerAuthProvider>
          <StoreProvider>
            <CartProvider>
              <AgeVerificationModal />
              <Toaster />
              <Sonner />

              <BrowserRouter>
                <Routes>
                  {/* Admin section — fully isolated, no public header */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/admin/*" element={<AdminRoutes />} />
                  {/* Public storefront */}
                  <Route path="/*" element={<PublicRoutes />} />
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </StoreProvider>
        </CustomerAuthProvider>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
