import PromoCarousel from "@/components/PromoCarousel";
import CategoryCards from "@/components/CategoryCards";
import FeaturedProducts from "@/components/FeaturedProducts";
import OfferBanner from "@/components/OfferBanner";
import InfoSection from "@/components/InfoSection";

const Index = () => {
  return (
    <main className="flex flex-col gap-0">
      {/* Advertisements and Offers Carousel (Replaces static Hero) */}
      <PromoCarousel />

      {/* Direct Category Access */}
      <CategoryCards />

      {/* Trendy/Featured Content as the user scrolls */}
      <FeaturedProducts />

      {/* Mid-page Promotional Banner */}
      <OfferBanner />

      {/* Descriptive Info and Content */}
      <InfoSection />

      <footer className="border-t border-border bg-card py-16">
        <div className="container text-center">
          <p className="font-serif text-3xl font-bold tracking-widest text-foreground">
            RESERVE<span className="text-primary">.</span>
          </p>
          <div className="mt-8 flex justify-center gap-8 text-sm text-muted-foreground uppercase tracking-widest font-semibold">
            <a href="#" className="hover:text-primary transition-colors">Our Story</a>
            <a href="#" className="hover:text-primary transition-colors">Locations</a>
            <a href="#" className="hover:text-primary transition-colors">Expert Help</a>
            <a href="#" className="hover:text-primary transition-colors">Private Events</a>
          </div>
          <p className="mt-12 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Must be 21+ to purchase. Please drink responsibly. Government Warning: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.
          </p>
          <p className="mt-8 text-[10px] text-muted-foreground/50 uppercase tracking-tighter">
            © 2026 Reserve Premium Spirits. All Rights Reserved.
          </p>
          <a
            href="/admin"
            className="mt-6 inline-block text-[10px] uppercase tracking-widest text-muted-foreground/30 hover:text-muted-foreground transition-colors"
          >
            Staff Admin Panel
          </a>
        </div>
      </footer>
    </main>
  );
};

export default Index;

