import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import logo from './Images/frontlogo.png';

export default function VerifyOtpReset() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [timer, setTimer] = useState(60); // 1 minute countdown
    const [showResendButton, setShowResendButton] = useState(false);

    useEffect(() => {
        if (timer > 0) {
            const countdown = setInterval(() => {
                setTimer(prevTimer => {
                    if (prevTimer <= 1) {
                        clearInterval(countdown);
                        setShowResendButton(true);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
            return () => clearInterval(countdown);
        }
    }, [timer]);

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const verifyOtp = async () => {
        const otpValue = otp.join("");
        if (state.OTP !== otpValue) {
            toast.error("Invalid OTP");
        } else {
            navigate('/resetpassword', { state: { email: state.email } });
        }
    };

    const resendOtp = async () => {
        try {
            const digits = '0123456789';
            let OTP = '';
            for (let i = 0; i < 6; i++) {
                OTP += digits[Math.floor(Math.random() * 10)];
            }
            await axios.post(`http://localhost:8000/sendemail`, { email: state.email, otp: OTP, type: 'reset' })
                .then(res => {
                    if (res.data === 'pass') {
                        toast.success("New OTP sent to your email");
                        setShowResendButton(false);
                        setTimer(60); // Restart the countdown
                        state.OTP = OTP; // Update OTP in state
                    } else {
                        toast.error("Failed to send OTP");
                    }
                })
                .catch(e => {
                    toast.error("Something went wrong");
                });
        } catch (e) {
            toast.error("Something went wrong!");
        }
    };

    return (
        <div className='min-h-screen bg-white pt-0'>
            <div className="flex justify-center min-h-screen bg-white">
                <div className='bg-white pt-6 p-10 rounded-lg shadow-md w-full max-w-2xl mx-auto'>
                    <div className="flex justify-center mb-6">
                        <div className="rounded-full bg-white shadow-lg w-52 h-52 flex items-center justify-center">
                            <img 
                                src={logo} 
                                alt="Logo" 
                                className="w-24 h-28"
                            />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-4">Verify OTP</h2>
                    <p className="text-center mb-8">Enter the 6-digit code sent to your email.</p>
                    <div className="mb-6 flex justify-center">
                        {otp.map((data, index) => {
                            return (
                                <input
                                    className="w-12 h-12 m-1 text-center form-control rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 leading-8 transition-colors duration-200 ease-in-out"
                                    type="text"
                                    name="otp"
                                    maxLength="1"
                                    key={index}
                                    value={data}
                                    onChange={e => handleOtpChange(e.target, index)}
                                    onFocus={e => e.target.select()}
                                />
                            );
                        })}
                    </div>
                    <p className="text-center">Resend OTP in {timer} seconds</p>
                    {showResendButton && (
                        <div className="flex justify-center mt-6">
                            <button onClick={resendOtp} className="text-white bg-black border-0 py-2 px-6 focus:outline-none hover:bg-gray-800 rounded-full text-lg">Resend OTP</button>
                        </div>
                    )}
                    <Link to='/login' className="text-black-700 underline block mt-4 text-center">Back to login</Link>
                    <div className="flex justify-center mt-6">
                        <button onClick={verifyOtp} className="text-white bg-black border-0 py-2 px-6 focus:outline-none hover:bg-gray-800 rounded-full text-lg">Submit</button>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}
