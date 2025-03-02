import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./All_Product.css";

const All_Product = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ดึงค่าค้นหาจาก URL
  const getSearchQuery = () => {
    const params = new URLSearchParams(location.search);
    return params.get("search") || "";
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/products?populate=*");
        const result = await response.json();
        setProducts(result.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // กรองสินค้าตามคำค้นหาเมื่อ URL เปลี่ยนหรือเมื่อโหลดสินค้าเสร็จ
  useEffect(() => {
    if (products.length > 0) {
      const searchQuery = getSearchQuery().toLowerCase();
      
      if (searchQuery) {
        const filtered = products.filter(product => 
          product.name.toLowerCase().includes(searchQuery) || 
          (product.description && product.description.toLowerCase().includes(searchQuery)) ||
          (product.genre && product.genre.toLowerCase().includes(searchQuery))
        );
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts(products);
      }
    }
  }, [location.search, products]);

  const getImageUrl = (product) => {
    if (product.image && product.image.length > 0) {
      return `http://localhost:1337${product.image[0].url}`;
    }
    return "/product-images/default.jpg";
  };

  // เพิ่มสินค้าลงตะกร้า (นี่เป็นแค่ฟังก์ชันตัวอย่าง คุณต้องเชื่อมต่อกับ API จริง)
  const handleAddToCart = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = sessionStorage.getItem("token");
    if (!token) {
      // แจ้งเตือนให้เข้าสู่ระบบก่อน
      alert("Please log in before adding products to cart");
      navigate("/login");
      return;
    }

    // ตรงนี้ควรมีการเรียก API เพื่อเพิ่มสินค้าลงตะกร้า
    alert(`Added product ID: ${productId} to cart`);
  };

  const searchQuery = getSearchQuery();

  return (
    <div className="all-product-container">
      <h1 className="all-product-title">
        {searchQuery 
          ? `Search Results: "${searchQuery}" (${filteredProducts.length} items)` 
          : "ALL Products"}
      </h1>
      
      {loading ? (
        <p>Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <div className="no-results">
          <p>No products found matching "{searchQuery}"</p>
          <button onClick={() => navigate("/store")}>View All Products</button>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product.documentId}>
              <div className="product-image">
                <Link to={`/product/${product.documentId}`}>
                  <img
                    src={getImageUrl(product)}
                    alt={product.name}
                    onError={(e) => {
                      console.error("Image not found:", e.target.src);
                      e.target.src = "/product-images/default.jpg";
                    }}
                  />
                </Link>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <button 
                  className="add-to-cart-btn" 
                  onClick={(e) => handleAddToCart(e, product.documentId)}
                >+</button>
                <p className="product-price">THB {product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default All_Product;