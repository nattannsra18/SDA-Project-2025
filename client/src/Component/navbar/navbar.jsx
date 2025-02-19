import "./navbar.css"
import { GiLockedChest } from "react-icons/gi";
import { FaSearch } from "react-icons/fa"; 

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
            <div className="link"> 
                Store
            </div>
            <div className="link">
                Libery
            </div>
            <div className="link"> 
                Cart
            </div>
            <div className="link">
                Wishlist
            </div>
            <div className="link">
                About
            </div>
      </div>
      </div>
    )
  }


export default Navbar