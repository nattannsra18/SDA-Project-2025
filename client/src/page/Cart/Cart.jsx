import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWindows } from 'react-icons/fa';
import { BsInfoCircle, BsLightningFill } from 'react-icons/bs';
import './Cart.css';
import Swal from 'sweetalert2';
import PurchaseModal from '../../Component/PurchaseModal';
const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const customSwal = Swal.mixin({
    customClass: {
      popup: 'custom-swal-popup',
      title: 'custom-swal-title',
      htmlContainer: 'custom-swal-content',
      confirmButton: 'custom-swal-confirm-button',
      cancelButton: 'custom-swal-cancel-button',
      icon: 'custom-swal-icon'
    },
    buttonsStyling: false
  });

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        const token = sessionStorage.getItem("token");

        if (!userId || !token) {
          customSwal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'Please sign in to view your cart'
          });
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:1337/api/carts?filters[cart_owner][id][$eq]=${userId}&populate[products][populate]=image`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userCart = response.data.data[0];

        if (userCart && userCart.products) {
          const products = userCart.products.map(product => {
            const imageUrl = product.image?.[0]?.formats?.small?.url || product.image?.[0]?.url;
            return {
              id: product.id,
              documentId: product.documentId,
              name: product.name,
              price: product.price,
              description: product.description,
              age1: product.age1,
              age: product.age,
              imageUrl: imageUrl ? `http://localhost:1337${imageUrl}` : null,
              genre: product.genre
            };
          });
          
          setCartItems(products);
          calculateTotal(products);
        } else {
          setCartItems([]);
          calculateTotal([]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching cart data:', error);
        customSwal.fire({
          icon: 'error',
          title: 'Connection Lost',
          text: 'Your cart could not be loaded. Please try again.'
        });
        setCartItems([]);
        calculateTotal([]);
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const calculateTotal = (items) => {
    let price = 0;
    let quantity = 0;

    items.forEach(item => {
      price += (item.price || 0);
      quantity++;
    });

    setTotalPrice(price);
    setTotalQuantity(quantity);
    updateCartInStrapi(price, quantity);
  };

  const updateCartInStrapi = async (totalPrice, totalQuantity) => {
    try {
      const userId = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      if (!userId || !token) {
        console.error('User not authenticated.');
        return;
      }

      const cartResponse = await axios.get(
        `http://localhost:1337/api/carts?filters[cart_owner][id][$eq]=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userCart = cartResponse.data.data[0];
      console.log("userCart", userCart);
      if (!userCart) {
        console.error('Cart not found for user:', userId);
        return;
      }

      const cartDocumentId = userCart.documentId; // ใช้ documentId ที่นี่
      console.log("cartDocumentId", cartDocumentId);
      await axios.put(
        `http://localhost:1337/api/carts/${cartDocumentId}`,
        {
          data: {
            totalPrice: totalPrice.toString(),
            totalQuantity: totalQuantity,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Error updating cart in Strapi:', error);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    customSwal.fire({
      title: 'Remove from Cart?',
      text: 'Are you sure you want to remove this title from your cart?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'Keep it'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const userId = sessionStorage.getItem("userId");
          const token = sessionStorage.getItem("token");

          if (!userId || !token) {
            customSwal.fire({
              icon: 'error',
              title: 'Access Denied',
              text: 'Please sign in to manage your cart'
            });
            return;
          }

          const cartResponse = await axios.get(
            `http://localhost:1337/api/carts?filters[cart_owner][id][$eq]=${userId}&populate=products`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const userCart = cartResponse.data.data[0];
          if (!userCart) {
            customSwal.fire({
              icon: 'error',
              title: 'Cart Not Found',
              text: 'Your cart seems to be missing.'
            });
            return;
          }

          const cartDocumentId = userCart.documentId; // ใช้ documentId ที่นี่

          const updatedProducts = userCart.products
            .filter(product => product.id !== productId)
            .map(product => ({ id: product.id }));


          await axios.put(
            `http://localhost:1337/api/carts/${cartDocumentId}`,
            {
              data: {
                products: updatedProducts.length > 0 ? updatedProducts : null,
              }
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );


          const remainingItems = cartItems.filter(item => item.id !== productId);
          setCartItems(remainingItems);
          calculateTotal(remainingItems);

          customSwal.fire({
            icon: 'success',
            title: 'Removed',
            text: 'The game has been removed from your cart.'
          });
        } catch (error) {
          console.error('Error removing item from cart:', error);
          customSwal.fire({
            icon: 'error',
            title: 'Operation Failed',
            text: 'We couldn\'t remove this title. Please try again later.'
          });
        }
      }
    });
  };

  const formatNumber = (number) => {
    return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) {
    return <div className="loading">Summoning your cart...</div>;
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>Your cart</h1>
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart awaits epic adventures</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-price">
                    THB {formatNumber(item.price)}
                  </div>

                  <div className="cart-item-header">
                    <div className="cart-item-image">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div className="no-image">Artwork Loading</div>
                      )}
                    </div>

                    <div className="cart-item-details">
                      <h2 className="cart-item-title">{item.name}</h2>

                      <div className="age-rating">
                        {item.age1 !== undefined ? (
                          <div className="age-rating-number">{item.age1}+</div>
                        ) : (
                          <div className="age-rating-number">N/A</div>
                        )}
                        {item.age ? (
                          <div className="age-rating-text">{item.age}</div>
                        ) : (
                          <div className="age-rating-text">Unknown</div>
                        )}
                      </div>

                      <div className="game-genre">
                        {item.genre ? (
                          <span className="genre-tag">{item.genre}</span>
                        ) : (
                          <span className="genre-tag unknown">Unknown Genre</span>
                        )}
                      </div>

                      <p className="self-refundable">
                        Self-Refundable <BsInfoCircle className="info-icon" />
                      </p>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <button className="remove-btn" onClick={() => handleRemoveFromCart(item.id)}>Remove</button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="cart-summary">
            <h3>Game Collection Summary</h3>
            <div className="summary-row">
              <span>Price</span>
              <span>THB {formatNumber(totalPrice)}</span>
            </div>
            <div className="summary-row">
              <span>Taxes</span>
              <span>Calculated at Checkout</span>
            </div>
            <div className="summary-row total">
              <span>Total Quantity</span>
              <span>{totalQuantity}</span>
            </div>
            <div className="summary-row total">
              <span>Total Cost</span>
              <span>THB {formatNumber(totalPrice)}</span>
            </div>
            <button
              className="checkout-btn"
              onClick={() => setIsPurchaseModalOpen(true)}
              disabled={cartItems.length === 0}
            >
              Purchase Now
            </button>
            <PurchaseModal
              isOpen={isPurchaseModalOpen}
              onClose={() => setIsPurchaseModalOpen(false)}
              totalPrice={totalPrice}
              cartItems={cartItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
