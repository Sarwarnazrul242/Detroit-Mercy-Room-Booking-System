import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Modal from 'react-modal'; // Import Modal component
import logo from './Images/frontlogo.png';
import './RoomStyle.css';

Modal.setAppElement('#root'); // Set the root element for accessibility

export default function Login() {
    const [form, setForm] = useState({
        email: '',
        password: ''
    });
    const [emailError, setEmailError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (name === 'email') {
            validateEmail(value);
        }
    };

    const validateEmail = (email) => {
        const validCharacters = /^[a-zA-Z0-9.]+$/;
        if (!validCharacters.test(email)) {
            setEmailError('Invalid characters in email address.');
        } else {
            setEmailError('');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const submit = async (e) => {
        e.preventDefault();

        if (emailError) {
            toast.error("Please correct the errors before submitting.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:8000/login", {
                email: form.email,
                password: form.password
            });

            if (res.data === "loginPass") {
                const fullEmail = `${form.email}@udmercy.edu`;
                const userRes = await axios.post("http://localhost:8000/myaccount", { cookieValue: fullEmail });
                if (userRes.data.isSuspended) {
                    setIsModalOpen(true); // Show the modal if the user is suspended
                } else {
                    Cookies.set('email', fullEmail, { expires: 15 });
                    toast.success("Successfully Logged in!");
                    navigate('/login');
                }
            } else if (res.data === "nouser") {
                toast.error("This email is not registered");
            } else if (res.data === "loginFail") {
                toast.error("Invalid Credentials");
            } else if (res.data === "fail") {
                toast.error("Something went wrong!");
            }
        } catch (e) {
            toast.error("Something went wrong!");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        navigate('/login'); // Redirect to login page when modal is closed
    };

    return (
        <div className='min-h-screen bg-white pt-0'>
            <form className='bg-white pt-6 p-10 rounded-lg shadow-md w-full max-w-2xl mx-auto' onSubmit={submit}>
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-white shadow-lg w-52 h-52 flex items-center justify-center">
                        <img 
                            src={logo} 
                            alt="Logo" 
                            className="w-24 h-28"
                        />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center mb-4">Detroit Mercy Room Booking System</h2>
                <div className="mb-6">
                    <label htmlFor="email" className="leading-7 text-sm text-gray-600">Email</label>
                    <div className="flex items-center">
                        <input 
                            value={form.email} onChange={handleInputChange} 
                            required
                            type="text" 
                            id="email" 
                            name="email" 
                            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            placeholder="School Email"
                        />
                        <span className="ml-2">@udmercy.edu</span>
                    </div>
                    {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                </div>
                <div className="mb-6 relative">
                    <label htmlFor="password" className="leading-7 text-sm text-gray-600">Password</label>
                    <input 
                        value={form.password} onChange={handleInputChange} 
                        required 
                        type={showPassword ? "text" : "password"}
                        id="password" 
                        name="password" 
                        className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out" 
                    />
                    <button 
                        type="button" 
                        onClick={togglePasswordVisibility} 
                        className="absolute right-0 top-1/4 h-full px-4 flex items-center justify-center focus:outline-none"
                        style={{ fontSize: '1.25rem' }} 
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                <div className="text-center mb-8">
                    <Link to='/signup' className="text-black-700 underline mx-4">Create an Account</Link>
                    <span className="mx-2">|</span>
                    <Link to='/forgotpassword' className="text-black-700 underline mx-4">Forgot Password</Link>
                </div>
                <div className="flex justify-center mt-6">
                    <input className="text-white bg-black border-0 py-2 px-6 focus:outline-none hover:bg-gray-800 rounded-full text-lg cursor-pointer" type="submit" value='Log In' />
                </div>
            </form>
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Account Suspended"
                className="modal"
                overlayClassName="overlay"
            >
                <h2 className="text-2xl font-bold mb-4">Account Suspended</h2>
                <p className="mb-4">Your account has been suspended. Please contact the admin to know why.</p>
                <button onClick={closeModal} className="bg-red-700 text-white py-2 px-4 rounded">OK</button>
            </Modal>
            <ToastContainer />
        </div>
    );
}
