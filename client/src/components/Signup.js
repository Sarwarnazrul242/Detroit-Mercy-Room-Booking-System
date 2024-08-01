import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import InputMask from 'react-input-mask';
import logo from './Images/frontlogo.png'; 

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
        <div className='min-h-screen bg-white pt-0'>
            <form className='bg-white pt-6 p-10 rounded-lg shadow-md w-full max-w-3xl mx-auto' onSubmit={submit}>
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-white shadow-lg w-52 h-52 flex items-center justify-center">
                        <img 
                            src={logo} 
                            alt="Logo" 
                            className="w-24 h-28" // Adjusting the size of the image inside the circle
                        />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center mb-4">Create Account</h2>
                <p className="text-center mb-8">
                    Already have an account? <Link to='/login' className="text-black-700 underline">Click here to Log In</Link>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative mb-4">
                        <label htmlFor="name" className="leading-7 text-sm text-gray-600">Full Name</label>
                        <input
                            required
                            value={form.name}
                            onChange={handleInputChange}
                            type="text"
                            id="name"
                            name="name"
                            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                        />
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="email" className="leading-7 text-sm text-gray-600">Email Address</label>
                        <div className="flex items-center">
                            <input
                                required
                                type="text"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleInputChange}
                                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                                placeholder="School Email"
                            />
                            <span className="ml-2">@udmercy.edu</span>
                        </div>
                        {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="phoneNumber" className="leading-7 text-sm text-gray-600">Phone Number</label>
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
                                    className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                                />
                            )}
                        </InputMask>
                        {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                    </div>
                    <div className="relative mb-4">
                        <label className="leading-7 text-sm text-gray-600">Status</label>
                        <div className="mt-2">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="status"
                                    value="Faculty"
                                    checked={form.status === 'Faculty'}
                                    onChange={handleInputChange}
                                    className="form-radio"
                                />
                                <span className="ml-2">Faculty</span>
                            </label>
                            <label className="inline-flex items-center ml-4">
                                <input
                                    type="radio"
                                    name="status"
                                    value="Student"
                                    checked={form.status === 'Student'}
                                    onChange={handleInputChange}
                                    className="form-radio"
                                />
                                <span className="ml-2">Student</span>
                            </label>
                            <label className="inline-flex items-center ml-4">
                                <input
                                    type="radio"
                                    name="status"
                                    value="Staff"
                                    checked={form.status === 'Staff'}
                                    onChange={handleInputChange}
                                    className="form-radio"
                                />
                                <span className="ml-2">Staff</span>
                            </label>
                        </div>
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="password" className="leading-7 text-sm text-gray-600">Password</label>
                        <div className="relative w-full">
                            <input
                                required
                                value={form.password}
                                onChange={handleInputChange}
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
                        <label htmlFor="confirmPassword" className="leading-7 text-sm text-gray-600">Confirm Password</label>
                        <div className="relative w-full">
                            <input
                                required
                                value={form.confirmPassword}
                                onChange={handleInputChange}
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
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
                </div>
                <div className="flex justify-center mt-6">
                    <input
                        className="text-white bg-black border-0 py-2 px-6 focus:outline-none hover:bg-gray-800 rounded-full text-lg cursor-pointer"
                        type="submit"
                        value='Create Account'
                    />
                </div>
            </form>
            <ToastContainer />
        </div>
    );
}
