import "./navbar.css";
import { GiLockedChest } from "react-icons/gi";
import { FaSearch } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  return (
    <div className="navbar">
      <div className="wrapper1">
        <div>
          <GiLockedChest className="icon" />
        </div>
        <div className="extreme">Extreme Chest</div>
      </div>
      <div className="wrapper2">
        <div className="search-box">
          <input type="text" placeholder="Search Game" className="search-input" />
          <FaSearch className="search-icon" />
        </div>
      </div>
      <div className="wrapper3">
        <div className={`tab ${location.pathname === "/store" ? "active" : ""}`}>
          <Link className="link" to="/store">Store</Link>
        </div>
        <div className={`tab ${location.pathname === "/libery" ? "active" : ""}`}>
          <Link className="link" to="/libery">Libery</Link>
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
      </div>
    </div>
  );
};

export default Navbar;
