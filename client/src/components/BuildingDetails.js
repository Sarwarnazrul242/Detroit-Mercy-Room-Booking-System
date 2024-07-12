import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import './CalendarStyles.css';
import Cookies from 'js-cookie';

export default function BuildingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [building, setBuilding] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [errors, setErrors] = useState({});
    const [user, setUser] = useState(null);

    const email = Cookies.get('email'); // Fetch email from cookies

    useEffect(() => {
        const fetchBuilding = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/getBuilding/${id}`);
                setBuilding(res.data);
            } catch (e) {
                toast.error("Something went wrong while fetching building details!");
            }
        };
        fetchBuilding();
    }, [id]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.post("http://localhost:8000/myaccount", { cookieValue: email });
                setUser(res.data);
            } catch (e) {
                toast.error("Something went wrong while fetching user details!");
            }
        };
        fetchUser();
    }, [email]);

    useEffect(() => {
        if (building && selectedRoom) {
            const room = building.rooms.find(room => room.name === selectedRoom);
            if (room) {
                setAvailableRooms(room.schedule);
            }
        }
    }, [building, selectedRoom, selectedDate]);

    const handleBooking = async () => {
        const errors = {};
        if (!selectedRoom) errors.room = 'Please select a room';
        if (!startTime) errors.startTime = 'Please select a start time';
        if (!endTime) errors.endTime = 'Please select an end time';
        if (startTime && endTime && startTime >= endTime) errors.time = 'End time must be after start time';
        
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }

        try {
            const booking = {
                buildingId: id,
                room: selectedRoom,
                date: selectedDate,
                startTime,
                endTime,
                userEmail: user.email // Use the user's email
            };
            const res = await axios.post('http://localhost:8000/bookRoom', booking);
            if (res.data === 'success') {
                toast.success('Room booked successfully');
                navigate('/login');
            } else if (res.data === 'conflict') {
                toast.error('Room is already booked for the selected time range');
            } else {
                toast.error('Failed to book room');
            }
        } catch (e) {
            toast.error('An error occurred');
        }
    };

    const tileDisabled = ({ date }) => {
        return date.getDay() === 0 || date.getDay() === 6;
    };

    if (!building) return <p>Loading...</p>;

    return (
        <div className="min-h-screen bg-white p-8">
            <Link to="/newbookings" className="text-blue-500 hover:underline mb-4 inline-block">Back to Available Buildings</Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    {building.image && (
                        <img 
                            src={`http://localhost:8000/${building.image}`} 
                            alt={building.name} 
                            className="w-full h-64 object-contain rounded-lg mb-4"
                        />
                    )}
                    <h1 className="text-3xl font-bold mb-4">{building.name}</h1>
                    <p className="text-gray-700 mb-4">{building.description}</p>
                    <p className="font-semibold">All rooms:</p>
                    <p className="text-gray-700 mb-4">{building.rooms.map(room => room.name).join(', ')}</p>
                    <p className="font-semibold">Opening Times:</p>
                    <p className="text-gray-700 mb-4">2:00am - 10:00pm</p>
                </div>
                <div>
                    <h2 className="text-xl font-bold mb-4">Book Room</h2>
                    <p className="text-gray-600 mb-4">NOTE: Please ensure to fulfill your reservation. We kindly remind you that there is a three-strike policy in place to maintain fairness for all users.</p>
                    <div className="mb-4">
                        <label className="block font-semibold mb-2">Booking Date</label>
                        <div className="relative">
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                className="w-full border rounded-lg p-2 pr-10"
                                dateFormat="MM/dd/yyyy"
                                minDate={new Date()}
                                filterDate={date => date.getDay() !== 0 && date.getDay() !== 6}
                            />
                            <FaCalendarAlt className="calendar-icon" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block font-semibold mb-2">Booking range</label>
                        <input 
                            type="time" 
                            value={startTime} 
                            onChange={(e) => setStartTime(e.target.value)} 
                            className="border rounded-lg p-2 mr-2"
                        />
                        <span>:</span>
                        <input 
                            type="time" 
                            value={endTime} 
                            onChange={(e) => setEndTime(e.target.value)} 
                            className="border rounded-lg p-2 ml-2"
                        />
                        {errors.startTime && <p className="text-red-500">{errors.startTime}</p>}
                        {errors.endTime && <p className="text-red-500">{errors.endTime}</p>}
                        {errors.time && <p className="text-red-500">{errors.time}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block font-semibold mb-2">Room</label>
                        <select 
                            value={selectedRoom} 
                            onChange={(e) => setSelectedRoom(e.target.value)} 
                            className="border rounded-lg p-2 w-full"
                        >
                            <option value="">Select a room</option>
                            {building.rooms.map(room => (
                                <option key={room.name} value={room.name}>{room.name}</option>
                            ))}
                        </select>
                        {errors.room && <p className="text-red-500">{errors.room}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block font-semibold mb-2">Available Times</label>
                        <ul className="list-disc list-inside">
                            {availableRooms.map((schedule, index) => (
                                <li key={index}>{schedule.startTime} - {schedule.endTime}</li>
                            ))}
                        </ul>
                    </div>
                    <button onClick={handleBooking} className="bg-black text-white py-2 px-6 rounded-lg">Book Room</button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}
