import React, { useState, useEffect } from "react";
import "./TopUp.css";
import { FaTimes, FaWallet, FaFileUpload } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import generatePayload from "promptpay-qr";
import Swal from "sweetalert2";

const promptPayId = "0650389146"; // Your PromptPay ID

const TopUp = () => {
    const [isTopUpAmountModalOpen, setIsTopUpAmountModalOpen] = useState(true);
    const [isUploadSlipModalOpen, setIsUploadSlipModalOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [error, setError] = useState("");
    const [slipImage, setSlipImage] = useState(null);
    const [userId, setUserId] = useState(null);
    const [walletDocumentId, setWalletDocumentId] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const userId = sessionStorage.getItem("userId");
        if (userId) {
            setUserId(userId);
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchWalletDocumentId();
        }
    }, [userId]);

    useEffect(() => {
        if (topUpAmount && paymentMethod === "promptPay") {
            generatePromptPayQR(parseFloat(topUpAmount));
        }
    }, [topUpAmount, paymentMethod]);

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
            alert("Please select a slip image");
            return;
        }
    
        if (!walletDocumentId) {
            await fetchWalletDocumentId();
            if (!walletDocumentId) {
                setError("Wallet document ID not found. Please try again.");
                return;
            }
        }
    
        const formData = new FormData();
        formData.append("files", slipImage);
    
        try {
            const response = await fetch(`http://localhost:1337/api/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
                body: formData,
            });
    
            if (response.ok) {
                const uploadedFile = await response.json();
                await fetch(`http://localhost:1337/api/wallets/${walletDocumentId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ data: { slip_image: uploadedFile[0].id } }),
                });
    
                // Show success notification and reload page
                Swal.fire({
                    icon: "success",
                    title: "Slip Uploaded!",
                    text: "Your payment slip has been uploaded successfully. Please wait for verification.",
                    showConfirmButton: false,
                    timer: 2000,
                    position: 'top-end',
                    toast: true,
                    didClose: () => {
                        window.location.reload();
                    }
                });
            } else {
                setError("Slip upload failed");
            }
        } catch (error) {
            console.error(error);
            setError("Error uploading slip");
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
                if (data.data.length > 0) {
                    const walletData = data.data[0];
                    setWalletDocumentId(walletData.documentId);
                } else {
                    setError("Wallet information not found. Please ensure your wallet is set up.");
                }
            } else {
                setError(`Failed to fetch wallet data: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error fetching wallet data:", error);
            setError("Failed to fetch wallet data. Please try again.");
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
                                            className={`top-up-quick-option ${topUpAmount === String(option.amount) ? "selected" : ""
                                                }`}
                                            onClick={() => handleTopUpSelect(String(option.amount))}
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
                                        value={topUpAmount}
                                        onChange={handleCustomAmountChange}
                                    />
                                </div>
                            </div>

                            <div className="payment-method-selection">
                                <h3>Select Payment Method</h3>
                                <div className="payment-method-options">
                                    <button
                                        className={`payment-method-option ${paymentMethod === "promptPay" ? "selected" : ""
                                            }`}
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
                            <h2>Upload Payment Slip</h2>
                            <button className="close-button" onClick={() => setIsUploadSlipModalOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="top-up-modal-body">
                            <div className="qr-code-container">
                                {qrCode ? (
                                    <QRCodeCanvas value={qrCode} size={256} level="H" />
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
                                {slipImage && <p>Selected: {slipImage.name}</p>}
                                <button className="confirm-top-up-button" onClick={handleSlipUpload}>
                                    Upload Slip
                                </button>
                                {error && <div className="top-up-error">{error}</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TopUp;