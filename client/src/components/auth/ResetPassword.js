import React, { useState } from 'react'
import axios from "axios"
import { ToastContainer, toast } from 'react-toastify';
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom"
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../shared/Images/frontlogo.png'; 

export default function ResetPassword() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [cpassword, setCpassword] = useState('')
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      if (password !== cpassword) {
        toast.error("Passwords do not match");
      } else if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
      } else {
        const cookieValue = Cookies.get("resetEmail");
        await axios.post(`http://localhost:8000/resetPassword`, {
          cookieValue, password
        })
          .then(res => {
            if (res.data === "pass") {
              toast.success("Password changed successfully");
              Cookies.remove("resetEmail");
              navigate("/login");
            } else {
              toast.error("Something went wrong!");
            }
          })
          .catch(e => {
            toast.error("Something went wrong!");
          });
      }
    } catch (e) {
      toast.error("Something went wrong!");
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#f7f8fa] px-4'>
      <form onSubmit={submit} className='bg-white px-8 py-10 rounded-2xl shadow-lg w-full max-w-md'>
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Logo" className="w-16 h-16 object-contain mb-2" />
          <h2 className="text-2xl font-bold text-[#15396a] font-serif">Reset Password</h2>
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-[#15396a] mb-1">Password</label>
          <div className="relative w-full">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="w-full bg-white rounded border border-gray-300 focus:border-[#a6192e] focus:ring-2 focus:ring-[#a6192e] text-base outline-none text-gray-700 py-2 px-3 transition-colors duration-200"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-0 top-0 h-full px-3 flex items-center justify-center focus:outline-none text-[#15396a] hover:text-[#a6192e]"
              style={{ fontSize: '1.25rem' }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="cpassword" className="block text-sm font-medium text-[#15396a] mb-1">Confirm Password</label>
          <div className="relative w-full">
            <input
              value={cpassword}
              onChange={(event) => setCpassword(event.target.value)}
              required
              type={showConfirmPassword ? "text" : "password"}
              id="cpassword"
              name="cpassword"
              className="w-full bg-white rounded border border-gray-300 focus:border-[#a6192e] focus:ring-2 focus:ring-[#a6192e] text-base outline-none text-gray-700 py-2 px-3 transition-colors duration-200"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-0 top-0 h-full px-3 flex items-center justify-center focus:outline-none text-[#15396a] hover:text-[#a6192e]"
              style={{ fontSize: '1.25rem' }}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <Link to='/login' className="text-[#a6192e] hover:text-[#15396a] underline block mt-4 text-center transition-colors">Back to login</Link>
        <div className="flex justify-center mt-6">
          <input
            className="text-white bg-[#a6192e] hover:bg-[#15396a] border-0 py-2 px-6 focus:outline-none focus:ring-2 focus:ring-[#a6192e] rounded-lg text-lg font-bold cursor-pointer transition-colors duration-150"
            type="submit"
            value='Submit'
          />
        </div>
      </form>
      <ToastContainer />
    </div>
  )
}
