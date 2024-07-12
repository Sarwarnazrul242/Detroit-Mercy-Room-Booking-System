import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import logo from './Images/frontlogo.png'; 

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();
    const digits = '0123456789';

    const sendEmail = async (e) => {
        setProgress(20);
        e.preventDefault();

        try {
            let OTP = '';
            for (let i = 0; i < 6; i++) {
                OTP += digits[Math.floor(Math.random() * 10)];
            }

            setOtp(OTP);
            setProgress(50);

            const fullEmail = `${email}@udmercy.edu`;

            await axios.post(`http://localhost:8000/sendemail`, { email: fullEmail, otp: OTP, type: 'reset' })
                .then(res => {
                    if (res.data === 'pass') {
                        toast.success("Code sent to the email");
                        navigate('/verify-otp-reset', { state: { email: fullEmail, OTP } });
                    } else if (res.data === 'notexist') {
                        toast.error("User not found! Please sign up");
                    } else if (res.data === 'fail') {
                        toast.error("Something went wrong");
                    }
                })
                .catch(e => {
                    toast.error("Something went wrong");
                });
            setProgress(70);
        } catch (e) {
            toast.error("Something went wrong!");
        }
        setProgress(100);
    };

    return (
        <div>
            <LoadingBar
                color='red'
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />

            <div className="flex  justify-center min-h-screen bg-white">
                <form className='bg-white p-16 rounded-lg shadow-md w-full max-w-2xl' onSubmit={sendEmail}>
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-white shadow-lg w-52 h-52 flex items-center justify-center">
                        <img 
                            src={logo} 
                            alt="Logo" 
                            className="w-24 h-28" 
                        />
                    </div>
                </div>
                    <h2 className="text-2xl font-bold text-center mb-4">Reset Password</h2>
                    <p className="text-center">We'll email you a 6 digit code.</p>

                    <div className="mb-6">
                        <label htmlFor="email" className="leading-7 text-sm text-gray-600">Email Address</label>
                        <div className="flex items-center">
                            <input
                                value={email} onChange={(e) => { setEmail(e.target.value) }}
                                required
                                type="text"
                                id="email"
                                name="email"
                                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                                placeholder="School Email"
                            />
                            <span className="ml-2">@udmercy.edu</span>
                        </div>
                    </div>

                    <Link to='/login' className="text-blue-700 underline">Back to login</Link>
                    <div className="flex justify-center mt-6">
                        <input className="text-white bg-black border-0 py-2 px-6 focus:outline-none hover:bg-gray-800 rounded-full text-lg cursor-pointer" type="submit" value='Reset Password' />
                    </div>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
}
