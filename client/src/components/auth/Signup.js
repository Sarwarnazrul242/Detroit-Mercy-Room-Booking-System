import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import InputMask from 'react-input-mask';
import logo from '../shared/Images/frontlogo.png'; 

export default function Signup() {
    const navigate = useNavigate();
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        status: '',
        password: '',
        confirmPassword: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (name === 'email') {
            validateEmail(value);
        } else if (name === 'phoneNumber') {
            validatePhoneNumber(value);
        }
    }; 

    const validateEmail = (email) => {
        const validCharacters = /^[a-zA-Z0-9._%+-]+$/;
        if (!validCharacters.test(email)) {
            setEmailError('Invalid characters in email address.');
        } else {
            setEmailError('');
        }
    };

    const validatePhoneNumber = (phoneNumber) => {
        const validPhoneNumber = /^\(\d{3}\)\d{3}-\d{4}$/;
        if (!validPhoneNumber.test(phoneNumber)) {
            setPhoneError('Invalid phone number format.');
        } else {
            setPhoneError('');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const submit = async (e) => {
        e.preventDefault();

        if (emailError || phoneError) {
            toast.error("Please correct the errors before submitting.");
            return;
        }

        try {
            if (form.password.length < 6) {
                toast.error('Password must be at least 6 characters');
                return;
            } else if (form.password !== form.confirmPassword) {
                toast.error('Passwords do not match');
                return;
            } else {
                const fullEmail = `${form.email}@udmercy.edu`;

                // Generate and send OTP
                let OTP = '';
                const digits = '0123456789';
                for (let i = 0; i < 6; i++) {
                    OTP += digits[Math.floor(Math.random() * 10)];
                }
                console.log(OTP);

                await axios.post("http://localhost:8000/sendemail", {
                    email: fullEmail,
                    otp: OTP,
                    type: 'verify'
                })
                .then(res => {
                    if (res.data === "pass") {
                        toast.success('OTP sent to your email');
                        navigate('/verify-otp', { state: { form, OTP } });
                    } else if (res.data === "Exists") {
                        toast.error('Email already exists');
                    } else {
                        toast.error("Something went wrong2");
                    }
                });
            }
        } catch (e) {
            console.log(e);
            toast.error("Something went wrong!");
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-[#f7f8fa] px-4'>
            <form className='bg-white px-8 py-10 rounded-2xl shadow-lg w-full max-w-2xl mx-auto' onSubmit={submit}>
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="Logo" className="w-16 h-16 object-contain mb-2" />
                    <h2 className="text-2xl font-bold text-[#15396a] font-serif">Create your account</h2>
                </div>
                <p className="text-center mb-8 text-sm text-gray-600">
                    Already have an account? <Link to='/login' className="text-[#a6192e] hover:text-[#15396a] underline transition-colors">Log In</Link>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-[#15396a] mb-1">Full Name</label>
                        <input
                            required
                            value={form.name}
                            onChange={handleInputChange}
                            type="text"
                            id="name"
                            name="name"
                            className="w-full bg-white rounded border border-gray-300 focus:border-[#a6192e] focus:ring-2 focus:ring-[#a6192e] text-base outline-none text-gray-700 py-2 px-3 transition-colors duration-200"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-[#15396a] mb-1">Email Address</label>
                        <div className="flex items-center">
                            <input
                                required
                                type="text"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleInputChange}
                                className="w-full bg-white rounded border border-gray-300 focus:border-[#a6192e] focus:ring-2 focus:ring-[#a6192e] text-base outline-none text-gray-700 py-2 px-3 transition-colors duration-200"
                                placeholder="School Email"
                            />
                            <span className="ml-2 text-[#15396a] font-semibold">@udmercy.edu</span>
                        </div>
                        {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#15396a] mb-1">Phone Number</label>
                        <InputMask
                            mask="(999)999-9999"
                            value={form.phoneNumber}
                            onChange={handleInputChange}
                        >
                            {(inputProps) => (
                                <input
                                    {...inputProps}
                                    required
                                    type="text"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    className="w-full bg-white rounded border border-gray-300 focus:border-[#a6192e] focus:ring-2 focus:ring-[#a6192e] text-base outline-none text-gray-700 py-2 px-3 transition-colors duration-200"
                                />
                            )}
                        </InputMask>
                        {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#15396a] mb-1">Status</label>
                        <div className="mt-2 flex flex-wrap gap-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="status"
                                    value="Faculty"
                                    checked={form.status === 'Faculty'}
                                    onChange={handleInputChange}
                                    className="form-radio text-[#a6192e] focus:ring-[#a6192e]"
                                />
                                <span className="ml-2">Faculty</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="status"
                                    value="Student"
                                    checked={form.status === 'Student'}
                                    onChange={handleInputChange}
                                    className="form-radio text-[#a6192e] focus:ring-[#a6192e]"
                                />
                                <span className="ml-2">Student</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="status"
                                    value="Staff"
                                    checked={form.status === 'Staff'}
                                    onChange={handleInputChange}
                                    className="form-radio text-[#a6192e] focus:ring-[#a6192e]"
                                />
                                <span className="ml-2">Staff</span>
                            </label>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-[#15396a] mb-1">Password</label>
                        <div className="relative w-full">
                            <input
                                required
                                value={form.password}
                                onChange={handleInputChange}
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
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#15396a] mb-1">Confirm Password</label>
                        <div className="relative w-full">
                            <input
                                required
                                value={form.confirmPassword}
                                onChange={handleInputChange}
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
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
                </div>
                <div className="flex justify-center mt-6">
                    <input
                        className="text-white bg-[#a6192e] hover:bg-[#15396a] border-0 py-2 px-6 focus:outline-none focus:ring-2 focus:ring-[#a6192e] rounded-lg text-lg font-bold cursor-pointer transition-colors duration-150"
                        type="submit"
                        value='Create Account'
                    />
                </div>
            </form>
            <ToastContainer />
        </div>
    );
}
