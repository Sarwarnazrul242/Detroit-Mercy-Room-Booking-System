import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import logo from './Images/frontlogo.png'; 

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-600 to-red-600 text-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="text-white p-10 rounded-lg shadow-lg backdrop-blur-sm bg-white/20 flex flex-col items-center"
      >
        <div className="rounded-full bg-white shadow-lg w-52 h-52 flex items-center justify-center mb-6">
          <img 
            src={logo} 
            alt="Logo" 
            className="w-24 h-28" 
          />
        </div>
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-5xl font-bold mb-4"
        >
          Welcome to University of Detroit Mercy Room Booking System
        </motion.h1>
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-lg mb-8"
        >
          This website is designed for University of Detroit Mercy's faculty, students, and staff to book rooms in any building of the university.
        </motion.p>
        <div className="flex justify-center space-x-4">
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-black text-white py-2 px-6 rounded-full shadow-lg hover:bg-gray-800 focus:outline-none"
            >
              Login
            </motion.button>
          </Link>
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-black text-white py-2 px-6 rounded-full shadow-lg hover:bg-gray-800 focus:outline-none"
            >
              Signup
            </motion.button>
          </Link>
        </div>
      </motion.div>
      <ToastContainer />
    </div>
  );
}

export default Home;
