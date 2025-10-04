import { useEffect, useState, useRef } from "react";


// Basit yıldız ikonları
const Star = ({ filled }) => (
  <span style={{ color: filled ? "#E6CA97" : "#D9D9D9", fontSize: "16px" }}>★</span>
);

function App() {
  const [products, setProducts] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minPopularity, setMinPopularity] = useState("");
  const [maxPopularity, setMaxPopularity] = useState("");
  const scrollRef = useRef(null);

  const colorOrder = ["yellow", "rose", "white"];
  const colorNames = { yellow: "Yellow Gold", rose: "Rose Gold", white: "White Gold" };
  const colorValues = { yellow: "#E6CA97", rose: "#E1A4A9", white: "#D9D9D9" };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = (params = "") => {
    fetch(`http://localhost:5000/api/products${params}`)
      .then(res => res.json())
      .then(data => {
        const productsWithIndex = data.map(p => ({ ...p, selectedColor: "yellow" }));
        setProducts(productsWithIndex);
      })
      .catch(err => console.error(err));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (minPopularity) params.append("minPopularity", minPopularity);
    if (maxPopularity) params.append("maxPopularity", maxPopularity);
    fetchProducts(`?${params.toString()}`);
  };

  const scrollLeft = () => scrollRef.current.scrollBy({ left: -250, behavior: "smooth" });
  const scrollRight = () => scrollRef.current.scrollBy({ left: 250, behavior: "smooth" });

  const handleColorChange = (index, color) => {
    const updated = [...products];
    updated[index].selectedColor = color;
    setProducts(updated);
  };

  const renderStars = score => {
    const rating = Math.round(score * 5);
    return Array.from({ length: 5 }, (_, i) => <Star key={i} filled={i < rating} />);
  };

  return (
    <div style={{ position: "relative", padding: "20px" }}>
      <h1 style={{ textAlign: "center", fontFamily: "sans-serif", fontWeight: "normal" }}>Product List</h1>

      {/* Filtreleme Formu */}
      <div style={{ margin: "20px 0", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <input type="number" placeholder="Min Price" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ padding: "5px", width: "100px" }} />
        <input type="number" placeholder="Max Price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ padding: "5px", width: "100px" }} />
        <input type="number" placeholder="Min Popularity" value={minPopularity} onChange={e => setMinPopularity(e.target.value)} style={{ padding: "5px", width: "120px" }} />
        <input type="number" placeholder="Max Popularity" value={maxPopularity} onChange={e => setMaxPopularity(e.target.value)} style={{ padding: "5px", width: "120px" }} />
        <button onClick={applyFilters} style={{ padding: "5px 10px", backgroundColor: "#E6CA97", border: "none", cursor: "pointer" }}>Filter</button>
      </div>

      {/* Sol ok */}
      <button
        onClick={scrollLeft}
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "30px",
          height: "30px",
          cursor: "pointer",
        }}
      >
        ◀
      </button>

      {/* Sağ ok */}
      <button
        onClick={scrollRight}
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "30px",
          height: "30px",
          cursor: "pointer",
        }}
      >
        ▶
      </button>

      {/* Kart container */}
      <div ref={scrollRef} style={{ display: "flex", overflowX: "auto", gap: "20px", padding: "10px", scrollbarWidth: "thin" }}>
        {products.map((product, index) => (
          <div key={index} style={{ minWidth: "200px", maxWidth: "250px", width: "200px", padding: "20px", backgroundColor: "#fff", flexShrink: 0 }}>
            <img src={product.images[product.selectedColor]} alt={product.name} style={{ width: "100%", height: "auto", borderRadius: "20px", marginBottom: "10px" }} />
            <h3 style={{ margin: "5px 0", fontSize: "16px" }}>{product.name}</h3>
            <p>${product.price} USD</p>

            <div style={{ display: "flex", gap: "5px", marginBottom: "5px" }}>
              {colorOrder.map(color => (
                <button
                  key={color}
                  onClick={() => handleColorChange(index, color)}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: product.selectedColor === color ? "2px solid black" : "1px solid #ccc",
                    backgroundColor: colorValues[color],
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>

            <span style={{ fontSize: "12px", fontWeight: "normal" }}>{colorNames[product.selectedColor]}</span>

            <div style={{ marginTop: "5px" }}>
              {renderStars(product.popularityScore)} <span style={{ fontSize: "14px" }}>{product.popularityScore5}/5</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
