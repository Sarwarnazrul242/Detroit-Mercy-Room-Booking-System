import React, { useState } from 'react'
import axios from "axios"
import { ToastContainer, toast } from 'react-toastify';
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom"
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from './Images/frontlogo.png'; 

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
    <div className='flex justify-center min-h-screen bg-white'>
      <form onSubmit={submit} className='bg-white pt-0 p-10 rounded-lg shadow-md w-full max-w-2xl'>
      <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-white shadow-lg w-52 h-52 flex items-center justify-center">
                        <img 
                            src={logo} 
                            alt="Logo" 
                            className="w-24 h-28" // Adjusting the size of the image inside the circle
                        />
                    </div>
                </div>
        <h2 className="text-2xl font-bold text-center mb-4">Reset Password</h2>

        <div className="relative mb-4">
          <label htmlFor="password" className="leading-7 text-sm text-gray-600">Password</label>
          <div className="relative w-full">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-0 top-0 h-full px-3 flex items-center justify-center focus:outline-none"
              style={{ fontSize: '1.25rem' }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <div className="relative mb-4">
          <label htmlFor="cpassword" className="leading-7 text-sm text-gray-600">Confirm Password</label>
          <div className="relative w-full">
            <input
              value={cpassword}
              onChange={(event) => setCpassword(event.target.value)}
              required
              type={showConfirmPassword ? "text" : "password"}
              id="cpassword"
              name="cpassword"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-0 top-0 h-full px-3 flex items-center justify-center focus:outline-none"
              style={{ fontSize: '1.25rem' }}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <Link to='/login' className="text-black-700 underline block mt-4">Back to login</Link>

        <div className="flex justify-center mt-6">
          <input
            className="text-white bg-black border-0 py-2 px-6 focus:outline-none hover:bg-gray-800 rounded-full text-lg cursor-pointer"
            type="submit"
            value='Submit'
          />
        </div>
      </form>
      <ToastContainer />
    </div>
  )
}
