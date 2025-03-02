import { useState, useEffect } from "react";
import "./navbar.css";
import { GiLockedChest } from "react-icons/gi";
import { FaSearch, FaUserCircle, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ดึงค่า search จาก URL เมื่อ component โหลด
  useEffect(() => {
    if (location.pathname === "/store" && location.search) {
      const params = new URLSearchParams(location.search);
      const query = params.get("search");
      if (query) {
        setSearchTerm(query);
      }
    }
  }, [location]);

  // ✅ ให้โลโก้คลิกแล้วนำทางไปหน้า Home
  const handleLogoClick = () => {
    navigate("/home");
  };

  // ✅ จัดการการค้นหา - เด้งไปหน้า Store ทันทีที่เริ่มพิมพ์
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // นำทางไปยังหน้า Store เมื่อมีการพิมพ์ (ถ้ามีตัวอักษรอย่างน้อย 1 ตัว)
    if (value.trim()) {
      navigate(`/store?search=${encodeURIComponent(value.trim())}`);
    } else if (location.pathname === "/store") {
      // ถ้าลบคำค้นหาจนหมดและอยู่ที่หน้า Store ให้รีเฟรชหน้า Store โดยไม่มีพารามิเตอร์ค้นหา
      navigate("/store");
    }
  };

  // ✅ เมื่อกด Enter ในช่องค้นหา
  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      e.preventDefault();
      navigate(`/store?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // ✅ เมื่อคลิกที่ไอคอนค้นหา
  const handleSearchIconClick = () => {
    if (searchTerm.trim()) {
      navigate(`/store?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // ✅ ตรวจสอบการเข้าสู่ระบบและแสดงข้อมูลผู้ใช้
  const handleUserIconClick = async () => {
    const token = sessionStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }
    
    if (userData) {
      setShowModal(true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:1337/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUserData(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
      sessionStorage.removeItem("token");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ปิด Modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // ✅ Logout และล้าง sessionStorage
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    setUserData(null);
    setShowModal(false);
    navigate("/login");
  };

  // ✅ ฟังก์ชันแปลงวันที่ให้อ่านง่าย
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="navbar">
        <div className="wrapper1">
          {/* ✅ คลิกที่โลโก้แล้วนำไปที่หน้า Home */}
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
              onKeyPress={handleSearchSubmit}
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
          <div className={`tab ${location.pathname === "/Library" ? "active" : ""}`}>
            <Link className="link" to="/Library">Library</Link>
          </div>
          <div className={`tab ${location.pathname === "/cart" ? "active" : ""}`}>
            <Link className="link" to="/cart">Cart</Link>
          </div>
          <div className={`tab ${location.pathname === "/wish_list" ? "active" : ""}`}>
            <Link className="link" to="/wish_list">Wishlist</Link>
          </div>
          <div className={`tab ${location.pathname === "/about" ? "active" : ""}`}>
            <Link className="link" to="/about">About</Link>
          </div>
          <div className="wrapper4">
            <div className="user_icon" onClick={handleUserIconClick} style={{ cursor: "pointer" }}>
              <FaUserCircle />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ User Profile Modal */}
      {showModal && userData && (
        <div className="user-modal-overlay">
          <div className="user-modal-content">
            <div className="user-modal-header">
              <h2>User Profile</h2>
              <button 
                className="close-button" 
                onClick={handleCloseModal}
              >
                <FaTimes />
              </button>
            </div>
            <div className="user-modal-body">
              <div className="user-info-item">
                <strong>Username:</strong>
                <span>{userData?.username || "N/A"}</span>
              </div>
              <div className="user-info-item">
                <strong>Email:</strong>
                <span>{userData?.email || "N/A"}</span>
              </div>
              <div className="user-info-item">
                <strong>Registration Date:</strong>
                <span>{formatDate(userData?.createdAt)}</span>
              </div>
            </div>
            <div className="user-modal-footer">
              <button 
                className="logout-button" 
                onClick={handleLogout}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Loading Indicator */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </>
  );
};

export default Navbar;