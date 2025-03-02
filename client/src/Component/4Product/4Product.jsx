import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./4Product.css";

const Product_4 = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const getImageUrl = (product) => {
    if (product.image && product.image.length > 0) {
      return `http://localhost:1337${product.image[0].url}`;
    }
    return "/product-images/default.jpg";
  };

  return (
    <div className="all-product-container">
      <h1 className="all-product-title">Best seller of the year</h1>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="products-grid">
          {products.slice(0, 4).map((product) => (
            <div className="product-card" key={product.documentId}>
              <div className="product-image">
                {/* ใช้ Link เพื่อ navigate โดยส่ง documentId ไปใน URL */}
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
                <p className="product-price">THB {product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Product_4;
