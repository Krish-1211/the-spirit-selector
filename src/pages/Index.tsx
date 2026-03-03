import HeroSection from "@/components/HeroSection";
import CategoryCards from "@/components/CategoryCards";

const Index = () => {
  return (
    <main>
      <HeroSection />
      <CategoryCards />
      <footer className="border-t border-border bg-card py-10">
        <div className="container text-center">
          <p className="font-serif text-lg font-bold tracking-wide text-foreground">
            RESERVE<span className="text-primary">.</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Must be 21+ to purchase. Please drink responsibly.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Index;
