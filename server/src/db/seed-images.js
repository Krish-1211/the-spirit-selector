/**
 * Updates image_url for all products using locally hosted images at /images/*.
 * These files live in Liquor/public/images/ and are served by Vite.
 * Run with: node src/db/seed-images.js
 */
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// All images are served from the Vite public/ folder — always loads, no CDN issues
const productImages = [
    { sku: "BLA-001", image_url: "/images/blantons.png" },
    { sku: "MAC-018", image_url: "/images/macallan.png" },
    { sku: "OPU-2019", image_url: "/images/opus_one.png" },
    { sku: "GGV-1L", image_url: "/images/grey_goose.png" },
    { sku: "PTE-512", image_url: "/images/pliny.png" },
    { sku: "DJ1942", image_url: "/images/tequila.png" },
    { sku: "HBK-HAR", image_url: "/images/hibiki.png" },
    { sku: "CAY-NAP", image_url: "/images/caymus.png" },
    { sku: "CAS-REP", image_url: "/images/casamigos.png" },
    { sku: "BEL-750", image_url: "/images/belvedere.png" },
    { sku: "HEN-750", image_url: "/images/gin.png" },
    { sku: "LAG-016", image_url: "/images/lagavulin.png" },
    { sku: "GUI-4PK", image_url: "/images/guinness.png" },
    { sku: "ZAC-023", image_url: "/images/zacapa_rum.png" },
    { sku: "BOM-750", image_url: "/images/bombay.png" },
    { sku: "DIP-RES", image_url: "/images/diplomatico.png" },
];

async function seedImages() {
    const client = await pool.connect();
    try {
        console.log("🖼️  Updating product images...\n");
        for (const { sku, image_url } of productImages) {
            const res = await client.query(
                "UPDATE products SET image_url = $1 WHERE sku = $2 RETURNING name",
                [image_url, sku]
            );
            if (res.rows[0]) {
                console.log(`  ✓ ${res.rows[0].name}  →  ${image_url}`);
            } else {
                console.log(`  ⚠  SKU not found: ${sku}`);
            }
        }
        console.log("\n✅ All product images updated!");
    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        client.release();
        pool.end();
    }
}

seedImages();
