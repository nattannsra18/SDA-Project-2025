import "./navbar.css"
import { GiLockedChest } from "react-icons/gi";
import { FaSearch } from "react-icons/fa"; 
import { Link } from 'react-router-dom';

const Navbar = ()  =>  { 
    return (
      <div className="navbar">
      <div className="wrapper1">
        <div> 
            <GiLockedChest className="icon"/>
        </div>
        <div className="extreme">Extreme Chest</div>
      </div>
      <div className="wrapper2">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search Game"
            className="search-input"
          />
          <FaSearch className="search-icon" />
        </div>
      </div>
      <div className="wrapper3">
            <div className="store"> 
             <Link className="link"> Store </Link>
            </div>
            <div className="libery">
                <Link className="link" to="/libery">Libery</Link>
            </div>
            <div className="cart"> 
                <Link className="link" to ="/cart"> Cart </Link>
            </div>
            <div className="wishlist">
                <Link className="link" to="/wish_list"> Wishlist </Link>
            </div>
            <div className="about">
                <Link className="link" to="/about"> About </Link>
            </div>
      </div>
      </div>
    )
  }


export default Navbar