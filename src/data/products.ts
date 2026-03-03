export interface Product {
  id: string;
  name: string;
  brand: string;
  category: "Whiskey" | "Wine" | "Vodka" | "Beer" | "Tequila" | "Rum" | "Gin";
  abv: number;
  volume: string;
  price: number;
  image: string;
  tastingNotes: string;
  description: string;
  storeInventory: Record<string, { quantity: number; status: "In Stock" | "Low Stock" | "Out of Stock" }>;
}

export const products: Product[] = [
  {
    id: "p1",
    name: "Blanton's Single Barrel",
    brand: "Blanton's",
    category: "Whiskey",
    abv: 46.5,
    volume: "750ml",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=500&fit=crop",
    tastingNotes: "Rich caramel, vanilla, and dried fruit with a smooth oak finish.",
    description: "A Kentucky straight bourbon whiskey, hand-selected from a single barrel for exceptional character.",
    storeInventory: {
      "sac-1": { quantity: 12, status: "In Stock" },
      "sac-2": { quantity: 2, status: "Low Stock" },
      "sf-1": { quantity: 0, status: "Out of Stock" },
      "la-1": { quantity: 8, status: "In Stock" },
    },
  },
  {
    id: "p2",
    name: "Macallan 18 Year Sherry Oak",
    brand: "The Macallan",
    category: "Whiskey",
    abv: 43,
    volume: "750ml",
    price: 349.99,
    image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=500&fit=crop",
    tastingNotes: "Dried fruits, ginger, chocolate, and warm spice with an extraordinarily long finish.",
    description: "Matured exclusively in hand-picked sherry seasoned oak casks for a minimum of 18 years.",
    storeInventory: {
      "sac-1": { quantity: 4, status: "In Stock" },
      "sac-2": { quantity: 0, status: "Out of Stock" },
      "sf-1": { quantity: 6, status: "In Stock" },
      "la-1": { quantity: 1, status: "Low Stock" },
    },
  },
  {
    id: "p3",
    name: "Opus One 2019",
    brand: "Opus One",
    category: "Wine",
    abv: 14.5,
    volume: "750ml",
    price: 429.99,
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=500&fit=crop",
    tastingNotes: "Blackcurrant, violet, and dark cherry with velvety tannins and a persistent finish.",
    description: "A Bordeaux-style blend from Napa Valley, crafted as a joint venture between Robert Mondavi and Baron Philippe de Rothschild.",
    storeInventory: {
      "sac-1": { quantity: 6, status: "In Stock" },
      "sac-2": { quantity: 3, status: "In Stock" },
      "sf-1": { quantity: 10, status: "In Stock" },
      "la-1": { quantity: 0, status: "Out of Stock" },
    },
  },
  {
    id: "p4",
    name: "Grey Goose",
    brand: "Grey Goose",
    category: "Vodka",
    abv: 40,
    volume: "1L",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1613063017139-e6e15ae01fb5?w=400&h=500&fit=crop",
    tastingNotes: "Clean, fresh, with subtle hints of almond sweetness and a smooth, elegant finish.",
    description: "Premium French vodka distilled from the finest soft winter wheat and pure spring water.",
    storeInventory: {
      "sac-1": { quantity: 30, status: "In Stock" },
      "sac-2": { quantity: 25, status: "In Stock" },
      "sf-1": { quantity: 18, status: "In Stock" },
      "la-1": { quantity: 22, status: "In Stock" },
    },
  },
  {
    id: "p5",
    name: "Pliny the Elder",
    brand: "Russian River Brewing",
    category: "Beer",
    abv: 8,
    volume: "510ml",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=500&fit=crop",
    tastingNotes: "Intensely hoppy with notes of citrus, pine, and floral aromatics.",
    description: "A legendary double IPA from Russian River Brewing Company, consistently rated as one of the best beers in the world.",
    storeInventory: {
      "sac-1": { quantity: 48, status: "In Stock" },
      "sac-2": { quantity: 0, status: "Out of Stock" },
      "sf-1": { quantity: 36, status: "In Stock" },
      "la-1": { quantity: 12, status: "In Stock" },
    },
  },
  {
    id: "p6",
    name: "Don Julio 1942",
    brand: "Don Julio",
    category: "Tequila",
    abv: 40,
    volume: "750ml",
    price: 169.99,
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=500&fit=crop",
    tastingNotes: "Warm oak, vanilla, roasted agave, and caramel with a long, rich finish.",
    description: "An ultra-premium añejo tequila aged for a minimum of two and a half years, honoring the year Don Julio González began his tequila-making journey.",
    storeInventory: {
      "sac-1": { quantity: 5, status: "In Stock" },
      "sac-2": { quantity: 3, status: "In Stock" },
      "sf-1": { quantity: 0, status: "Out of Stock" },
      "la-1": { quantity: 7, status: "In Stock" },
    },
  },
  {
    id: "p7",
    name: "Woodford Reserve",
    brand: "Woodford Reserve",
    category: "Whiskey",
    abv: 45.2,
    volume: "750ml",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1609767307815-bd12c9bfc6b3?w=400&h=500&fit=crop",
    tastingNotes: "Rich dried fruit, vanilla, and tobacco spice with a creamy, silky finish.",
    description: "A premium small-batch Kentucky straight bourbon whiskey, crafted in copper pot stills.",
    storeInventory: {
      "sac-1": { quantity: 20, status: "In Stock" },
      "sac-2": { quantity: 15, status: "In Stock" },
      "sf-1": { quantity: 10, status: "In Stock" },
      "la-1": { quantity: 18, status: "In Stock" },
    },
  },
  {
    id: "p8",
    name: "Château Margaux 2015",
    brand: "Château Margaux",
    category: "Wine",
    abv: 13.5,
    volume: "750ml",
    price: 899.99,
    image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=500&fit=crop",
    tastingNotes: "Intense cassis, truffle, and violet with impeccable balance and extraordinary length.",
    description: "A Premier Grand Cru Classé from Bordeaux, representing the pinnacle of French winemaking tradition.",
    storeInventory: {
      "sac-1": { quantity: 2, status: "Low Stock" },
      "sac-2": { quantity: 0, status: "Out of Stock" },
      "sf-1": { quantity: 3, status: "In Stock" },
      "la-1": { quantity: 1, status: "Low Stock" },
    },
  },
];

export const categories = ["Whiskey", "Wine", "Vodka", "Beer", "Tequila", "Rum", "Gin"] as const;
export const brands = [...new Set(products.map((p) => p.brand))];
