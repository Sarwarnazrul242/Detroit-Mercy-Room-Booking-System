import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

// Updated imports based on new folder structure
import Home from './components/home/Home';
import Navbar from './components/shared/Navbar';
// import Footer from './components/shared/Footer';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import { useEffect, useState } from 'react';
import MyAccount from './components/users/MyAccount';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import VerifyOtp from './components/auth/VerifyOtp';
import VerifyOtpReset from './components/auth/VerifyOtpReset';
import AdminPage from './components/admin/AdminPage';
import AddBuilding from './components/buildings/AddBuilding';
import NewBookings from './components/bookings/NewBookings';
import ManageBuildings from './components/buildings/ManageBuildings';
import EditBuilding from './components/buildings/EditBuilding';
import BuildingDetails from './components/buildings/BuildingDetails';
import CurrentBookings from './components/bookings/CurrentBookings';
import ManageRooms from './components/rooms/ManageRooms';
import './App.css';
import ManageAccount from './components/users/ManageAccount';
import ManageBookings from './components/bookings/ManageBookings';
import ManageUsers from './components/users/ManageUsers';

function App() {
  const [cookieVal, setCookieVal] = useState(Cookies.get("email"));

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedCookie = Cookies.get("email");
      if (updatedCookie !== cookieVal) {
        setCookieVal(updatedCookie);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [cookieVal]);

  return (
    <div className="App">
      <Router>
      <Navbar cookieVal={cookieVal} />
        <div className="content"> 
          <Routes>
            {cookieVal == undefined && <Route path='/login' element={<Login />} />}
            {cookieVal == "nazrulsa@udmercy.edu" && <Route path='/login' element={<AdminPage />} />}
            {/* {cookieVal != undefined && <Route path='/login' element={<MyAccount />} />} */}
            {cookieVal != undefined && cookieVal != "nazrulsa@udmercy.edu" && <Route path='/login' element={<MyAccount />} />}

            <Route path='/signup' element={<Signup />} />
            <Route path='verify-otp' element={<VerifyOtp />} />
            <Route path="/verify-otp-reset" element={<VerifyOtpReset />} />
            <Route path='/forgotpassword' element={<ForgotPassword />} />
            <Route path='/' element={<Home />} />
            <Route path="/resetpassword" element={<ResetPassword />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/AddBuilding" element={<AddBuilding />} />
            <Route path="/newBookings" element={<NewBookings />} />
            <Route path="/ManageBuildings" element={<ManageBuildings />} />
            <Route path="ManageRooms/:id" element={<ManageRooms />} />
            <Route path="/editBuilding/:id" element={<EditBuilding />} />
            <Route path='/building/:id' element={<BuildingDetails />} />
            <Route path='/currentBookings' element={<CurrentBookings />} />
            <Route path='/manageAccount' element={<ManageAccount />} />
            <Route path="/manageBookings" element={<ManageBookings />} />
            <Route path='/ManageUsers' element={<ManageUsers />} />
          </Routes>
        </div>
        {/* <Footer /> */}
        <ToastContainer />
      </Router>
    </div>
  );
}

export default App;
