import { useState, useEffect } from "react";
import "./All_Product.css";
import axios from 'axios';

const All_Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // ฟังก์ชันสำหรับสร้าง URL ของรูปภาพจาก Strapi
  const getImageUrl = (product) => {
    if (product.image && product.image.length > 0) {
      // ดึง URL จากรูปภาพแรกในอาร์เรย์
      const imageUrl = product.image[0].url;
      
      // เติม base URL ของ Strapi หากเป็น relative path
      return `http://localhost:1337${imageUrl}`;
    }
    
    // กรณีไม่มีรูปภาพ
    return "/product-images/default.jpg";
  };

  return (
    <div className="all-product-container">
      <h1 className="all-product-title">ALL Product</h1>
      
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-image">
                <img 
                  src={getImageUrl(product)} 
                  alt={product.name}
                  onError={(e) => {
                    console.error("Image not found:", e.target.src);
                    e.target.src = "/product-images/default.jpg"; // รูป default ถ้าโหลดไม่ได้
                  }}
                />
               
              </div>
              
              <div className="product-info">
                <h3>{product.name}</h3>
                <button className="add-to-cart-btn">+</button>
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