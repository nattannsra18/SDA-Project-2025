import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate
} from "react-router-dom";
import './App.css';
import Navbar from "./Component/navbar/navbar";
import Store from "./page/Store/Store";
import About from "./page/About/About";
import Library from "./page/Library/Library";
import Cart from "./page/Cart/Cart";
import Login from "./page/Login/login";
import Product  from "./Component/Product/Product";
import Register from "./page/Register/Register";
import Home from "./page/Home/Home";


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
        path: "/",
        element: <Navigate to="/home" replace />,
      },
    {
      path: "/store",
      element : <Store/> ,
    },
    {
      path: "/about",
      element : <About/> ,
    },
    {
      path: "/library",
      element : <Library/> ,
    },
    {
      path: "/cart",
      element : <Cart/> ,
    },
    {
      path: "/product/:documentId",
      element: <Product />,
    },
    {
      path: "/home",
      element: <Home/>,
    },
    ]
  },
  {
    path: "/login",
    element: <Login/>, // แยกออกจาก Layout
  },
  {
    path: "/regis",
    element: <Register/>, // แยกออกจาก Layout
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
