import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from "js-cookie";
import logo from '../shared/Images/frontlogo.png';

export default function VerifyOtp() {
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
            try {
                await axios.post("http://localhost:8000/signup", {
                    form: state.form
                }).then(res => {
                    if (res.data === "Dontexist") {
                        const fullEmail = `${state.form.email}@udmercy.edu`;
                        Cookies.set('email', fullEmail, { expires: 15 });
                        toast.success('Successfully Registered');
                        navigate('/login');
                    }
                });
            } catch (e) {
                console.log(e);
                toast.error("Something went wrong!");
            }
        }
    };

    const resendOtp = async () => {
        try {
            const digits = '0123456789';
            let OTP = '';
            for (let i = 0; i < 6; i++) {
                OTP += digits[Math.floor(Math.random() * 10)];
            }
            await axios.post(`http://localhost:8000/sendemail`, { email: state.form.email, otp: OTP, type: 'verify' })
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
        <div className='min-h-screen flex items-center justify-center bg-[#f7f8fa] px-4'>
            <div className='bg-white px-8 py-10 rounded-2xl shadow-lg w-full max-w-md'>
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="Logo" className="w-16 h-16 object-contain mb-2" />
                    <h2 className="text-2xl font-bold text-[#15396a] font-serif">Verify OTP</h2>
                </div>
                <p className="text-center mb-8 text-sm text-gray-600">Enter the 6-digit code sent to your email.</p>
                <div className="mb-6 flex justify-center">
                    {otp.map((data, index) => {
                        return (
                            <input
                                className="w-12 h-12 m-1 text-center rounded border border-gray-300 focus:border-[#a6192e] focus:ring-2 focus:ring-[#a6192e] text-base outline-none text-gray-700 transition-colors duration-200"
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
                <p className="text-center text-sm text-gray-600">Resend OTP in {timer} seconds</p>
                {showResendButton && (
                    <div className="flex justify-center mt-6">
                        <button onClick={resendOtp} className="text-white bg-[#a6192e] hover:bg-[#15396a] border-0 py-2 px-6 focus:outline-none focus:ring-2 focus:ring-[#a6192e] rounded-lg text-lg font-bold transition-colors duration-150">Resend OTP</button>
                    </div>
                )}
                <Link to='/signup' className="text-[#a6192e] hover:text-[#15396a] underline block mt-4 text-center transition-colors">Go Back</Link>
                <div className="flex justify-center mt-6">
                    <button onClick={verifyOtp} className="text-white bg-[#a6192e] hover:bg-[#15396a] border-0 py-2 px-6 focus:outline-none focus:ring-2 focus:ring-[#a6192e] rounded-lg text-lg font-bold transition-colors duration-150">Submit</button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}
