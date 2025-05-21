import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import logo from '../shared/Images/frontlogo.png'; 

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
        <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa] px-4">
            <LoadingBar
                color='red'
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />
            <form className='bg-white px-8 py-10 rounded-2xl shadow-lg w-full max-w-md' onSubmit={sendEmail}>
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="Logo" className="w-16 h-16 object-contain mb-2" />
                    <h2 className="text-2xl font-bold text-[#15396a] font-serif">Reset Password</h2>
                </div>
                <p className="text-center mb-8 text-sm text-gray-600">We'll email you a 6 digit code.</p>
                <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-[#15396a] mb-1">Email Address</label>
                    <div className="flex items-center">
                        <input
                            value={email} onChange={(e) => { setEmail(e.target.value) }}
                            required
                            type="text"
                            id="email"
                            name="email"
                            className="w-full bg-white rounded border border-gray-300 focus:border-[#a6192e] focus:ring-2 focus:ring-[#a6192e] text-base outline-none text-gray-700 py-2 px-3 transition-colors duration-200"
                            placeholder="School Email"
                        />
                        <span className="ml-2 text-[#15396a] font-semibold">@udmercy.edu</span>
                    </div>
                </div>
                <Link to='/login' className="text-[#a6192e] hover:text-[#15396a] underline block mt-4 text-center transition-colors">Back to login</Link>
                <div className="flex justify-center mt-6">
                    <input className="text-white bg-[#a6192e] hover:bg-[#15396a] border-0 py-2 px-6 focus:outline-none focus:ring-2 focus:ring-[#a6192e] rounded-lg text-lg font-bold cursor-pointer transition-colors duration-150" type="submit" value='Reset Password' />
                </div>
            </form>
            <ToastContainer />
        </div>
    );
}
