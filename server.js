const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

const productsFilePath = path.join(__dirname, "data", "products.json");

async function getGoldPrice() {
  try {
    const response = await fetch("https://www.goldapi.io/api/XAU/USD", {
      headers: {
        "x-access-token": "goldapi-2snvtbdsmgcdgzc4-io", // buraya kendi API keyini yaz
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    // Gram altın fiyatını dolar cinsinden dönelim
    return data.price_gram_24k; 
  } catch (error) {
    console.error("Altın fiyatı alınamadı:", error);
    return 65; // hata olursa sabit değer kullan
  }
}

// API endpoint → ürünleri getir ve filtrele
app.get("/api/products", async (req, res) => {
  try {
    const products = JSON.parse(fs.readFileSync(productsFilePath, "utf-8"));
    const goldPrice = await getGoldPrice(); // burda async await çalışır

    const updatedProducts = products.map((p) => {
      const price = (p.popularityScore + 1) * p.weight * goldPrice;
      return {
        ...p,
        price: parseFloat(price.toFixed(2)),
        popularityScore5: parseFloat((p.popularityScore * 5).toFixed(1)),
      };
    });

    //res.json(updatedProducts);

    
    // Query parametrelerini al
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Infinity;
    const minPopularity = req.query.minPopularity ? parseFloat(req.query.minPopularity) : 0;
    const maxPopularity = req.query.maxPopularity ? parseFloat(req.query.maxPopularity) : 5;

   /* // Fiyat ve 5 üzerinden popülerlik ekle
    const updatedProducts = products.map((p) => {
      const price = (p.popularityScore + 1) * p.weight * 65; // sabit gram altın USD
      return {
        ...p,
        price: parseFloat(price.toFixed(2)),
        popularityScore5: parseFloat((p.popularityScore * 5).toFixed(1)),
      };
    });*/

    // Filtre uygula  //http://localhost:5000/api/products?minPrice=200&maxPrice=500&minPopularity=2&maxPopularity=4 ile backend'de ürünler filtrelenebilir bu bir örnektir.
    const filteredProducts = updatedProducts.filter(
      (p) =>
        p.price >= minPrice &&
        p.price <= maxPrice &&
        p.popularityScore5 >= minPopularity &&
        p.popularityScore5 <= maxPopularity
    );

    res.json(filteredProducts);
  } catch (err) {
    res.status(500).json({ error: "Ürünler yüklenemedi" });
  }
});

// Sunucuyu başlat
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend API çalışıyor → http://localhost:${PORT}`);
});
