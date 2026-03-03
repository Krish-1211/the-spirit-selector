import blantons from "@/assets/blantons.png";
import macallan from "@/assets/macallan.png";
import wineRed from "@/assets/wine_red.png";
import greyGoose from "@/assets/grey_goose.png";
import beer from "@/assets/beer.png";
import tequila from "@/assets/tequila.png";
import hibiki from "@/assets/hibiki.png";
import woodford from "@/assets/woodford.png";
import zacapaRum from "@/assets/zacapa_rum.png";
import belvedere from "@/assets/belvedere.png";
import gin from "@/assets/gin.png";
import lagavulin from "@/assets/lagavulin.png";
import diplomatico from "@/assets/diplomatico.png";
import promoWhiskey from "@/assets/promo_whiskey.png";
import promoWine from "@/assets/promo_wine.png";

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
    image: blantons,
    tastingNotes: "Rich caramel, vanilla, and dried fruit with a smooth oak finish.",
    description: "A Kentucky straight bourbon whiskey, hand-selected from a single barrel for exceptional character.",
    storeInventory: {
      "sac-1": { quantity: 12, status: "In Stock" },
      "sac-2": { quantity: 12, status: "In Stock" },
      "sf-1": { quantity: 12, status: "In Stock" },
      "la-1": { quantity: 12, status: "In Stock" },
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
    image: macallan,
    tastingNotes: "Dried fruits, ginger, chocolate, and warm spice with an extraordinarily long finish.",
    description: "Matured exclusively in hand-picked sherry seasoned oak casks for a minimum of 18 years.",
    storeInventory: {
      "sac-1": { quantity: 4, status: "In Stock" },
      "sac-2": { quantity: 4, status: "In Stock" },
      "sf-1": { quantity: 4, status: "In Stock" },
      "la-1": { quantity: 4, status: "In Stock" },
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
    image: wineRed,
    tastingNotes: "Blackcurrant, violet, and dark cherry with velvety tannins and a persistent finish.",
    description: "A Bordeaux-style blend from Napa Valley, crafted as a joint venture between Robert Mondavi and Baron Philippe de Rothschild.",
    storeInventory: {
      "sac-1": { quantity: 6, status: "In Stock" },
      "sac-2": { quantity: 6, status: "In Stock" },
      "sf-1": { quantity: 6, status: "In Stock" },
      "la-1": { quantity: 6, status: "In Stock" },
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
    image: greyGoose,
    tastingNotes: "Clean, fresh, with subtle hints of almond sweetness and a smooth, elegant finish.",
    description: "Premium French vodka distilled from the finest soft winter wheat and pure spring water.",
    storeInventory: {
      "sac-1": { quantity: 30, status: "In Stock" },
      "sac-2": { quantity: 30, status: "In Stock" },
      "sf-1": { quantity: 30, status: "In Stock" },
      "la-1": { quantity: 30, status: "In Stock" },
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
    image: beer,
    tastingNotes: "Intensely hoppy with notes of citrus, pine, and floral aromatics.",
    description: "A legendary double IPA from Russian River Brewing Company, consistently rated as one of the best beers in the world.",
    storeInventory: {
      "sac-1": { quantity: 48, status: "In Stock" },
      "sac-2": { quantity: 12, status: "In Stock" },
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
    image: tequila,
    tastingNotes: "Warm oak, vanilla, roasted agave, and caramel with a long, rich finish.",
    description: "An ultra-premium añejo tequila aged for a minimum of two and a half years.",
    storeInventory: {
      "sac-1": { quantity: 5, status: "In Stock" },
      "sac-2": { quantity: 5, status: "In Stock" },
      "sf-1": { quantity: 4, status: "In Stock" },
      "la-1": { quantity: 7, status: "In Stock" },
    },
  },
  {
    id: "p7",
    name: "Hibiki Harmony",
    brand: "Suntory",
    category: "Whiskey",
    abv: 43,
    volume: "750ml",
    price: 99.99,
    image: hibiki,
    tastingNotes: "Rose, lychee, hint of rosemary, mature woodiness, and sandalwood.",
    description: "A meticulously blended Japanese whisky from Suntory's three distilleries.",
    storeInventory: {
      "sac-1": { quantity: 10, status: "In Stock" },
      "sac-2": { quantity: 10, status: "In Stock" },
      "sf-1": { quantity: 2, status: "Low Stock" },
      "la-1": { quantity: 10, status: "In Stock" },
    },
  },
  {
    id: "p8",
    name: "Caymus Napa Valley",
    brand: "Caymus",
    category: "Wine",
    abv: 14.8,
    volume: "750ml",
    price: 89.99,
    image: promoWine,
    tastingNotes: "Dark chocolate, coconut, and vanilla with a rich, silky mouthfeel.",
    description: "A signature Cabernet Sauvignon from the Wagner family in Napa Valley.",
    storeInventory: {
      "sac-1": { quantity: 24, status: "In Stock" },
      "sac-2": { quantity: 24, status: "In Stock" },
      "sf-1": { quantity: 24, status: "In Stock" },
      "la-1": { quantity: 24, status: "In Stock" },
    },
  },
  {
    id: "p9",
    name: "Casamigos Reposado",
    brand: "Casamigos",
    category: "Tequila",
    abv: 40,
    volume: "750ml",
    price: 54.99,
    image: tequila,
    tastingNotes: "Caramel with notes of cocoa, aged for seven months in American white oak.",
    description: "Smooth and clean with hints of caramel and vanilla.",
    storeInventory: {
      "sac-1": { quantity: 20, status: "In Stock" },
      "sac-2": { quantity: 20, status: "In Stock" },
      "sf-1": { quantity: 20, status: "In Stock" },
      "la-1": { quantity: 20, status: "In Stock" },
    },
  },
  {
    id: "p10",
    name: "Belvedere Vodka",
    brand: "Belvedere",
    category: "Vodka",
    abv: 40,
    volume: "750ml",
    price: 29.99,
    image: belvedere,
    tastingNotes: "Faint hint of vanilla along with some gentle, soft cream characteristics.",
    description: "Crafted from 100% Polish Rye and distilled four times for exceptional purity.",
    storeInventory: {
      "sac-1": { quantity: 30, status: "In Stock" },
      "sac-2": { quantity: 30, status: "In Stock" },
      "sf-1": { quantity: 30, status: "In Stock" },
      "la-1": { quantity: 30, status: "In Stock" },
    },
  },
  {
    id: "p11",
    name: "Hendrick's Gin",
    brand: "Hendrick's",
    category: "Gin",
    abv: 44,
    volume: "750ml",
    price: 36.99,
    image: gin,
    tastingNotes: "Huge, fragrant nose of rose petals and cucumber with a smooth finish.",
    description: "An unusual gin from Scotland infused with rose and cucumber for a unique profile.",
    storeInventory: {
      "sac-1": { quantity: 15, status: "In Stock" },
      "sac-2": { quantity: 15, status: "In Stock" },
      "sf-1": { quantity: 15, status: "In Stock" },
      "la-1": { quantity: 15, status: "In Stock" },
    },
  },
  {
    id: "p12",
    name: "Lagavulin 16 Year",
    brand: "Lagavulin",
    category: "Whiskey",
    abv: 43,
    volume: "750ml",
    price: 94.99,
    image: lagavulin,
    tastingNotes: "Intense peat smoke with iodine and seaweed and a rich, deep sweetness.",
    description: "A quintessential Islay malt, aged for 16 years and known for its robust smokiness.",
    storeInventory: {
      "sac-1": { quantity: 8, status: "In Stock" },
      "sac-2": { quantity: 8, status: "In Stock" },
      "sf-1": { quantity: 8, status: "In Stock" },
      "la-1": { quantity: 8, status: "In Stock" },
    },
  },
  {
    id: "p13",
    name: "Guinness Draught",
    brand: "Guinness",
    category: "Beer",
    abv: 4.2,
    volume: "14.9oz (4pk)",
    price: 9.99,
    image: beer,
    tastingNotes: "Ruby red with a creamy head and distinct roasted malt flavor.",
    description: "The world's most famous stout, known for its smooth texture and rich heritage.",
    storeInventory: {
      "sac-1": { quantity: 50, status: "In Stock" },
      "sac-2": { quantity: 50, status: "In Stock" },
      "sf-1": { quantity: 50, status: "In Stock" },
      "la-1": { quantity: 50, status: "In Stock" },
    },
  },
  {
    id: "p14",
    name: "Zacapa 23 Centenario",
    brand: "Ron Zacapa",
    category: "Rum",
    abv: 40,
    volume: "750ml",
    price: 49.99,
    image: zacapaRum,
    tastingNotes: "Caramel, oak, and spices with a complex and exceptionally smooth finish.",
    description: "A premium Guatemalan rum aged using the Solera system at high altitude.",
    storeInventory: {
      "sac-1": { quantity: 12, status: "In Stock" },
      "sac-2": { quantity: 12, status: "In Stock" },
      "sf-1": { quantity: 12, status: "In Stock" },
      "la-1": { quantity: 12, status: "In Stock" },
    },
  },
  {
    id: "p15",
    name: "Bombay Sapphire",
    brand: "Bombay Sapphire",
    category: "Gin",
    abv: 47,
    volume: "750ml",
    price: 24.99,
    image: gin,
    tastingNotes: "Crisp, clean, and bright with notes of juniper, citrus, and pepper.",
    description: "A world-renowned London Dry Gin vapor-infused with ten hand-picked botanicals.",
    storeInventory: {
      "sac-1": { quantity: 25, status: "In Stock" },
      "sac-2": { quantity: 25, status: "In Stock" },
      "sf-1": { quantity: 25, status: "In Stock" },
      "la-1": { quantity: 25, status: "In Stock" },
    },
  },
  {
    id: "p16",
    name: "Diplomático Reserva",
    brand: "Diplomático",
    category: "Rum",
    abv: 40,
    volume: "750ml",
    price: 39.99,
    image: diplomatico,
    tastingNotes: "Dark chocolate, coffee, and orange peel with a long, elegant finish.",
    description: "A complex and elegant sipping rum from Venezuela, aged for up to 12 years.",
    storeInventory: {
      "sac-1": { quantity: 10, status: "In Stock" },
      "sac-2": { quantity: 10, status: "In Stock" },
      "sf-1": { quantity: 10, status: "In Stock" },
      "la-1": { quantity: 10, status: "In Stock" },
    },
  },
];

export const categories = ["Whiskey", "Wine", "Vodka", "Beer", "Tequila", "Rum", "Gin"] as const;
export const brands = [...new Set(products.map((p) => p.brand))];
