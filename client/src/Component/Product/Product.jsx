import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Product.css";

const Product = () => {
  const { id } = useParams(); // ดึง id จาก URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:1337/api/products/${id}?populate=*`);
        const result = await response.json();
        
        if (result && result.data) {
          setProduct(result.data); // ✅ แก้ให้ใช้ result.data ตามโครงสร้าง JSON
        } else {
          setProduct(null);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p>Loading product details...</p>;
  if (!product) return <p>Product not found</p>;

  const getImageUrl = () => {
    if (product.attributes?.image?.length > 0) {
      return `http://localhost:1337${product.attributes.image[0].url}`;
    }
    return "/product-images/default.jpg";
  };

  return (
    <div className="product-detail-container">
      <h1 className="product-title">{product.attributes?.name}</h1>
      <img className="product-image" src={getImageUrl()} alt={product.attributes?.name} />
      <p className="product-price">Price: THB {product.attributes?.price}</p>
      <p className="product-description">{product.attributes?.description}</p>
    </div>
  );
};

export default Product;
