import { useState, useEffect } from "react";
import "./navbar.css";
import TopUp from "../TopUp/TopUp";
import { GiLockedChest } from "react-icons/gi";
import { FaSearch, FaUserCircle, FaTimes, FaSignOutAlt, FaWallet, FaUserAlt } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletStatus, setWalletStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('account');
  const [walletTransactions, setWalletTransactions] = useState([]);

 // ดึงข้อมูล Wallet
useEffect(() => {
  const fetchWalletData = async () => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");

    if (!token || !userId) return;

    try {
      const response = await axios.get(
        `http://localhost:1337/api/wallets?filters[user][id][$eq]=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.data.length > 0) {
        const walletData = response.data.data[0];
        setWalletBalance(walletData.balance);
        setWalletStatus(walletData.wallet_status);

        // เอาทุกธุรกรรม ไม่กรองตามสถานะ Wallet
        setWalletTransactions(walletData.transaction_history);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    }
  };

  fetchWalletData();
}, []);


  // ดึงค่าจาก URL และเคลียร์เมื่อเปลี่ยนหน้า
  useEffect(() => {
    if (location.pathname === "/store") {
      if (location.search) {
        const params = new URLSearchParams(location.search);
        const query = params.get("search");
        if (query) {
          setSearchTerm(query);
        }
      } else {
        setSearchTerm("");
      }
    } else {
      setSearchTerm("");
    }
  }, [location.pathname, location.search]);

  const handleLogoClick = () => {
    navigate("/home");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 0) {
      navigate(`/store?search=${encodeURIComponent(value)}`);
    } else if (location.pathname === "/store") {
      navigate("/store");
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      e.preventDefault();
      navigate(`/store?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSearchIconClick = () => {
    if (searchTerm.trim()) {
      navigate(`/store?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleUserIconClick = async () => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");

    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:1337/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserData(response.data);
      setShowModal(true);

    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    setUserData(null);
    setShowModal(false);
    navigate("/login");
  };

  const handleTopUp = () => {
    setShowModal(false);
    setShowTopUpModal(true);
  };

  return (
    <>
      <div className="navbar">
        <div className="wrapper1">
          <GiLockedChest className="icon" onClick={handleLogoClick} style={{ cursor: "pointer" }} />
          <div className="extreme">Extreme Chest</div>
        </div>
        <div className="wrapper2">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search Game"
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchSubmit}
              autoComplete="off"
            />
            <FaSearch
              className="search-icon"
              style={{ cursor: "pointer" }}
              onClick={handleSearchIconClick}
            />
          </div>
        </div>
        <div className="wrapper3">
          <div className={`tab ${location.pathname === "/home" ? "active" : ""}`}>
            <Link className="link" to="/home">Home</Link>
          </div>
          <div className={`tab ${location.pathname === "/store" ? "active" : ""}`}>
            <Link className="link" to="/store">Store</Link>
          </div>
          <div className={`tab ${location.pathname === "/cart" ? "active" : ""}`}>
            <Link className="link" to="/cart">Cart</Link>
          </div>
          <div className={`tab ${location.pathname === "/library" ? "active" : ""}`}>
            <Link className="link" to="/library">Library</Link>
          </div>
          <div className={`tab ${location.pathname === "/about" ? "active" : ""}`}>
            <Link className="link" to="/about">About</Link>
          </div>
          <div className="wrapper4">
            <span className="wallet-balance">
              ฿{walletBalance.toFixed(2)}
              {!walletStatus && <span className="pending-status">(pending)</span>}
            </span>
            <FaUserCircle
              className="user_icon"
              onClick={handleUserIconClick}
              style={{ cursor: "pointer", marginLeft: "10px" }}
            />
          </div>
        </div>
      </div>

      {showModal && userData && (
        <div className="user-modal-overlay">
          <div className="user-modal-content">
            <div className="user-modal-header">
              <h2>Your Profile</h2>
              <button className="close-button" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-tabs">
              <button
                className={`tab-button ${activeTab === 'account' ? 'active-tab' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <FaUserAlt className="tab-icon" />
                Account Detail
              </button>
              <button
                className={`tab-button ${activeTab === 'wallet' ? 'active-tab' : ''}`}
                onClick={() => setActiveTab('wallet')}
              >
                <FaWallet className="tab-icon" />
                My Wallet
              </button>
            </div>

            <div className="user-modal-body">
              {activeTab === 'account' && (
                <div className="account-details">
                  <div className="user-info-item">
                    <strong>Username:</strong>
                    <span>{userData?.username || "N/A"}</span>
                  </div>
                  <div className="user-info-item">
                    <strong>Email:</strong>
                    <span>{userData?.email || "N/A"}</span>
                  </div>
                  <div className="user-info-item">
                    <strong>Member Since:</strong>
                    <span>{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A"}</span>
                  </div>
                </div>
              )}

              {activeTab === 'wallet' && (
                <div className="wallet-details">
                  <div className="wallet-info-header">
                    <h3>Wallet Balance</h3>
                    <span className="wallet-amount">
                      ฿{walletBalance.toFixed(2)}
                      {!walletStatus && <span className="pending-status">(pending)</span>}
                    </span>
                  </div>

                  <div className="transaction-history">
                    <h4>Recent Transactions</h4>
                    {walletTransactions.length > 0 ? (
                      <div className="transaction-list">
                        {walletTransactions.map((transaction, index) => {
                          // Parse the date and format it with time
                          const transactionDate = new Date(transaction.timestamp || transaction.date);
                          const formattedDate = transactionDate.toLocaleString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          });

                          return (
                            <div key={index} className="transaction-item">
                              <div className="transaction-details">
                                <div className="transaction-top-row">
                                  <span className="transaction-name">{transaction.type}</span>
                                  {transaction.status && (
                                    <span className={`transaction-status ${transaction.status.toLowerCase()}`}>
                                      {transaction.status}
                                    </span>
                                  )}
                                </div>
                                <span className="transaction-date">{formattedDate}</span>
                              </div>
                              <span className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                                {transaction.amount > 0 ? '+' : ''}฿{transaction.amount.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="no-transactions">No recent transactions</p>
                    )}
                  </div>

                  <button className="top-up-button" onClick={handleTopUp}>
                    Top Up Wallet
                  </button>
                </div>
              )}
            </div>
            <div className="user-modal-footer">
              <button className="logout-button" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {showTopUpModal && (
        <TopUp
          isOpen={showTopUpModal}
          onClose={() => setShowTopUpModal(false)}
        />
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </>
  );
};

export default Navbar;
