import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './PurchaseModal.css';
import { useNavigate } from "react-router-dom";
import KeyReservationService from './KeyReservationService';
import { useEmail } from './EmailContext'; // นำเข้า context

const PurchaseModal = ({
  isOpen,
  onClose,
  totalPrice,
  cartItems
}) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletStatus, setWalletStatus] = useState(false);
  const [walletDocumentId, setWalletDocumentId] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const navigate = useNavigate();
  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef(null);
  const { sendGameKeyEmail, isLoading } = useEmail(); // ใช้ค่า isLoading


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
    const fetchWalletInfo = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        const token = sessionStorage.getItem("token");

        if (!userId || !token) {
          customSwal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'Please sign in to complete purchase'
          });
          return;
        }

        const walletResponse = await axios.get(
          `http://localhost:1337/api/wallets?filters[user][id][$eq]=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const wallet = walletResponse.data.data[0];
        if (wallet) {
          setWalletBalance(parseFloat(wallet.balance || 0));
          setWalletStatus(wallet.wallet_status === true);
          setWalletDocumentId(wallet.documentId);
        }
      } catch (error) {
        console.error('Error fetching wallet info:', error);
        customSwal.fire({
          icon: 'error',
          title: 'Connection Error',
          text: 'Unable to fetch wallet information'
        });
      }
    };

    if (isOpen) {
      fetchWalletInfo();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // อัพเดทเวลาทุกวินาที
      const updateTimer = () => {
        const remaining = KeyReservationService.getRemainingTime();
        setRemainingTime(remaining);

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          handleClose(); // ปิดหน้าต่างเมื่อหมดเวลา
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen]);

  const handleClose = async () => {
    await KeyReservationService.releaseKeys();
    onClose();
  };

  const handlePurchase = async () => {
    try {
      setProcessingPayment(true);
      const userId = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      // ดึงอีเมลของผู้ใช้
      const userResponse = await axios.get(
        `http://localhost:1337/api/users/${userId}?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userEmail = userResponse.data.email;

      // Wallet status check
      if (!walletStatus) {
        customSwal.fire({
          icon: 'warning',
          title: 'Payment Pending',
          text: 'Your payment slip is being verified. Please wait until our team completes the review.'
        });
        setProcessingPayment(false);
        return;
      }

      // Balance check
      if (walletBalance < totalPrice) {
        customSwal.fire({
          icon: 'error',
          title: 'Insufficient Balance',
          text: 'Your wallet balance is insufficient for this purchase.'
        });
        setProcessingPayment(false);
        return;
      }

      // สร้างรายการคีย์ที่จะส่งทางอีเมล
      const purchasedGameKeys = [];

      // Purchase process
      for (const item of cartItems) {
        const productResponse = await axios.get(
          `http://localhost:1337/api/products?filters[documentId][$eq]=${item.documentId}&populate=product_keys`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const product = productResponse.data.data[0];

        // Filter unused and unreserved product keys
        const availableKeys = product.product_keys.filter(key => key.is_used === false);
        if (availableKeys.length === 0) {
          throw new Error(`No available keys for product ${item.name}`);
        }

        // Get the reserved key for this user
        const reservedKey = availableKeys.find(key =>
          key.is_reserved === true && key.reserved_by === userId
        );

        if (!reservedKey) {
          throw new Error(`No reserved key found for product ${item.name}`);
        }

        // เก็บข้อมูลคีย์เกมเพื่อส่งอีเมล
        purchasedGameKeys.push({
          name: item.name,
          key: reservedKey.key
        });

        // Update product key ownership
        await axios.put(
          `http://localhost:1337/api/product-keys/${reservedKey.documentId}`,
          {
            data: {
              owner: userId,
              is_used: true,
              is_reserved: true,
              reserved_by: null,
              reservation_expires: null
            }
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Reduce product amount
        await axios.put(
          `http://localhost:1337/api/products/${product.documentId}`,
          {
            data: {
              amount: product.amount - 1
            }
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Update wallet balance
      await axios.put(
        `http://localhost:1337/api/wallets/${walletDocumentId}`,
        {
          data: {
            balance: (walletBalance - totalPrice).toFixed(2)
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear cart after successful purchase
      const cartResponse = await axios.get(
        `http://localhost:1337/api/carts?filters[cart_owner][id][$eq]=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userCart = cartResponse.data.data[0];
      if (userCart) {
        await axios.put(
          `http://localhost:1337/api/carts/${userCart.documentId}`,
          {
            data: {
              products: null,
              totalPrice: '0',
              totalQuantity: 0
            }
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // ส่งอีเมลคีย์เกมให้ผู้ใช้
      for (const gameKey of purchasedGameKeys) {
        await sendGameKeyEmail(userEmail, gameKey);
      }

      // ลบข้อมูลการจองเมื่อซื้อสำเร็จ (แต่ไม่ต้องปลดล็อคคีย์)
      localStorage.removeItem(`reserved_keys_${userId}`);
      if (window.keyReleaseTimeout) {
        clearTimeout(window.keyReleaseTimeout);
      }

      customSwal.fire({
        icon: 'success',
        title: 'Purchase Successful',
        text: 'Your games have been added to your library and game keys have been sent to your email.',
        confirmButtonText: 'Go to Library',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/library');
        }
      });

      onClose(); // Close modal after successful purchase
      setProcessingPayment(false);
    } catch (error) {
      console.error('Purchase error:', error);
      customSwal.fire({
        icon: 'error',
        title: 'Purchase Failed',
        text: 'Unable to complete your purchase. Please try again.'
      });

      // กรณีซื้อไม่สำเร็จ ให้ปลดล็อคคีย์
      await KeyReservationService.releaseKeys();
      setProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="purchase-modal-overlay">
      <div className="purchase-modal">
        <div className="purchase-modal-header">
          <h2>Confirm Your Purchase</h2>
          <div className="reservation-timer">
            Time remaining: {Math.floor(remainingTime / 60000)}:{String(Math.floor((remainingTime % 60000) / 1000)).padStart(2, '0')}
          </div>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="purchase-modal-content">
          <div className="purchase-summary">
            <h3>Order Summary</h3>
            <div className="purchase-items">
              {cartItems.map(item => (
                <div key={item.id} className="purchase-item">
                  <span>{item.name}</span>
                  <span>THB {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
            <div className="purchase-total">
              <strong>Total:</strong>
              <strong>THB {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
          </div>

          <div className="purchase-wallet-info">
            <h3>Wallet Information</h3>
            <div className="wallet-details">
              <div className="wallet-balance">
                Wallet Balance:
                <span>THB {walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="wallet-status">
                Status:
                <span>{walletStatus ? 'Verified' : 'Pending Verification'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="purchase-modal-actions">
          <button
            className="cancel-btn"
            onClick={handleClose}
            disabled={processingPayment}
          >
            Cancel
          </button>
          <button
            className="confirm-btn"
            onClick={handlePurchase}
            disabled={processingPayment || !walletStatus || walletBalance < totalPrice}
          >
            {isLoading ? <span className="loading-spinner"></span> : 'Confirm Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;