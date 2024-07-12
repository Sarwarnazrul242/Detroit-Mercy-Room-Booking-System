import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

export default function ManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [filters, setFilters] = useState({
        username: '',
        email: '',
        building: '',
        room: '',
        status: ''
    });

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.get('http://localhost:8000/getBookings');
                setBookings(res.data);
            } catch (e) {
                console.error("Error fetching bookings:", e); // Log the error to the console
                toast.error("Something went wrong while fetching bookings!");
            }
        };

        fetchBookings();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const applyFilters = () => {
        // Implement the logic to filter bookings based on the filters
        const filteredBookings = bookings.filter(booking => {
            const { userEmail, buildingId, room, date } = booking;
            const { username, email, building, room: roomFilter, status } = filters;
            return (
                (!username || userEmail?.name.includes(username)) &&
                (!email || userEmail?.email.includes(email)) &&
                (!building || buildingId?.name.includes(building)) &&
                (!roomFilter || room.includes(roomFilter)) &&
                (!status || userEmail?.status === status)
            );
        });
        setBookings(filteredBookings);
    };

    return (
        <div className='min-h-screen bg-white p-8'>
            <h1 className='text-4xl font-bold mb-8'>Manage Bookings</h1>
            <div className='mb-6'>
                <input 
                    type='text' 
                    name='username' 
                    value={filters.username} 
                    onChange={handleInputChange} 
                    placeholder='Filter by username' 
                    className='border p-2 rounded mb-2 w-full'
                />
                <input 
                    type='text' 
                    name='email' 
                    value={filters.email} 
                    onChange={handleInputChange} 
                    placeholder='Filter by email' 
                    className='border p-2 rounded mb-2 w-full'
                />
                <input 
                    type='text' 
                    name='building' 
                    value={filters.building} 
                    onChange={handleInputChange} 
                    placeholder='Filter by building' 
                    className='border p-2 rounded mb-2 w-full'
                />
                <input 
                    type='text' 
                    name='room' 
                    value={filters.room} 
                    onChange={handleInputChange} 
                    placeholder='Filter by room' 
                    className='border p-2 rounded mb-2 w-full'
                />
                <input 
                    type='text' 
                    name='status' 
                    value={filters.status} 
                    onChange={handleInputChange} 
                    placeholder='Filter by status (Student, Faculty, Staff)' 
                    className='border p-2 rounded mb-2 w-full'
                />
                <button onClick={applyFilters} className='bg-black text-white py-2 px-4 rounded'>Apply Filters</button>
            </div>
            <table className='w-full border-collapse'>
                <thead>
                    <tr>
                        <th className='border p-2'>Username</th>
                        <th className='border p-2'>Email</th>
                        <th className='border p-2'>Building</th>
                        <th className='border p-2'>Room</th>
                        <th className='border p-2'>Date</th>
                        <th className='border p-2'>Start Time</th>
                        <th className='border p-2'>End Time</th>
                        <th className='border p-2'>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((booking, index) => (
                        <tr key={index}>
                            <td className='border p-2'>{booking.userEmail?.name || 'N/A'}</td>
                            <td className='border p-2'>{booking.userEmail?.email || 'N/A'}</td>
                            <td className='border p-2'>{booking.buildingId?.name || 'N/A'}</td>
                            <td className='border p-2'>{booking.room}</td>
                            <td className='border p-2'>{new Date(booking.date).toLocaleDateString()}</td>
                            <td className='border p-2'>{booking.startTime}</td>
                            <td className='border p-2'>{booking.endTime}</td>
                            <td className='border p-2'>{booking.userEmail?.status || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <ToastContainer />
        </div>
    );
}
