// In production VITE_API_URL points to the Render backend (e.g. https://reserve-api.onrender.com)
// In development it's empty so requests go through Vite's /api proxy to localhost:3001
const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
        request<T>(path, { method: "POST", body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) =>
        request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
};

// ─── Type definitions matching the backend ───────────────────────────────────

export interface DBStore {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    phone: string;
    is_active: boolean;
    created_at: string;
}

export interface DBProduct {
    id: string;
    name: string;
    brand: string;
    category: string;
    alcohol_percentage: number;
    volume_ml: number;
    sku: string;
    price: string; // Postgres returns numeric as string
    description: string;
    tasting_notes: string;
    image_url: string | null;
    is_active: boolean;
    stock_quantity?: number;
    reserved_quantity?: number;
    availability?: "in_stock" | "low_stock" | "out_of_stock" | "unavailable";
}

export interface OrderPayload {
    store_id: string;
    delivery_type: "pickup" | "delivery";
    delivery_address?: string;
    notes?: string;
    items: { product_id: string; quantity: number; unit_price: number }[];
}
