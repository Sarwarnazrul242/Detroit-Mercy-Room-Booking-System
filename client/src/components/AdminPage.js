import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import './MyAccount'; // Import the CSS file for additional styling

export default function AdminPage() {
    const cookieValue = Cookies.get("email");
    const [user, setUser] = useState({ name: '', phoneNumber: '', email: '', status: '' });

    const logOut = () => {
        Cookies.remove('email');
    };

    const fetchUserData = async () => {
        try {
            const res = await axios.post("http://localhost:8000/myaccount", { cookieValue });
            setUser(res.data);
        } catch (e) {
            toast.error("Something went wrong!");
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [cookieValue]);

    return (
        <div>
            <section className='text-grey-600 grid place-items-center my-6'>
                <h1 className='sm:text-4xl text-3xl mb-4 font-medium text-gray-950'>
                    Hello <span className="wave-emoji">👋</span> <span className="animated-name">{user.name}</span> 
                </h1>
                <div className='p-4 w-full flex flex-wrap justify-center'>
                    <Link to='/CurrentBookings' className='cursor-pointer w-fit m-4 hover:shadow-lg border-2 text-center border-gray-200 px-4 py-2 lg:py-6 lg:px-10 rounded-lg'>
                        <i className='fa-solid fa-calendar-days text-3xl lg:text-5xl'></i>
                        <h2 className='title-font font-medium text-lg lg:text-2xl mt-4 text-grey-900'>Current Bookings</h2>
                    </Link>
                    <Link to='/NewBookings' className='cursor-pointer w-fit m-4 hover:shadow-lg border-2 text-center border-gray-200 px-4 py-2 lg:py-6 lg:px-10 rounded-lg'>
                        <i className='fa-solid fa-plus text-3xl lg:text-5xl'></i>
                        <h2 className='title-font font-medium text-lg lg:text-2xl mt-4 text-grey-900'>Book New Room</h2>
                    </Link>
                    <Link to='/ManageBuildings' className='cursor-pointer w-fit m-4 hover:shadow-lg border-2 text-center border-gray-200 px-4 py-2 lg:py-6 lg:px-10 rounded-lg'>
                        <i className='fa-solid fa-building text-3xl lg:text-5xl'></i>
                        <h2 className='title-font font-medium text-lg lg:text-2xl mt-4 text-grey-900'>Manage Buildings</h2>
                    </Link>
                    <Link to='/ManageBookings' className='cursor-pointer w-fit m-4 hover:shadow-lg border-2 text-center border-gray-200 px-4 py-2 lg:py-6 lg:px-10 rounded-lg'>
                        <i className='fa-solid fa-tasks text-3xl lg:text-5xl'></i>
                        <h2 className='title-font font-medium text-lg lg:text-2xl mt-4 text-grey-900'>Manage Bookings</h2>
                    </Link>
                </div>
            </section>
            <ToastContainer />
        </div>
    );
}
