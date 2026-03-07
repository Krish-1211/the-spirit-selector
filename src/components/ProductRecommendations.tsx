import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, DBProduct } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { Sparkles, ShoppingBag, Bell, AlertCircle } from "lucide-react";

interface RecommendedProduct extends DBProduct {
    match_tier: number;
    match_reason: string;
}

export default function ProductRecommendations({ productId }: { productId: string }) {
    const { selectedStore } = useStore();
    const { addItem } = useCart();

    const { data: recommendations, isLoading, error } = useQuery<RecommendedProduct[]>({
        queryKey: ["product-recommendations", productId, selectedStore?.id],
        queryFn: () => {
            const params = new URLSearchParams();
            if (selectedStore?.id) params.set("store_id", selectedStore.id);
            return api.get(`/products/${productId}/recommendations?${params}`);
        },
        enabled: !!productId,
    });

    if (isLoading) {
        return (
            <div className="mt-12 mb-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="text-yellow-500 animate-pulse" size={20} />
                    <h3 className="font-serif text-xl font-bold text-white">Finding smart suggestions...</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse flex flex-col gap-2">
                            <div className="bg-white/5 aspect-[4/5] rounded-sm w-full"></div>
                            <div className="h-4 bg-white/5 w-2/3 rounded mt-2"></div>
                            <div className="h-3 bg-white/5 w-1/2 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !recommendations || recommendations.length === 0) {
        return null;
    }

    return (
        <div className="mt-16 mb-8 pt-10 border-t border-white/10">
            <div className="flex items-center gap-2 justify-between mb-8">
                <h3 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="text-yellow-500" size={24} />
                    Recommended For You
                </h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map((product) => {
                    const isOutOfStock = product.availability === 'out_of_stock' || product.availability === 'unavailable';
                    const isLowStock = product.availability === 'low_stock';

                    return (
                        <div key={product.id} className="group relative flex flex-col bg-[#0f0f0f] border border-white/5 rounded-md overflow-hidden hover:border-white/20 transition-all shadow-md">
                            {/* Visual Badging */}
                            <div className="absolute top-2 left-2 z-10">
                                {product.match_tier === 1 && (
                                    <span className="bg-yellow-500/20 text-yellow-400 text-[9px] uppercase tracking-widest px-2 py-1 rounded font-bold border border-yellow-500/20 flex items-center gap-1 backdrop-blur-md">
                                        <Sparkles size={10} /> BEST MATCH
                                    </span>
                                )}
                            </div>

                            {/* Stock Badge */}
                            <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
                                {isOutOfStock && (
                                    <span className="bg-red-500/80 text-white text-[9px] uppercase tracking-widest px-2 py-1 rounded font-bold shadow-sm backdrop-blur-md">
                                        Sold Out
                                    </span>
                                )}
                                {isLowStock && !isOutOfStock && (
                                    <span className="bg-orange-500/80 text-white text-[9px] uppercase tracking-widest px-2 py-1 rounded font-bold shadow-sm backdrop-blur-md">
                                        Low Stock
                                    </span>
                                )}
                            </div>

                            {/* Product Image */}
                            <Link to={`/products/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-black/40">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-40 grayscale blur-[1px]' : ''}`}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20 uppercase tracking-widest text-xs font-serif">
                                        {product.category}
                                    </div>
                                )}
                            </Link>

                            {/* Details */}
                            <div className="p-4 flex flex-col flex-1">
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 line-clamp-1">{product.brand}</p>
                                <Link to={`/products/${product.id}`} className="block block group-hover:text-white transition-colors">
                                    <h4 className="font-serif font-bold text-gray-200 text-sm mb-1 line-clamp-2 leading-snug">{product.name}</h4>
                                </Link>
                                <p className="text-[10px] text-gray-400 italic mb-auto pb-2">{product.match_reason}</p>

                                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                                    <p className="font-bold text-white text-base">${parseFloat(product.price).toFixed(2)}</p>

                                    {isOutOfStock ? (
                                        <button
                                            disabled
                                            className="bg-white/5 hover:bg-white/10 text-gray-400 p-2 rounded-full transition-colors group-hover:text-white"
                                            title="Notify Me when back in stock"
                                        >
                                            <Bell size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                addItem(product as any);
                                            }}
                                            className="bg-[#8b1a1a] hover:bg-[#a02020] text-white p-2 flex items-center justify-center rounded-full transition-colors shadow-lg hover:shadow-red-900/20"
                                            title="Add to Cart"
                                        >
                                            <ShoppingBag size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
