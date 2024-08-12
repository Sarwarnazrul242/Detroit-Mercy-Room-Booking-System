import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaCheckCircle, FaTimes } from 'react-icons/fa';
import Cookies from 'js-cookie';
import './CalendarStyles.css';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Specify your app root element to avoid accessibility issues with modals

const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hoursInt = parseInt(hours, 10);
    const minutesInt = parseInt(minutes, 10);
    const ampm = hoursInt >= 12 ? 'PM' : 'AM';
    const formattedHours = hoursInt % 12 || 12; // Convert 0 to 12 for 12 AM/PM
    return `${formattedHours}:${minutesInt < 10 ? '0' : ''}${minutesInt} ${ampm}`;
};

const generateTimeSlots = (isToday) => {
    const times = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (let h = 6; h < 23; h++) { // Generate times from 6 AM to 10 PM
        for (let m = 0; m < 60; m += 30) {
            if (isToday && (h < currentHour || (h === currentHour && m < currentMinute))) {
                continue; // Skip past times for today
            }
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            times.push(`${hour}:${minute}`);
        }
    }
    return times;
};

export default function BuildingDetails() {
    const { id } = useParams();
    const [building, setBuilding] = useState(null);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isBookingSuccessful, setIsBookingSuccessful] = useState(false);
    const email = Cookies.get('email'); // Fetch email from cookies
    const navigate = useNavigate(); // useNavigate hook

    const timeSlots = generateTimeSlots(selectedDate ? selectedDate.toDateString() === new Date().toDateString() : false);

    useEffect(() => {
        const fetchBuilding = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/getBuilding/${id}`);
                setBuilding(res.data);
                setFilteredRooms(res.data.rooms.filter(room => !room.isPaused)); // Initially set all rooms that are not paused
            } catch (e) {
                toast.error("Something went wrong while fetching building details!");
            }
        };
        fetchBuilding();
    }, [id]);

    const handleFilter = useCallback(async () => {
        if (!building) return;

        console.log('Filtering with:', { selectedDate, startTime, endTime, searchQuery });

        let filtered = building.rooms.filter(room => !room.isPaused);

        if (selectedDate) {
            const dayOfWeek = selectedDate.toLocaleString('en-US', { weekday: 'short' });
            filtered = filtered.filter(room => 
                room.schedule.some(slot => slot.days.includes(dayOfWeek))
            );
        }

        if (startTime) {
            try {
                const res = await axios.post('http://localhost:8000/getAvailableRooms', {
                    buildingId: id,
                    date: selectedDate.toISOString().split('T')[0],
                    startTime,
                    endTime: endTime || '23:59'
                });
                console.log('Available rooms:', res.data);
                filtered = filtered.filter(room => res.data.some(availableRoom => availableRoom._id === room._id));
            } catch (e) {
                toast.error("Something went wrong while filtering rooms!");
                return;
            }
        }

        if (searchQuery) {
            filtered = filtered.filter(room => room.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        setFilteredRooms(filtered);
    }, [building, id, selectedDate, startTime, endTime, searchQuery]);

    useEffect(() => {
        handleFilter();
    }, [selectedDate, startTime, endTime, searchQuery, handleFilter]);

    const clearFilters = () => {
        setSelectedDate(null);
        setStartTime('');
        setEndTime('');
        setSearchQuery('');
        setFilteredRooms(building.rooms.filter(room => !room.isPaused)); // Reset to all rooms that are not paused
    };

    const openModal = (room) => {
        let hasError = false;
        if (!selectedDate) {
            setDateError('Please select a date');
            hasError = true;
        } else {
            setDateError(''); // Clear the error if the date is selected
        }
    
        if (!startTime) {
            setTimeError('Please select a start time');
            hasError = true;
        } else {
            setTimeError(''); // Clear the error if the time is selected
        }
    
        if (!endTime) {
            setEndTimeError('Please select an end time');
            hasError = true;
        } else {
            setEndTimeError(''); // Clear the error if the end time is selected
        }
    
        if (!hasError) {
            setSelectedRoom(room);
            setIsBookingSuccessful(false);
            setModalIsOpen(true);
        }
    };
    
    
    const closeModal = () => {
        setSelectedRoom(null);
        setModalIsOpen(false);
    };

    const handleBooking = async () => {
        try {
            const booking = {
                buildingId: id,
                room: selectedRoom.name,
                date: selectedDate.toISOString().split('T')[0],
                startTime,
                endTime,
                userEmail: email
            };
            const res = await axios.post('http://localhost:8000/bookRoom', booking);
            if (res.data === 'success') {
                toast.success('Room booked successfully');
                setIsBookingSuccessful(true);
            } else if (res.data === 'conflict') {
                toast.error('Room is already booked for the selected time range');
            } else {
                toast.error('Failed to book room');
            }
        } catch (e) {
            toast.error('An error occurred');
        }
    };

    const handleViewBookings = () => {
        navigate('/currentBookings');
    };

    const handleBookAnotherRoom = () => {
        closeModal();
    };

    const [dateError, setDateError] = useState('');
    const [timeError, setTimeError] = useState('');
    const [endTimeError, setEndTimeError] = useState('');



    if (!building) return <p>Loading...</p>;

    return (
    <div className="min-h-screen bg-white p-4 overflow-auto">
        <div className="flex flex-wrap justify-center gap-4 mb-4 bg-gray-100 p-4 rounded-lg shadow-md">
            {/* Existing filter controls */}
            <div className="flex-1 max-w-xs">
                <label className="block font-semibold mb-2">Select Date</label>
                <div className="relative">
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => {
                            setSelectedDate(date);
                            setStartTime('');
                            setEndTime('');
                            setDateError('');
                        }}
                        className="w-full border rounded-lg p-2 pr-40"
                        dateFormat="MM/dd/yyyy"
                        minDate={new Date()} // Disable past dates
                    />
                    <FaCalendarAlt className="calendar-icon" />
                </div>
                {dateError && <p className="text-red-500 text-sm mt-1">{dateError}</p>}
            </div>
            <div className="flex-1 max-w-xs">
                <label className="block font-semibold mb-2">Start Time</label>
                <select
                    value={startTime}
                    onChange={(e) => {
                        setStartTime(e.target.value);
                        setTimeError(''); // Clear the error when time is selected
                    }}
                    className="w-full border rounded-lg p-2"
                    disabled={!selectedDate} // Disable if no date selected
                >
                    <option value="">Select start time</option>
                    {timeSlots.map(time => (
                        <option key={time} value={time}>
                            {formatTime(time)}
                        </option>
                    ))}
                </select>
                {timeError && <p className="text-red-500 text-sm mt-1">{timeError}</p>}
            </div>
            {startTime && (
                <div className="flex-1 max-w-xs">
                    <label className="block font-semibold mb-2">End Time</label>
                    <select
                        value={endTime}
                        onChange={(e) => {
                            setEndTime(e.target.value);
                            setEndTimeError(''); // Clear the error when the end time is selected
                        }}
                        className="w-full border rounded-lg p-2"
                    >
                        <option value="">Select end time</option>
                        {timeSlots
                            .filter(time => !startTime || time > startTime)
                            .map(time => (
                                <option key={time} value={time}>
                                    {formatTime(time)}
                                </option>
                            ))}
                    </select>
                    {endTimeError && <p className="text-red-500 text-sm mt-1">{endTimeError}</p>}
                </div>
            )}
            <div className="flex-1 max-w-xs">
                <label className="block font-semibold mb-2">Search Room</label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border rounded-lg p-2"
                    placeholder="Enter room name"
                />
            </div>
            <div className="flex items-end">
                <button onClick={clearFilters} className="bg-black text-white py-2 px-4 rounded-lg">Clear Filters</button>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-8 max-w-7xl mx-auto overflow-auto h-[70vh]">
            {filteredRooms.length > 0 ? (
                filteredRooms.map(room => (
                    <div key={room._id} className="border rounded-lg p-4 shadow-md flex cursor-pointer" onClick={() => openModal(room)}>
                        {room.image && (
                            <img 
                                src={`http://localhost:8000/uploads/${room.image}`} 
                                alt={room.name} 
                                className="w-48 h-48 object-cover rounded-lg mr-4"
                            />
                        )}
                        <div className="flex-grow">
                            <h2 className="text-2xl font-bold mb-2">{room.name}</h2>
                            <p className="text-gray-700 mb-2">{room.description}</p>
                            <p className="text-gray-700 mb-2">Max Count: {room.seats}</p>
                            <p className="text-gray-700 mb-2">Amenities: {Object.keys(room.amenities).filter(a => room.amenities[a]).join(', ')}</p>
                            <p className="text-gray-700 mb-2"><strong>Operation Hours:</strong></p>
                            <ul className="list-disc list-inside">
                                {room.schedule.map((schedule, index) => (
                                    <li key={index}>
                                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)} on {schedule.days.join(', ')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex justify-center items-center h-full">
                    <p className="text-3xl font-bold text-gray-600">No rooms available for this building at this time.</p>
                </div>
            )}
        </div>

        {selectedRoom && (
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Room Details"
                className="fixed inset-0 flex items-center justify-center"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <div className="bg-white p-8 rounded-lg max-w-4xl w-11/12 mx-4 overflow-y-auto relative">
                    <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                        <FaTimes size={24} />
                    </button>
                    {isBookingSuccessful ? (
                        <div className="flex flex-col items-center animate-success">
                            <FaCheckCircle size={60} className="text-green-500 mb-4" />
                            <h2 className="text-3xl font-bold mb-4">Booking Successful!</h2>
                            <p className="text-xl mb-8">Your room has been booked successfully.</p>
                            <div className="flex space-x-4">
                                <button 
                                    onClick={handleViewBookings} 
                                    className="bg-black text-white py-2 px-6 rounded-lg"
                                >
                                    View Bookings
                                </button>
                                <button 
                                    onClick={handleBookAnotherRoom} 
                                    className="bg-gray-300 text-black py-2 px-6 rounded-lg"
                                >
                                    Book Another Room
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            {selectedRoom.image && (
                                <img 
                                    src={`http://localhost:8000/uploads/${selectedRoom.image}`} 
                                    alt={selectedRoom.name} 
                                    className="w-92 h-60 object-cover rounded-lg mb-4"
                                />
                            )}
                            <h2 className="text-3xl font-bold mb-2">{selectedRoom.name}</h2>
                            <p className="mb-2"><strong>Description:</strong> {selectedRoom.description}</p>
                            <p className="mb-2"><strong>Max Count:</strong> {selectedRoom.seats}</p>
                            <p className="mb-2"><strong>Amenities:</strong> {Object.keys(selectedRoom.amenities).filter(a => selectedRoom.amenities[a]).join(', ')}</p>
                            <p className="mb-2"><strong>Operation Hours:</strong></p>
                            <ul className="list-disc list-inside mb-4">
                                {selectedRoom.schedule.map((schedule, index) => (
                                    <li key={index}>
                                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)} on {schedule.days.join(', ')}
                                    </li>
                                ))}
                            </ul>
                            <h3 className="text-xl font-bold mb-2">Booking Details</h3>
                            <p className="mb-2"><strong>Building:</strong> {building.name}</p>
                            <p className="mb-2"><strong>Room:</strong> {selectedRoom.name}</p>
                            <p className="mb-2"><strong>Date:</strong> {selectedDate ? selectedDate.toLocaleDateString() : ''}</p>
                            <p className="mb-2"><strong>Time:</strong> {startTime && endTime ? `${formatTime(startTime)} - ${formatTime(endTime)}` : ''}</p>
                            <button onClick={handleBooking} className="bg-black text-white py-2 px-6 rounded-lg mb-2">Book</button>
                            <button onClick={closeModal} className="bg-gray-300 text-black py-2 px-6 rounded-lg">Cancel</button>
                        </div>
                    )}
                </div>
            </Modal>
        )}
        <ToastContainer />
    </div>
);
}