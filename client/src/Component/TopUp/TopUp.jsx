import React, { useState, useEffect } from "react";
import "./TopUp.css";
import { FaTimes, FaWallet, FaFileUpload, FaCheckCircle } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import generatePayload from "promptpay-qr";
import Swal from "sweetalert2";
import axios from "axios";

const TopUp = () => {
    const [isTopUpAmountModalOpen, setIsTopUpAmountModalOpen] = useState(true);
    const [isUploadSlipModalOpen, setIsUploadSlipModalOpen] = useState(false);
    const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [error, setError] = useState("");
    const [slipImage, setSlipImage] = useState(null);
    const [userId, setUserId] = useState(null);
    const [walletData, setWalletData] = useState(null);
    const [promptPayId, setPromptPayId] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const userId = sessionStorage.getItem("userId");
        
        // Fetch PromptPay ID
        const fetchPromptPayId = async () => {
            try {
                const response = await axios.get('http://localhost:1337/api/promptpays', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data.data.length > 0) {
                    setPromptPayId(response.data.data[0].number);
                }
            } catch (error) {
                console.error("Error fetching PromptPay ID:", error);
                setError("Failed to fetch PromptPay ID");
            }
        };

        if (userId) {
            setUserId(userId);
            fetchWalletData(userId, token);
            fetchPromptPayId();
        }
    }, []);

    useEffect(() => {
        if (topUpAmount && paymentMethod === "promptPay" && promptPayId) {
            generatePromptPayQR(parseFloat(topUpAmount));
        }
    }, [topUpAmount, paymentMethod, promptPayId]);

    const fetchWalletData = async (userId, token) => {
        try {
            const response = await axios.get(
                `http://localhost:1337/api/wallets?filters[user][id][$eq]=${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.data.length > 0) {
                setWalletData(response.data.data[0]);
            } else {
                await createNewWallet(userId, token);
            }
        } catch (error) {
            console.error("Error fetching wallet data:", error);
            setError("Failed to fetch wallet data. Please try again.");
        }
    };

    const createNewWallet = async (userId, token) => {
        try {
            const response = await axios.post(
                'http://localhost:1337/api/wallets', 
                {
                    data: {
                        user: userId,
                        balance: 0,
                        wallet_status: true,
                        transaction_history: []
                    }
                },
                {
                    headers: { 
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}` 
                    }
                }
            );

            if (response.data.data) {
                setWalletData(response.data.data);
            }
        } catch (error) {
            console.error("Error creating wallet:", error);
            setError("Unable to create wallet. Please try again.");
        }
    };

    const topUpOptions = [
        { amount: 100, label: "฿100" },
        { amount: 300, label: "฿300" },
        { amount: 500, label: "฿500" },
        { amount: 1000, label: "฿1,000" },
        { amount: 2000, label: "฿2,000" },
    ];

    const handleTopUpSelect = (amount) => {
        setTopUpAmount(String(amount));
        setError("");
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        setTopUpAmount(value);
        setError("");
    };

    const handlePaymentMethodSelect = (method) => {
        setPaymentMethod(method);
        setError("");
        setQrCode("");
        if (method === "promptPay" && topUpAmount) {
            generatePromptPayQR(parseFloat(topUpAmount));
        } else {
            setError("This payment method is not available yet.");
            setTimeout(() => setError(""), 3000);
        }
    };

    const generatePromptPayQR = (amount) => {
        try {
            const payload = generatePayload(promptPayId, {
                amount: parseFloat(amount.toFixed(2)),
            });
            setQrCode(payload);
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
            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Please select a payment slip image',
                background: '#1e1e2a',
                color: '#ffffff'
            });
            return;
        }
    
        if (!walletData) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Wallet information not found',
                background: '#1e1e2a',
                color: '#ffffff'
            });
            return;
        }
    
        const formData = new FormData();
        formData.append("files", slipImage);
    
        try {
            const token = sessionStorage.getItem("token");
            
            // Upload slip image
            const uploadResponse = await axios.post(
                `http://localhost:1337/api/upload`, 
                formData,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
    
            // Calculate new balance
            const newBalance = walletData.balance + parseFloat(topUpAmount);
            
            // Create current date and time
            const currentDateTime = new Date();
            
            // Create transaction with detailed timestamp
            const newTransaction = {
                type: "top-up",
                amount: parseFloat(topUpAmount),
                status: "pending",
                date: currentDateTime.toISOString().split('T')[0], // Date in YYYY-MM-DD format
                time: currentDateTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                }), // Time in 12-hour format
                timestamp: currentDateTime.toISOString() // Full ISO timestamp
            };
            
            // Update wallet with new balance, slip image, and transaction history
            const updateResponse = await axios.put(
                `http://localhost:1337/api/wallets/${walletData.documentId}`, 
                {
                    data: { 
                        slip_image: uploadResponse.data[0].id,
                        balance: newBalance,
                        wallet_status: false,
                        transaction_history: [
                            ...walletData.transaction_history,
                            newTransaction
                        ]
                    } 
                },
                {
                    headers: { 
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );
    
            // Close upload slip modal and open processing modal
            setIsUploadSlipModalOpen(false);
            setIsProcessingModalOpen(true);
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while uploading the slip',
                background: '#1e1e2a',
                color: '#ffffff'
            });
        }
    };

    const handleConfirm = () => {
        if (!topUpAmount || !paymentMethod) {
            setError("Please select an amount and a payment method.");
            return;
        }

        if (paymentMethod === "promptPay") {
            setIsTopUpAmountModalOpen(false);
            setIsUploadSlipModalOpen(true);
        } else {
            setError("This payment method is not available yet.");
            setTimeout(() => setError(""), 3000);
        }
    };

    const handleBackToAmountSelection = () => {
        setIsUploadSlipModalOpen(false);
        setIsTopUpAmountModalOpen(true);
    };

    const RecentTransactions = ({ transactions }) => {
        return (
            <div className="recent-transactions">
                {transactions.map((transaction, index) => (
                    <div key={index} className="transaction-item">
                        <div className="transaction-details">
                            <span className="transaction-type">{transaction.type}</span>
                            <span className="transaction-amount">
                                {transaction.amount > 0 ? '+' : ''}฿{transaction.amount}
                            </span>
                        </div>
                        <div className="transaction-meta">
                            <span className="transaction-date">
                                {transaction.date} {transaction.time}
                            </span>
                            <span className={`transaction-status ${transaction.status.toLowerCase()}`}>
                                {transaction.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    
    return (
        <>
            {isTopUpAmountModalOpen && (
                <div className="top-up-modal-overlay">
                    <div className="top-up-modal-content">
                        <div className="top-up-modal-header">
                            <h2>
                                <FaWallet /> Top Up Wallet
                            </h2>
                            <button className="close-button" onClick={() => setIsTopUpAmountModalOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="top-up-modal-body">
                            <div className="top-up-amount-selection">
                                <h3>Select Top Up Amount</h3>
                                <div className="top-up-quick-options">
                                    {topUpOptions.map((option) => (
                                        <button
                                            key={option.amount}
                                            className={`top-up-quick-option ${topUpAmount === String(option.amount) ? "selected" : ""}`}
                                            onClick={() => handleTopUpSelect(option.amount)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="custom-amount-input">
                                    <label htmlFor="customAmount">Custom Amount (฿)</label>
                                    <input
                                        type="text"
                                        id="customAmount"
                                        placeholder="Enter amount"
                                        value={topUpAmount || ""}
                                        onChange={handleCustomAmountChange}
                                    />
                                </div>
                            </div>

                            <div className="payment-method-selection">
                                <h3>Select Payment Method</h3>
                                <div className="payment-method-options">
                                    <button
                                        className={`payment-method-option ${paymentMethod === "promptPay" ? "selected" : ""}`}
                                        onClick={() => handlePaymentMethodSelect("promptPay")}
                                    >
                                        PromptPay
                                    </button>
                                </div>
                            </div>

                            {error && <div className="top-up-error">{error}</div>}
                        </div>
                        <div className="top-up-modal-footer">
                            <button className="confirm-top-up-button" onClick={handleConfirm}>
                                Confirm Top Up
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isUploadSlipModalOpen && (
                <div className="top-up-modal-overlay">
                    <div className="top-up-modal-content">
                        <div className="top-up-modal-header">
                            <button className="back-button" onClick={handleBackToAmountSelection}>
                                Back
                            </button>
                            <h2>Payment Slip</h2>
                            <button className="close-button" onClick={() => setIsUploadSlipModalOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="top-up-modal-body">
                            <div className="qr-code-container">
                                {qrCode ? (
                                    <div className="qr-code-wrapper">
                                        <QRCodeCanvas 
                                            value={qrCode} 
                                            size={256} 
                                            level="H" 
                                            bgColor="white"
                                            fgColor="black"
                                        />
                                    </div>
                                ) : (
                                    <div>Generating QR Code...</div>
                                )}
                            </div>
                            <div className="qr-code-instructions">
                                Scan this QR code with your banking app to complete the payment of{" "}
                                <b>฿{topUpAmount}</b>.
                            </div>

                            <div className="upload-slip-section">
                                <h3>Upload Payment Slip</h3>
                                <input
                                    type="file"
                                    id="slipImage"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleSlipImageChange}
                                />
                                <label htmlFor="slipImage" className="upload-slip-button">
                                    <FaFileUpload /> Choose Slip Image
                                </label>
                                {slipImage && <p className="selected-file-name">Selected: {slipImage.name}</p>}
                                <button className="confirm-top-up-button" onClick={handleSlipUpload}>
                                    Upload Slip
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isProcessingModalOpen && (
                <div className="top-up-modal-overlay">
                    <div className="top-up-modal-content processing-modal">
                        <div className="top-up-modal-body">
                            <div className="processing-icon">
                                <FaCheckCircle size={80} color="#3D9BDC" />
                            </div>
                            <h2>Slip Upload Successful</h2>
                            <p>Your payment slip has been uploaded and is pending verification.</p>
                            <p>Our team will review your slip shortly.</p>
                            <button 
                                className="confirm-top-up-button" 
                                onClick={() => {
                                    setIsProcessingModalOpen(false);
                                    window.location.reload();
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TopUp;