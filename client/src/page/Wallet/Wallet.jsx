import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./Wallet.css";
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [topUpAmount, setTopUpAmount] = useState("");

  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const fetchWalletDetails = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/wallets?filters[user][id][$eq]=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBalance(response.data.balance);
      setTransactionHistory(response.data.transaction_history || []);
    } catch (error) {
      console.error("Error fetching wallet details:", error);
      Swal.fire({
        title: "Error",
        text: "Could not fetch wallet details.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleTopUp = async () => {
    if (!topUpAmount || topUpAmount <= 0) {
      Swal.fire({
        title: "Invalid Amount",
        text: "Please enter a valid amount.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Processing...",
        text: "Please wait.",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => Swal.showLoading(),
      });

      await axios.post(
        `${API_URL}/api/wallets/topUp`,
        { userId, amount: parseFloat(topUpAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        title: "Success",
        text: `Your wallet has been topped up with ${topUpAmount} THB.`,
        icon: "success",
        confirmButtonText: "OK",
      });

      setTopUpAmount("");
      fetchWalletDetails();
    } catch (error) {
      console.error("Error topping up wallet:", error);
      Swal.fire({
        title: "Error",
        text: "Could not top up your wallet.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="wallet-page">
      <h1>My Wallet</h1>
      
      <div className="wallet-balance">
        <h2>Balance:</h2>
        <p>{balance} THB</p>
        
        <h3>Top-Up</h3>
        <input
          type="number"
          value={topUpAmount}
          onChange={(e) => setTopUpAmount(e.target.value)}
          placeholder="Enter amount"
        />
        <button onClick={handleTopUp}>Top-Up</button>
        
        <h3>Transaction History</h3>
        <ul>
          {transactionHistory.map((transaction, index) => (
            <li key={index}>
              {transaction.type === "top-up" ? "+" : "-"}{transaction.amount} THB ({new Date(transaction.date).toLocaleString()})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Wallet;
