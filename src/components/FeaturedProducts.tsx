import { useState, useEffect } from "react";
import { api, DBProduct } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function FeaturedProducts() {
    const navigate = useNavigate();
    const [featured, setFeatured] = useState<DBProduct[]>([]);

    useEffect(() => {
        api.get<DBProduct[]>("/products")
            .then((products) => setFeatured(products.slice(0, 4)))
            .catch(console.error);
    }, []);

    if (featured.length === 0) return null;

    return (
        <section className="bg-background py-20">
            <div className="container">
                <div className="mb-12 flex items-end justify-between">
                    <div>
                        <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                            Trending Now
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Hand-picked favorites from our experts.
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/products")}
                        className="text-primary hover:text-primary/80"
                    >
                        View All Collection →
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                    {featured.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
