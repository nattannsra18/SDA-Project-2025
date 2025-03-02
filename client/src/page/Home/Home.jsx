import "./Home.css"
import Product_4 from "../../Component/4Product/4Product"
import Slide from "../../Component/Slide/Slide"
import Contact from "../../Component/contact/contact"
const Home = ()  => { 
    
    return (
        <div className="main">
        <div>
        <Slide/>
        </div>
        <div className="Product">
        <Product_4/>
        </div>
        <div className="/contact">
        <Contact/>
        </div>
        </div>
    )
}

export default Home