import { useState, useEffect } from "react";
import "./navbar.css";
import TopUp from "../TopUp/TopUp";
import { GiLockedChest } from "react-icons/gi";
import { FaSearch, FaUserCircle, FaTimes, FaSignOutAlt, FaWallet, FaUserAlt, FaLock } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';


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
  
  // State สำหรับการเปลี่ยนรหัสผ่าน
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  // ดึงข้อมูล Wallet
  useEffect(() => {
    const fetchWalletData = async () => {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("userId");

      if (!token || !userId) return;

      try {
        const response = await axios.get(
          `${API_URL}/api/wallets?filters[user][id][$eq]=${userId}`,
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

  // จัดการการเปลี่ยนแปลงข้อมูลรหัสผ่าน
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // เพิ่มฟังก์ชันสลับการแสดงรหัสผ่าน
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  // ฟังก์ชันส่งคำขอเปลี่ยนรหัสผ่าน
  const submitPasswordChange = async (e) => {
    e.preventDefault();

    // ตรวจสอบความถูกต้องของรหัสผ่าน
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      Swal.fire({
        title: 'Error',
        text: 'New passwords do not match',
        icon: 'error',
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
          content: 'custom-swal-content',
          confirmButton: 'custom-swal-confirm-button'
        },
        background: '#18181C',
        color: '#ffffff',
        confirmButtonColor: '#D70000'
      });
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          password: passwordData.newPassword,
          passwordConfirmation: passwordData.confirmNewPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // แสดงข้อความสำเร็จ
      await Swal.fire({
        title: 'Password Changed',
        text: 'Your password has been successfully updated',
        icon: 'success',
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
          content: 'custom-swal-content',
          confirmButton: 'custom-swal-confirm-button'
        },
        background: '#18181C',
        color: '#ffffff',
        confirmButtonColor: '#3D9BDC'
      });

      // ปิด Modal หลังจากเปลี่ยนรหัสผ่านสำเร็จ
      setShowModal(false);

      // รีเซ็ตข้อมูลรหัสผ่าน
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });
      
      // รีโหลดหน้าเว็บ
      window.location.reload();
    } catch (error) {
      // จัดการข้อผิดพลาดในการเปลี่ยนรหัสผ่าน
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to change password',
        icon: 'error',
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
          content: 'custom-swal-content',
          confirmButton: 'custom-swal-confirm-button'
        },
        background: '#18181C',
        color: '#ffffff',
        confirmButtonColor: '#D70000'
      });
    }
  };

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
      const response = await axios.get(`${API_URL}/api/users/me`, {
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
    window.location.reload();
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
              <button
                className={`tab-button ${activeTab === 'password' ? 'active-tab' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <FaLock className="tab-icon" />
                Change Password
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
                        {walletTransactions
                          .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))
                          .map((transaction, index) => {
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

              {activeTab === 'password' && (
                <div className="password-change-section">
                  <form onSubmit={submitPasswordChange} className="password-change-form">
                    <div className="password-input-wrapper">
                      <div className="password-input-group">
                        <div className="input-icon-wrapper">
                          <KeyRound className="input-icon" />
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="password-input"
                            placeholder="Current Password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="password-visibility-toggle"
                          >
                            {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div className="password-input-group">
                        <div className="input-icon-wrapper">
                          <ShieldCheck className="input-icon" />
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="password-input"
                            placeholder="New Password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="password-visibility-toggle"
                          >
                            {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div className="password-input-group">
                        <div className="input-icon-wrapper">
                          <ShieldCheck className="input-icon" />
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            name="confirmNewPassword"
                            value={passwordData.confirmNewPassword}
                            onChange={handlePasswordChange}
                            className="password-input"
                            placeholder="Confirm New Password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="password-visibility-toggle"
                          >
                            {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="password-change-submit-button"
                    >
                      Change Password
                    </button>
                  </form>
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
