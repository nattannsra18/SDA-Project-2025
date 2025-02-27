import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import './App.css';
import Navbar from "./Component/navbar/navbar";
import Store from "./page/Store/Store";
import Wish_list from "./page/Wishlist/Wishlist";
import About from "./page/About/About";
import Libery from "./page/libery/libery";
import Cart from "./page/Cart/Cart";

const Layout = () => { 
  return(
    <div className="app"> 
      <Navbar /> 
      <Outlet />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element : <Layout/>,
    children : [
    {
      path: "/store",
      element : <Store/> ,
    },
    {
      path: "/about",
      element : <About/> ,
    },
    {
      path: "/libery",
      element : <Libery/> ,
    },
    {
      path: "/cart",
      element : <Cart/> ,
    },
    {
      path: "/wish_list",
      element : <Wish_list/> ,
    },
    ]
  },
]);

function App() {
  return (
    <div className="App">
       <RouterProvider router={router} />
    </div>
  );
}

export default App;
