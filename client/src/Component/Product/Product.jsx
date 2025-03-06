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

  // Add to cart function copied from All_Product
  const handleAddToCart = async () => {
    // Check if product is out of stock
    if (product.amount <= 0) {
      Swal.fire({
        title: 'Out of Stock',
        text: 'This product is currently unavailable',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#0078F2',
        background: '#1a1a1a',
        color: '#ffffff'
      });
      return;
    }

    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");
  
    // Check if user is logged in
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
      // Show loading
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
  
      // Fetch user's cart
      const cartResponse = await axios.get(
        `http://localhost:1337/api/carts?filters[cart_owner][id][$eq]=${userId}&populate=products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (cartResponse.data.data && cartResponse.data.data.length > 0) {
        const userCart = cartResponse.data.data[0];
        const cartDocumentId = userCart.documentId;
        
        const cartProducts = userCart.products;
        
        // Check if product is already in cart
        const existingProduct = cartProducts.some(p => p.documentId === product.documentId);

        if (existingProduct) {
          // Close loading dialog
          Swal.close();
          
          // Show warning that product is already in cart
          Swal.fire({
            title: 'Product Already in Cart',
            text: `${product.name} is already in your shopping cart`,
            icon: 'info',
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
          return;
        }
  
        // Update cart with new product
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
        // Create new cart
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
  
      // Show success message
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
      
      // Show error message
      Swal.fire({
        title: 'Error',
        text: 'Could not add the product to your cart. Please try again.',
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
  const isOutOfStock = product.amount <= 0;

  return (
    <div className="product-page-container">
      {/* Product Image Section */}
      <div className="product-image-container">
        {productImage && (
          <div className="image-wrapper">
            <img
              src={`http://localhost:1337${productImage.url}`}
              alt={productImage.alternativeText || product.name}
              onError={(e) => {
                console.error("Image not found:", e.target.src);
                e.target.src = "/product-images/default.jpg";
              }}
              className={isOutOfStock ? 'out-of-stock-image' : ''}
            />
            {isOutOfStock && (
              <div className="sold-out-overlay">Sold Out</div>
            )}
            <div className="image-label">
              <span>Extreme Chest</span>
              <GiLockedChest className="label-icon" />
            </div>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="product-details-container">
        <h2>{product.name}</h2>
        <p className="product-description">
          Description: {product.description}
        </p>
        <p className="product-price">THB {productPrice}</p>

        <div className="product-buttons">
          {isOutOfStock ? (
            <div className="out-of-stock-message">
              <p>This product is currently unavailable</p>
            </div>
          ) : (
            <button 
              className="add-cart-btn" 
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          )}
        </div>

        <div className="product-activation">
          <p>
            <IoMdCheckmark className="check-icon" />
            Can Activate in Thailand
          </p>
          <p>
            <IoMdCheckmark className="check-icon" />
            PC (STEAM)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Product;