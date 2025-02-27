import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Product.css";
import { IoMdCheckmark } from "react-icons/io";
import { GiLockedChest } from "react-icons/gi";

const Product = () => {
  const { documentId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(
      `http://localhost:1337/api/products?filters[documentId][$eq]=${documentId}&populate=*`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.data.length > 0) {
          setProduct(data.data[0]);
        }
      })
      .catch((error) => console.error("Error fetching product:", error));
  }, [documentId]);

  if (!product) {
    return <p>Loading...</p>;
  }

  const productImage = product?.image?.[0];
  const productPrice = product?.price || 0;

  return (
    <div className="product-page-container">
      {/* ส่วนรูปภาพสินค้า */}
      <div className="product-image-container">
        {productImage && (
          <div>
            <img
              src={`http://localhost:1337${productImage.url}`}
              alt={productImage.alternativeText || product.name}
            />
            {/* ป้าย "Extreme Chest" ย้ายมาอยู่นอกภาพ */}
            <div className="image-label">
              <span>Extreme Chest</span>
              <GiLockedChest className="label-icon" />
            </div>
          </div>
        )}
      </div>

      {/* ส่วนรายละเอียดสินค้า */}
      <div className="product-details-container">
        <h2>Game: {product.name}</h2>
        <p className="product-description">
          Description: {product.description}
        </p>
        <p className="product-price">THB {productPrice} B</p>

        <div className="product-buttons">
          <button className="preorder-btn">Pre-Order</button>
          <button className="add-cart-btn">Add to Cart</button>
        </div>

        <div className="product-activation">
          <p>
            <IoMdCheckmark className="check-icon" />
            Can Activate in Thailand
          </p>
          <p>
            <IoMdCheckmark className="check-icon" />
            PC , Mobile , Xbox , Sony-PS
          </p>
        </div>
      </div>
    </div>
  );
};

export default Product;
