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

  // กรองสินค้าตามคำค้นหา
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

  // ฟังก์ชันเพิ่มสินค้าลงตะกร้าที่ปรับปรุงแล้ว
  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const title = searchQuery 
    ? `Search Results: "${searchQuery}" (${filteredProducts.length} items)` 
    : "ALL Products";

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
                </Link>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <button 
                  className="add-to-cart-btn" 
                  onClick={(e) => handleAddToCart(e, product)}
                  title="Add to cart"
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