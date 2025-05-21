import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Modal from 'react-modal';
import logo from '../shared/Images/frontlogo.png';

Modal.setAppElement('#root');

export default function Login() {
    const [form, setForm] = useState({
        email: '',
        password: ''
    });
    const [emailError, setEmailError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);

        if (emailError) {
            toast.error("Please correct the errors before submitting.");
            setIsLoading(false);
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
                    setIsModalOpen(true);
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
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa] px-4">
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-lg px-8 py-10">
                    <div className="flex flex-col items-center mb-8">
                        <img src={logo} alt="UDM Logo" className="w-16 h-16 object-contain mb-2" />
                        <h2 className="text-2xl font-bold text-[#15396a] font-serif">Sign in to your account</h2>
                    </div>
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#15396a] mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    value={form.email}
                                    onChange={handleInputChange}
                                    required
                                    type="text"
                                    id="email"
                                    name="email"
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a6192e] focus:border-transparent bg-white"
                                    placeholder="Enter your email"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#15396a] font-semibold">
                                    @udmercy.edu
                                </span>
                            </div>
                            {emailError && (
                                <p className="mt-2 text-sm text-red-600">{emailError}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#15396a] mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    value={form.password}
                                    onChange={handleInputChange}
                                    required
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a6192e] focus:border-transparent bg-white"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#15396a] hover:text-[#a6192e] focus:outline-none"
                                >
                                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <Link to="/signup" className="font-medium text-[#a6192e] hover:text-[#15396a] transition-colors">
                                Create an Account
                            </Link>
                            <Link to="/forgotpassword" className="font-medium text-[#a6192e] hover:text-[#15396a] transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-3 px-4 rounded-lg text-lg font-bold text-white bg-[#a6192e] hover:bg-[#15396a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a6192e] transition duration-150 ease-in-out ${
                                isLoading ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Account Suspended"
                className="bg-white rounded-lg p-8 max-w-md mx-auto mt-20 shadow-xl"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            >
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Suspended</h2>
                    <p className="text-gray-600 mb-6">Your account has been suspended. Please contact the admin to know why.</p>
                    <button
                        onClick={closeModal}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-150 ease-in-out"
                    >
                        OK
                    </button>
                </div>
            </Modal>
            <ToastContainer />
        </div>
    );
}
