import { useNavigate } from "react-router-dom";

const categories = [
  {
    name: "Whiskey",
    image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&h=800&fit=crop",
  },
  {
    name: "Wine",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=800&fit=crop",
  },
  {
    name: "Vodka",
    image: "https://images.unsplash.com/photo-1613063017139-e6e15ae01fb5?w=600&h=800&fit=crop",
  },
  {
    name: "Beer",
    image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&h=800&fit=crop",
  },
];

export default function CategoryCards() {
  const navigate = useNavigate();

  return (
    <section className="border-t border-border bg-background py-20">
      <div className="container">
        <h2 className="mb-12 text-center font-serif text-3xl font-bold text-foreground md:text-4xl">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate(`/products?category=${cat.name}`)}
              className="group relative aspect-[3/4] overflow-hidden rounded-sm"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-background/50 transition-colors group-hover:bg-background/40" />
              <div className="absolute inset-0 flex items-end p-5">
                <h3 className="font-serif text-xl font-bold text-foreground md:text-2xl">{cat.name}</h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
