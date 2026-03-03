import { useStore } from "@/context/StoreContext";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

export default function HeroSection() {
  const { selectedStore, setShowStoreModal } = useStore();
  const navigate = useNavigate();

  const handleCta = () => {
    if (!selectedStore) {
      setShowStoreModal(true);
    } else {
      navigate("/products");
    }
  };

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/70" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h1
          className="mb-6 font-serif text-5xl font-bold leading-tight tracking-tight text-foreground opacity-0 animate-fade-in md:text-7xl"
        >
          Elevate Your
          <br />
          Collection<span className="text-primary">.</span>
        </h1>
        <p
          className="mx-auto mb-10 max-w-md text-lg text-muted-foreground opacity-0 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          Premium Spirits. Delivered with Precision.
        </p>
        <button
          onClick={handleCta}
          className="rounded-sm bg-primary px-10 py-4 font-sans text-sm font-semibold uppercase tracking-widest text-primary-foreground opacity-0 transition-colors animate-fade-in hover:bg-primary/90"
          style={{ animationDelay: "0.4s" }}
        >
          Enter Store
        </button>
      </div>
    </section>
  );
}
