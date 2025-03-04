import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./All_Product.css";

const All_Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Get search query from URL
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

  // Filter products by search query
  const searchQuery = getSearchQuery();
  const filteredProducts = searchQuery
    ? products.filter(product => 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.genre && product.genre.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : products;

  const getImageUrl = (product) => {
    if (product.image && product.image.length > 0) {
      return `http://localhost:1337${product.image[0].url}`;
    }
    return "/product-images/default.jpg";
  };

  // Updated add to cart function
  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
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
        console.log("Full Cart Response:", JSON.stringify(cartResponse.data, null, 2));
        console.log("User Cart:", JSON.stringify(userCart, null, 2));
        const cartProducts = userCart.products
        console.log("Cart Products:", cartProducts);

        
        // Check if product is already in cart using ONLY documentId
        const existingProduct = cartProducts.some(p => 
          (p.documentId === product.documentId) || 
          (p.attributes && p.attributes.documentId === product.documentId)
        );

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

  const title = searchQuery 
    ? `Search Results: "${searchQuery}" (${filteredProducts.length} items)` 
    : "Store";

  return (
    <div className="all-product-container">
      <h1 className="all-product-title">{title}</h1>
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
                  {product.amount <= 0 && (
                    <div className="sold-out-overlay">Sold Out</div>
                  )}
                </Link>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <button 
                  className={`add-to-cart-btn ${product.amount <= 0 ? 'disabled' : ''}`}
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={product.amount <= 0}
                  title={product.amount <= 0 ? 'Out of Stock' : 'Add to cart'}
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