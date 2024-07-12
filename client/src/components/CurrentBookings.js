import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';

export default function CurrentBookings() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const email = Cookies.get("email");
                const res = await axios.post('http://localhost:8000/getUserBookings', { email });
                setBookings(res.data);
            } catch (e) {
                toast.error("Something went wrong while fetching bookings!");
            }
        };

        fetchBookings();
    }, []);

    return (
        <div className='min-h-screen bg-gray-100 flex flex-col items-center'>
            <h1 className='text-4xl font-bold my-8'>Current Bookings</h1>
            <div className='flex flex-wrap justify-center'>
                {bookings.map(booking => (
                    <div key={booking._id} className='border p-4 m-4 rounded-lg bg-white shadow-lg w-80'>
                        {booking.building.image && (
                            <img 
                                src={`http://localhost:8000/uploads/${booking.building.image}`} 
                                alt={booking.building.name} 
                                className='w-full h-48 object-cover rounded-t-lg'
                            />
                        )}
                        <div className='p-4'>
                            <h2 className='text-2xl font-bold mb-2'>{booking.building.name}</h2>
                            <p className='text-gray-700 mb-2'><strong>Room:</strong> {booking.room}</p>
                            <p className='text-gray-700 mb-2'><strong>Booking Time:</strong> {booking.startTime} - {booking.endTime}</p>
                        </div>
                    </div>
                ))}
            </div>
            <ToastContainer />
        </div>
    );
}
