/**
 * Seed script: inserts all 16 products + inventory into Supabase
 * Run with: node src/db/seed.js
 */
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Match the store IDs that were seeded in schema.sql
const STORES = {
    "sac-1": "a1000000-0000-0000-0000-000000000001",
    "sac-2": "a1000000-0000-0000-0000-000000000002",
    "sf-1": "a1000000-0000-0000-0000-000000000003",
    "la-1": "a1000000-0000-0000-0000-000000000004",
};

const products = [
    { name: "Blanton's Single Barrel", brand: "Blanton's", category: "Whiskey", abv: 46.5, volume_ml: 750, price: 79.99, sku: "BLA-001", description: "A Kentucky straight bourbon whiskey, hand-selected from a single barrel for exceptional character.", tasting_notes: "Rich caramel, vanilla, and dried fruit with a smooth oak finish.", image_url: null, inventory: { "sac-1": 12, "sac-2": 12, "sf-1": 12, "la-1": 12 } },
    { name: "Macallan 18 Year Sherry Oak", brand: "The Macallan", category: "Whiskey", abv: 43, volume_ml: 750, price: 349.99, sku: "MAC-018", description: "Matured exclusively in hand-picked sherry seasoned oak casks for a minimum of 18 years.", tasting_notes: "Dried fruits, ginger, chocolate, and warm spice with an extraordinarily long finish.", image_url: null, inventory: { "sac-1": 4, "sac-2": 3, "sf-1": 4, "la-1": 2 } },
    { name: "Opus One 2019", brand: "Opus One", category: "Wine", abv: 14.5, volume_ml: 750, price: 429.99, sku: "OPU-2019", description: "A Bordeaux-style blend from Napa Valley.", tasting_notes: "Blackcurrant, violet, and dark cherry with velvety tannins.", image_url: null, inventory: { "sac-1": 6, "sac-2": 4, "sf-1": 8, "la-1": 5 } },
    { name: "Grey Goose", brand: "Grey Goose", category: "Vodka", abv: 40, volume_ml: 1000, price: 34.99, sku: "GGV-1L", description: "Premium French vodka distilled from the finest soft winter wheat.", tasting_notes: "Clean, fresh, with subtle hints of almond sweetness.", image_url: null, inventory: { "sac-1": 30, "sac-2": 25, "sf-1": 30, "la-1": 40 } },
    { name: "Pliny the Elder", brand: "Russian River Brewing", category: "Beer", abv: 8, volume_ml: 510, price: 7.99, sku: "PTE-512", description: "A legendary double IPA from Russian River Brewing Company.", tasting_notes: "Intensely hoppy with notes of citrus, pine, and floral aromatics.", image_url: null, inventory: { "sac-1": 48, "sac-2": 12, "sf-1": 36, "la-1": 12 } },
    { name: "Don Julio 1942", brand: "Don Julio", category: "Tequila", abv: 40, volume_ml: 750, price: 169.99, sku: "DJ1942", description: "An ultra-premium añejo tequila aged for a minimum of two and a half years.", tasting_notes: "Warm oak, vanilla, roasted agave, and caramel with a long, rich finish.", image_url: null, inventory: { "sac-1": 5, "sac-2": 5, "sf-1": 4, "la-1": 7 } },
    { name: "Hibiki Harmony", brand: "Suntory", category: "Whiskey", abv: 43, volume_ml: 750, price: 99.99, sku: "HBK-HAR", description: "A meticulously blended Japanese whisky from Suntory's three distilleries.", tasting_notes: "Rose, lychee, hint of rosemary, mature woodiness, and sandalwood.", image_url: null, inventory: { "sac-1": 10, "sac-2": 8, "sf-1": 2, "la-1": 10 } },
    { name: "Caymus Napa Valley", brand: "Caymus", category: "Wine", abv: 14.8, volume_ml: 750, price: 89.99, sku: "CAY-NAP", description: "A signature Cabernet Sauvignon from the Wagner family in Napa Valley.", tasting_notes: "Dark chocolate, coconut, and vanilla with a rich, silky mouthfeel.", image_url: null, inventory: { "sac-1": 24, "sac-2": 20, "sf-1": 24, "la-1": 18 } },
    { name: "Casamigos Reposado", brand: "Casamigos", category: "Tequila", abv: 40, volume_ml: 750, price: 54.99, sku: "CAS-REP", description: "Smooth and clean with hints of caramel and vanilla.", tasting_notes: "Caramel with notes of cocoa, aged for seven months in American white oak.", image_url: null, inventory: { "sac-1": 20, "sac-2": 15, "sf-1": 20, "la-1": 20 } },
    { name: "Belvedere Vodka", brand: "Belvedere", category: "Vodka", abv: 40, volume_ml: 750, price: 29.99, sku: "BEL-750", description: "Crafted from 100% Polish Rye and distilled four times for exceptional purity.", tasting_notes: "Faint hint of vanilla along with some gentle, soft cream characteristics.", image_url: null, inventory: { "sac-1": 30, "sac-2": 25, "sf-1": 30, "la-1": 35 } },
    { name: "Hendrick's Gin", brand: "Hendrick's", category: "Gin", abv: 44, volume_ml: 750, price: 36.99, sku: "HEN-750", description: "An unusual gin from Scotland infused with rose and cucumber.", tasting_notes: "Huge, fragrant nose of rose petals and cucumber with a smooth finish.", image_url: null, inventory: { "sac-1": 15, "sac-2": 12, "sf-1": 15, "la-1": 15 } },
    { name: "Lagavulin 16 Year", brand: "Lagavulin", category: "Whiskey", abv: 43, volume_ml: 750, price: 94.99, sku: "LAG-016", description: "A quintessential Islay malt, aged for 16 years, known for its robust smokiness.", tasting_notes: "Intense peat smoke with iodine and seaweed and a rich, deep sweetness.", image_url: null, inventory: { "sac-1": 8, "sac-2": 6, "sf-1": 8, "la-1": 5 } },
    { name: "Guinness Draught", brand: "Guinness", category: "Beer", abv: 4.2, volume_ml: 440, price: 9.99, sku: "GUI-4PK", description: "The world's most famous stout, known for its smooth texture and rich heritage.", tasting_notes: "Ruby red with a creamy head and distinct roasted malt flavor.", image_url: null, inventory: { "sac-1": 50, "sac-2": 50, "sf-1": 50, "la-1": 50 } },
    { name: "Zacapa 23 Centenario", brand: "Ron Zacapa", category: "Rum", abv: 40, volume_ml: 750, price: 49.99, sku: "ZAC-023", description: "A premium Guatemalan rum aged using the Solera system at high altitude.", tasting_notes: "Caramel, oak, and spices with a complex and exceptionally smooth finish.", image_url: null, inventory: { "sac-1": 12, "sac-2": 10, "sf-1": 12, "la-1": 8 } },
    { name: "Bombay Sapphire", brand: "Bombay Sapphire", category: "Gin", abv: 47, volume_ml: 750, price: 24.99, sku: "BOM-750", description: "A world-renowned London Dry Gin vapor-infused with ten hand-picked botanicals.", tasting_notes: "Crisp, clean, and bright with notes of juniper, citrus, and pepper.", image_url: null, inventory: { "sac-1": 25, "sac-2": 20, "sf-1": 25, "la-1": 30 } },
    { name: "Diplomático Reserva", brand: "Diplomático", category: "Rum", abv: 40, volume_ml: 750, price: 39.99, sku: "DIP-RES", description: "A complex and elegant sipping rum from Venezuela, aged for up to 12 years.", tasting_notes: "Dark chocolate, coffee, and orange peel with a long, elegant finish.", image_url: null, inventory: { "sac-1": 10, "sac-2": 8, "sf-1": 10, "la-1": 10 } },
];

async function seed() {
    const client = await pool.connect();
    try {
        console.log("🌱 Seeding products...");

        for (const p of products) {
            // Upsert product by SKU
            const res = await client.query(
                `INSERT INTO products (name, brand, category, alcohol_percentage, volume_ml, sku, price, description, tasting_notes, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (sku) DO UPDATE SET
           name=$1, brand=$2, category=$3, alcohol_percentage=$4, volume_ml=$5,
           price=$7, description=$8, tasting_notes=$9
         RETURNING id, name`,
                [p.name, p.brand, p.category, p.abv, p.volume_ml, p.sku, p.price, p.description, p.tasting_notes, p.image_url]
            );

            const productId = res.rows[0].id;
            console.log(`  ✓ ${res.rows[0].name} (${productId})`);

            // Upsert inventory for each store
            for (const [oldStoreId, qty] of Object.entries(p.inventory)) {
                const dbStoreId = STORES[oldStoreId];
                if (!dbStoreId) continue;
                await client.query(
                    `INSERT INTO store_inventory (store_id, product_id, stock_quantity, low_stock_threshold)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (store_id, product_id) DO UPDATE SET stock_quantity=$3`,
                    [dbStoreId, productId, qty, 5]
                );
            }
        }

        console.log("\n✅ All products and inventory seeded successfully!");
    } catch (err) {
        console.error("❌ Seed error:", err.message);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
