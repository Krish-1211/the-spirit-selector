import React from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";

const promoItems = [
    {
        id: 1,
        title: "Exclusive Whiskey Collection",
        subtitle: "Up to 15% off on rare finds and limited editions.",
        image: "/src/assets/promo_whiskey.png",
        cta: "Shop Whiskey",
        link: "/products?category=Whiskey",
    },
    {
        id: 2,
        title: "Vintage Wine Selection",
        subtitle: "Buy 2 and get 1 free on selected Bordeaux and Napa blends.",
        image: "/src/assets/promo_wine.png",
        cta: "Shop Wine",
        link: "/products?category=Wine",
    },
    {
        id: 3,
        title: "Same-Day Local Delivery",
        subtitle: "Free delivery on orders over $150. Experience the white-glove service.",
        image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=1600&h=800&fit=crop",
        cta: "Start Your Order",
        link: "/products",
    },
];

export default function PromoCarousel() {
    const navigate = useNavigate();
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    return (
        <section className="relative overflow-hidden bg-background">
            <Carousel
                plugins={[plugin.current]}
                className="w-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent>
                    {promoItems.map((item) => (
                        <CarouselItem key={item.id}>
                            <div className="relative h-[60vh] md:h-[80vh] w-full">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                                <div className="absolute inset-0 flex items-center">
                                    <div className="container px-6 md:px-12">
                                        <div className="max-w-2xl animate-fade-in">
                                            <h2 className="mb-4 font-serif text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
                                                {item.title}
                                            </h2>
                                            <p className="mb-8 text-lg text-gray-200 md:text-xl">
                                                {item.subtitle}
                                            </p>
                                            <Button
                                                size="lg"
                                                onClick={() => navigate(item.link)}
                                                className="rounded-sm bg-primary px-8 py-6 text-base font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
                                            >
                                                {item.cta}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="hidden md:block">
                    <CarouselPrevious className="left-8 border-white/20 bg-black/20 text-white hover:bg-black/40" />
                    <CarouselNext className="right-8 border-white/20 bg-black/20 text-white hover:bg-black/40" />
                </div>
            </Carousel>
        </section>
    );
}
