import React, { useState, useEffect } from "react";
import "./TopUp.css";
import { FaTimes, FaWallet } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react"; // Use QRCodeCanvas for QR code rendering
import generatePayload from "promptpay-qr"; // For generating PromptPay payload

const promptPayId = "0650389146"; // Your PromptPay ID

const TopUp = ({ isOpen, onClose }) => {
  const [topUpAmount, setTopUpAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(""); // Default is empty
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");
  const [slipImage, setSlipImage] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [userId, setUserId] = useState(null);
  const [walletDocumentId, setWalletDocumentId] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");

    if (userId) {
      setUserId(userId);
    }
  }, []);

  const topUpOptions = [
    { amount: 100, label: "฿100" },
    { amount: 300, label: "฿300" },
    { amount: 500, label: "฿500" },
    { amount: 1000, label: "฿1,000" },
    { amount: 2000, label: "฿2,000" },
  ];

  const handleTopUpSelect = (amount) => {
    setTopUpAmount(amount);
    setError("");
    if (paymentMethod === "promptPay") {
      generatePromptPayQR(amount);
    }
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setTopUpAmount(value);
    setError("");
    if (paymentMethod === "promptPay" && value) {
      generatePromptPayQR(parseFloat(value));
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    setError("");
    setQrCode("");

    if (method === "promptPay") {
      // Generate QR code if PromptPay is selected
      if (topUpAmount) generatePromptPayQR(parseFloat(topUpAmount));
    } else {
      // Notify user that the method is unavailable
      setError("This payment method is not available yet.");
      setTimeout(() => setError(""), 3000); // Clear error after 3 seconds
    }
  };

  const generatePromptPayQR = (amount) => {
    try {
      const payload = generatePayload(promptPayId, { amount: parseFloat(amount.toFixed(2)) });
      setQrCode(payload); // Generate and store the QR code payload
    } catch (err) {
      console.error("Error generating QR code:", err);
      setError("Unable to generate QR code");
    }
  };

  const handleSlipImageChange = (e) => {
    setSlipImage(e.target.files[0]);
  };

  const handleSlipUpload = async () => {
    if (!slipImage) {
      alert("กรุณาเลือกรูปภาพใบเสร็จ");
      return;
    }

    if (!walletDocumentId) {
      await fetchWalletDocumentId();
      if (!walletDocumentId) {
        console.error('ไม่สามารถดึง documentId ได้');
        return;
      }
    }

    const formData = new FormData();
    formData.append('files', slipImage);

    try {
      const response = await fetch(`http://localhost:1337/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const uploadedFile = await response.json();
        // อัปเดตข้อมูลกระเป๋าเงินโดยใช้ walletDocumentId
        await fetch(`http://localhost:1337/api/wallets/${walletDocumentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            data: {
              slip_image: uploadedFile[0].id,
            },
          }),
        });
        setUploadSuccess("อัปโหลดใบเสร็จสำเร็จ");
      } else {
        setError("การอัปโหลดใบเสร็จล้มเหลว");
      }
    } catch (error) {
      console.error(error);
      setError("เกิดข้อผิดพลาดในการอัปโหลดใบเสร็จ");
    }
  };

  const fetchWalletDocumentId = async () => {
    if (!userId) return;
  
    try {
      const response = await fetch(
        `http://localhost:1337/api/wallets?filters[user][id][$eq]=${userId}&populate=slip_image`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched Data:", data); // เพิ่มการแสดงข้อมูลที่ดึงมา
        if (data.data.length > 0) {
          const walletData = data.data[0];
          setWalletDocumentId(walletData.documentId);
          console.log("Document ID:", walletData.documentId); // แสดง documentId ที่ได้
        } else {
          console.error("ไม่พบข้อมูลกระเป๋าเงิน");
        }
      } else {
        console.error("การดึงข้อมูลล้มเหลว", response.status, response.statusText);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="top-up-modal-overlay">
      <div className="top-up-modal-content">
        <div className="top-up-modal-header">
          <h2>
            <FaWallet /> Top Up Wallet
          </h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="top-up-modal-body">
          {/* Amount Selection */}
          <div className="top-up-amount-selection">
            <h3>Select Amount</h3>
            <div className="top-up-quick-options">
              {topUpOptions.map((option) => (
                <button
                  key={option.amount}
                  className={`top-up-quick-option ${
                    topUpAmount === option.amount ? "selected" : ""
                  }`}
                  onClick={() => handleTopUpSelect(option.amount)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="custom-amount-input">
              <label>Custom Amount</label>
              <input
                type="text"
                placeholder="Enter amount"
                value={topUpAmount}
                onChange={handleCustomAmountChange}
                maxLength="6"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="payment-method-selection">
            <h3>Select Payment Method</h3>
            <div className="payment-method-options">
              {["creditCard", "bankTransfer", "promptPay"].map((method) => (
                <button
                  key={method}
                  className={`payment-method-option ${
                    paymentMethod === method ? "selected" : ""
                  }`}
                  onClick={() => handlePaymentMethodSelect(method)}
                >
                  {method === "promptPay" ? "Prompt Pay" : method.replace(/([A-Z])/g, ' $1')}
                </button>
              ))}
            </div>
          </div>

          {/* QR Code Section */}
          {paymentMethod === "promptPay" && topUpAmount && qrCode && (
            <div className="qr-code-container">
              {/* Render QR Code */}
              <QRCodeCanvas value={qrCode} size={250} includeMargin={true} />
            </div>
          )}

          {/* Upload Slip Section */}
          <div className="upload-slip-section">
            <input type="file" onChange={handleSlipImageChange} />
            <button className="upload-slip-button" onClick={handleSlipUpload}>
              Upload Slip
            </button>
            {uploadSuccess && <p className="upload-success">{uploadSuccess}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>

          {/* Error Message */}
          {error && <div className="top-up-error">{error}</div>}
        </div>

        {/* Footer */}
        <div className="top-up-modal-footer">
          <button
            className="confirm-top-up-button"
            onClick={() => generatePromptPayQR(topUpAmount)}
            disabled={!topUpAmount || !paymentMethod}
          >
            Confirm Top Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopUp;
