import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const PurchaseModal = ({ 
  isOpen, 
  onClose, 
  totalPrice, 
  cartItems 
}) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletStatus, setWalletStatus] = useState(false);
  const [walletDocumentId, setWalletDocumentId] = useState(null);

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
        console.log("wallet", wallet);
        if (wallet) {
          setWalletBalance(parseFloat(wallet.balance || 0));
          setWalletStatus(wallet.wallet_status === true);
          setWalletDocumentId(wallet.documentId);  // บันทึก wallet.documentId
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

  const handlePurchase = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");
  
      // Wallet status check
      if (!walletStatus) {
        customSwal.fire({
          icon: 'warning',
          title: 'Payment Pending',
          text: 'Your payment slip is being verified. Please wait until our team completes the review.'
        });
        return;
      }
  
      // Balance check
      if (walletBalance < totalPrice) {
        customSwal.fire({
          icon: 'error',
          title: 'Insufficient Balance',
          text: 'Your wallet balance is insufficient for this purchase.'
        });
        return;
      }
  
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
        
        // Filter unused product keys
        const availableKeys = product.product_keys.filter(key => key.is_used === false);
        if (availableKeys.length === 0) {
          throw new Error(`No available keys for product ${item.name}`);
        }
  
        const selectedKey = availableKeys[0];
  
        // Update product key ownership
        await axios.put(
          `http://localhost:1337/api/product-keys/${selectedKey.documentId}`,
          {
            data: {
              owner: userId,
              is_used: true
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
        `http://localhost:1337/api/wallets/${walletDocumentId}`,  // ใช้ walletDocumentId
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
  
      customSwal.fire({
        icon: 'success',
        title: 'Purchase Successful',
        text: 'Your games have been added to your library'
      });
  
      onClose(); // Close modal after successful purchase
    } catch (error) {
      console.error('Purchase error:', error);
      customSwal.fire({
        icon: 'error',
        title: 'Purchase Failed',
        text: 'Unable to complete your purchase. Please try again.'
      });
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1E1E1E] rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold text-white mb-4">Order Summary</h2>
        
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between mb-2">
            <span className="text-white">{item.name}</span>
            <span className="text-white">THB {item.price.toFixed(2)}</span>
          </div>
        ))}
        
        <div className="border-t border-gray-700 my-4"></div>
        
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-white">THB {totalPrice.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Wallet Balance</span>
          <span className="text-white">THB {walletBalance.toFixed(2)}</span>
        </div>
        
        <button 
          onClick={handlePurchase}
          className="w-full bg-[#0078F2] text-white py-2 rounded mt-4 hover:bg-[#005AC1] transition"
        >
          Confirm Purchase
        </button>
        
        <button 
          onClick={onClose}
          className="w-full text-gray-400 py-2 rounded mt-2 hover:text-white transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PurchaseModal;