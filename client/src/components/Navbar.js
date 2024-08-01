import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function Navbar() {
    const [showMenu, setShowMenu] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    }

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    }

    const logOut = () => {
        Cookies.remove('email');
        setIsLoggedIn(false);
        setShowDropdown(false); // Hide the dropdown
        navigate('/login');
    }

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowDropdown(false);
        }
    }

    useEffect(() => {
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    useEffect(() => {
        const email = Cookies.get('email');
        if (email) {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <div>
            <header className="bg-white md:flex md:justify-between md:items-center md:px-6 md:py-4 z-50 relative">
                <div className="flex items-center justify-between px-6 py-2 md:p-0">
                    <div className='w-44'>
                        <Link to={"/"}>
                            <img src={require('./Images/logo.png')} alt="Logo" className="w-full cursor-pointer md:mt-2 md:mb-2" />
                        </Link>
                    </div>
                    <div className="md:hidden">
                        <button onClick={toggleMenu} className="text-black">
                            <i className="cursor-pointer ml-3 mr-2 fa-solid fa-bars scale-150"></i>
                        </button>
                    </div>
                </div>

                <nav className={`px-6 pt-2 pb-2 md:flex ${showMenu ? "block" : "hidden"}`}>
                    {isLoggedIn && (
                        <button
                            onClick={() => navigate('/login')}
                            className="block px-4 py-2 text-black font-semibold rounded hover:bg-gray-300 md:ml-4"
                        >
                            Dashboard
                        </button>
                    )}
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={toggleDropdown} className='block w-fit px-4 py-2 text-black font-semibold rounded hover:bg-gray-300 md:ml-4'>
                            <i className="fa-solid fa-user fa-2x"></i>
                        </button>
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                                {isLoggedIn ? (
                                    <>
                                        <button onClick={() => navigate('/manageAccount')} className='block w-full text-left px-4 py-2 text-black font-semibold rounded hover:bg-gray-300'>Manage Account</button>
                                        <button onClick={logOut} className='block w-full text-left px-4 py-2 text-black font-semibold rounded hover:bg-gray-300'>Log Out</button>
                                    </>
                                ) : (
                                    <button onClick={() => navigate('/login')} className='block w-full text-left px-4 py-2 text-black font-semibold rounded hover:bg-gray-300'>Log In</button>
                                )}
                            </div>
                        )}
                    </div>
                </nav>
            </header>
        </div>
    );
}
