import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import frontLogo from './Images/frontlogo.png';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-4">
          <img src={frontLogo} alt="Detroit Mercy Logo" className="h-14 w-auto" />
          <div className="flex flex-col justify-center leading-tight">
            <span className="text-base text-[#15396a] font-serif tracking-wide">University of Detroit Mercy</span>
            <span className="text-xl md:text-3xl text-[#a6192e] font-serif font-bold -mt-1">Room Booking System</span>
          </div>
        </Link>
        {/* Desktop Nav Links */}
        <div className="hidden md:flex space-x-8">
          <Link to="/" className="text-gray-800 font-medium hover:text-blue-600 transition-colors">Home</Link>
          <Link to="/login" className="text-gray-800 font-medium hover:text-blue-600 transition-colors">Login</Link>
        </div>
        {/* Hamburger Icon */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#a6192e]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-7 h-7 text-[#15396a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
            )}
          </svg>
        </button>
      </div>
      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-md shadow-lg px-6 py-4 flex flex-col space-y-4 absolute w-full left-0 top-full z-40 animate-fade-in-down">
          <Link to="/" className="text-[#15396a] font-semibold hover:text-[#a6192e] transition-colors" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/login" className="text-[#15396a] font-semibold hover:text-[#a6192e] transition-colors" onClick={() => setMenuOpen(false)}>Login</Link>
        </div>
      )}
      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
