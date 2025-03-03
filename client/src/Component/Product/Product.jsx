import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./Product.css";
import { IoMdCheckmark } from "react-icons/io";
import { GiLockedChest } from "react-icons/gi";

const Product = () => {
  const { documentId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      `http://localhost:1337/api/products?filters[documentId][$eq]=${documentId}&populate=*`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.data.length > 0) {
          setProduct(data.data[0]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        setLoading(false);
      });
  }, [documentId]);

  // ฟังก์ชันเพิ่มสินค้าลงตะกร้า (คัดลอกมาจาก All_Product)
  const handleAddToCart = async () => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");
  
    // ตรวจสอบว่ามีการล็อกอินแล้วหรือไม่
    if (!userId || !token) {
      Swal.fire({
        title: 'Access Denied',
        text: 'Please sign in to add games to your cart',
        icon: 'warning',
        confirmButtonText: 'Sign In',
        confirmButtonColor: '#0078F2',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        background: '#1a1a1a',
        color: '#ffffff'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }
  
    try {
      // แสดง loading ขณะดำเนินการ
      Swal.fire({
        title: 'Adding to cart...',
        text: 'Please wait',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
        background: '#1a1a1a',
        color: '#ffffff',
      });
  
      // ตรวจสอบข้อมูลตะกร้าสินค้าของผู้ใช้
      console.log("Fetching cart data for user:", userId);
      const cartResponse = await axios.get(
        `http://localhost:1337/api/carts?filters[cart_owner][id][$eq]=${userId}&populate=products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Cart response:", cartResponse.data);
  
      if (cartResponse.data.data && cartResponse.data.data.length > 0) {
        // กรณีมีตะกร้าสินค้าอยู่แล้ว
        const userCart = cartResponse.data.data[0];
        
        // Debug: ตรวจสอบข้อมูลตะกร้าที่ได้รับ
        console.log("User cart:", userCart);
        
        // ใช้ documentId ในการอ้างอิงเอกสาร (Strapi 5)
        const cartDocumentId = userCart.documentId;
        
        if (!cartDocumentId) {
          console.error("Cart documentId not found in the response");
          throw new Error("Cart documentId not found");
        }
        
        // ตรวจสอบโครงสร้างข้อมูลสินค้าในตะกร้า
        const cartProducts = userCart.products?.data || [];
        console.log("Cart products:", cartProducts);
        
        // ตรวจสอบว่าเกมนี้มีในตะกร้าอยู่แล้วหรือไม่
        const existingProduct = cartProducts.some(p => p.documentId === product.documentId);
  
        if (existingProduct) {
          Swal.fire({
            title: 'Game Already in Cart',
            text: 'This game is already in your cart',
            icon: 'info',
            confirmButtonText: 'OK',
            confirmButtonColor: '#0078F2',
            background: '#1a1a1a',
            color: '#ffffff'
          });
          return;
        }
  
        console.log("Updating cart with documentId:", cartDocumentId);
        console.log("Adding product with documentId:", product.documentId);
  
        // ใช้ PUT request กับ documentId ตามเอกสาร Strapi 5
        await axios.put(
          `http://localhost:1337/api/carts/${cartDocumentId}`,
          {
            data: {
              products: {
                connect: [product.documentId]
              }
            }
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // กรณียังไม่มีตะกร้า ทำการสร้างใหม่
        console.log("Creating new cart for user:", userId);
        console.log("Adding product with documentId:", product.documentId);
        
        await axios.post(
          `http://localhost:1337/api/carts`,
          {
            data: {
              cart_owner: userId,
              products: {
                connect: [product.documentId]
              }
            }
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
  
      // แสดงการแจ้งเตือนสำเร็จ
      Swal.fire({
        title: 'Added to Cart',
        text: `${product.name} has been added to your cart`,
        icon: 'success',
        confirmButtonText: 'View Cart',
        confirmButtonColor: '#0078F2',
        showCancelButton: true,
        cancelButtonText: 'Continue Shopping',
        background: '#1a1a1a',
        color: '#ffffff'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/cart');
        }
      });
  
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // แสดงข้อมูล error ที่ละเอียดขึ้นเพื่อการ debug
      console.log("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // แสดงข้อความแจ้งเตือนเมื่อเกิดข้อผิดพลาด
      Swal.fire({
        title: 'Error',
        text: 'Could not add the game to your cart. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#0078F2',
        background: '#1a1a1a',
        color: '#ffffff'
      });
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!product) {
    return <p>Product not found</p>;
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
              onError={(e) => {
                console.error("Image not found:", e.target.src);
                e.target.src = "/product-images/default.jpg";
              }}
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
          <button className="add-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
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