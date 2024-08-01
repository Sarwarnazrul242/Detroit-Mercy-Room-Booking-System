import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ManageBookingsStyles.css';
import Modal from 'react-modal';

const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hoursInt = parseInt(hours, 10);
    const minutesInt = parseInt(minutes, 10);
    const ampm = hoursInt >= 12 ? 'PM' : 'AM';
    const formattedHours = hoursInt % 12 || 12;
    return `${formattedHours}:${minutesInt < 10 ? '0' : ''}${minutesInt} ${ampm}`;
};

Modal.setAppElement('#root');

export default function ManageBookings() {
    const [allBookings, setAllBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [filters, setFilters] = useState({
        username: '',
        email: '',
        building: '',
        room: '',
        status: '',
        bookingType: 'upcoming',
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.get('http://localhost:8000/getBookings');
                setAllBookings(res.data);
                setFilteredBookings(res.data);
            } catch (e) {
                console.error("Error fetching bookings:", e);
                toast.error("Something went wrong while fetching bookings!");
            }
        };

        const fetchBuildings = async () => {
            try {
                const res = await axios.get('http://localhost:8000/getBuildings');
                setBuildings(res.data);
            } catch (e) {
                console.error("Error fetching buildings:", e);
                toast.error("Something went wrong while fetching buildings!");
            }
        };

        fetchBookings();
        fetchBuildings();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });

        if (name === 'building') {
            const selectedBuilding = buildings.find(building => building.name === value);
            setRooms(selectedBuilding ? selectedBuilding.rooms : []);
        }
    };

    const clearFilters = () => {
        setFilters({
            username: '',
            email: '',
            building: '',
            room: '',
            status: '',
            bookingType: 'upcoming',
        });
        setRooms([]);
        setFilteredBookings(allBookings);
    };

    const applyFilters = () => {
        const currentDate = new Date();
        const filtered = allBookings.filter(booking => {
            const { userId, buildingId, room, date, canceled } = booking;
            const { username, email, building, room: roomFilter, status, bookingType } = filters;
            const bookingDate = new Date(date);
            const isUpcoming = bookingDate >= currentDate && !canceled;
            const isPast = bookingDate < currentDate || canceled;

            return (
                (!username || userId?.name.toLowerCase().includes(username.toLowerCase())) &&
                (!email || userId?.email.toLowerCase().includes(email.toLowerCase())) &&
                (!building || buildingId?.name.toLowerCase().includes(building.toLowerCase())) &&
                (!roomFilter || room.toLowerCase().includes(roomFilter.toLowerCase())) &&
                (!status || userId?.status.toLowerCase() === status.toLowerCase()) &&
                (bookingType === 'all' || (bookingType === 'upcoming' && isUpcoming) || (bookingType === 'past' && isPast))
            );
        });
        setFilteredBookings(filtered);
    };

    const openModal = (bookingId) => {
        setBookingToDelete(bookingId);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setBookingToDelete(null);
    };

    const openCancelModal = (bookingId) => {
        setBookingToCancel(bookingId);
        setCancelModalIsOpen(true);
    };

    const closeCancelModal = () => {
        setCancelModalIsOpen(false);
        setBookingToCancel(null);
        setCancelReason('');
    };

    const confirmDeleteBooking = async () => {
        try {
            await axios.delete(`http://localhost:8000/deleteBooking/${bookingToDelete}`);
            toast.success('Booking deleted successfully');
            setAllBookings(allBookings.filter(booking => booking._id !== bookingToDelete));
            setFilteredBookings(filteredBookings.filter(booking => booking._id !== bookingToDelete));
            closeModal();
        } catch (e) {
            console.error("Error deleting booking:", e);
            toast.error("Something went wrong while deleting the booking!");
        }
    };

    const confirmCancelBooking = async () => {
        try {
            await axios.post(`http://localhost:8000/cancelBooking`, {
                bookingId: bookingToCancel,
                reason: cancelReason,
            });
            toast.success('Booking canceled successfully');
            setAllBookings(allBookings.map(booking => 
                booking._id === bookingToCancel ? { ...booking, canceled: true } : booking
            ));
            setFilteredBookings(filteredBookings.map(booking => 
                booking._id === bookingToCancel ? { ...booking, canceled: true } : booking
            ));
            closeCancelModal();
        } catch (e) {
            console.error("Error canceling booking:", e);
            toast.error("Something went wrong while canceling the booking!");
        }
    };

    const currentDate = new Date();

    const upcomingBookings = filteredBookings.filter(booking => new Date(booking.date) >= currentDate && !booking.canceled);
    const pastBookings = filteredBookings.filter(booking => new Date(booking.date) < currentDate || booking.canceled);

    return (
        <div className="min-h-screen bg-white p-8">
            <h1 className="text-4xl font-bold mb-8">Manage Bookings</h1>
            <div className="filter-container mb-6 flex flex-wrap gap-4">
                <input 
                    type="text" 
                    name="username" 
                    value={filters.username} 
                    onChange={handleInputChange} 
                    placeholder="Filter by username" 
                    className="border p-2 rounded mb-2 w-full md:w-auto"
                />
                <input 
                    type="text" 
                    name="email" 
                    value={filters.email} 
                    onChange={handleInputChange} 
                    placeholder="Filter by email" 
                    className="border p-2 rounded mb-2 w-full md:w-auto"
                />
                <select 
                    name="building" 
                    value={filters.building} 
                    onChange={handleInputChange} 
                    className="border p-2 rounded mb-2 w-full md:w-auto"
                >
                    <option value="">Filter by building</option>
                    {buildings.map(building => (
                        <option key={building._id} value={building.name}>{building.name}</option>
                    ))}
                </select>
                {filters.building && (
                    <select 
                        name="room" 
                        value={filters.room} 
                        onChange={handleInputChange} 
                        className="border p-2 rounded mb-2 w-full md:w-auto"
                    >
                        <option value="">Filter by room</option>
                        {rooms.map((room, index) => (
                            <option key={index} value={room.name}>{room.name}</option>
                        ))}
                    </select>
                )}
                <select 
                    name="status" 
                    value={filters.status} 
                    onChange={handleInputChange} 
                    className="border p-2 rounded mb-2 w-full md:w-auto"
                >
                    <option value="">Filter by status</option>
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Staff">Staff</option>
                </select>
                <select 
                    name="bookingType" 
                    value={filters.bookingType} 
                    onChange={handleInputChange} 
                    className="border p-2 rounded mb-2 w-full md:w-auto"
                >
                    <option value="upcoming">Upcoming Bookings</option>
                    <option value="past">Past Bookings</option>
                    <option value="all">All Bookings</option>
                </select>
                <button onClick={clearFilters} className="bg-black text-white py-2 px-4 rounded mb-2 w-full md:w-auto">Clear Filters</button>
            </div>
            <div className="scrollable-container">
                {filters.bookingType === 'all' ? (
                    <>
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold mb-4">Upcoming Bookings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[65vh] overflow-auto">
                                {upcomingBookings.map((booking, index) => (
                                    <div key={index} className="booking-card border rounded-lg p-4 shadow-md flex flex-col items-center">
                                        <div className="text-center">
                                            <h2 className="booking-card-title text-xl font-bold mb-2">{booking.userId?.name || 'N/A'}</h2>
                                            <p className="booking-card-email text-gray-700 mb-2">{booking.userId?.email || 'N/A'}</p>
                                            <p className="booking-card-status text-gray-700 mb-2">{booking.userId?.status || 'N/A'}</p>
                                            <p className="booking-card-date text-gray-700 mb-2">Date: {new Date(booking.date).toLocaleDateString()}</p>
                                            <p className="booking-card-time text-gray-700 mb-2">Time: {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                                            <p className="booking-card-building text-gray-700 mb-2">Building: {booking.buildingId?.name || 'N/A'}</p>
                                            <p className="booking-card-room text-gray-700 mb-2">Room: {booking.room}</p>
                                            <div className="flex space-x-2">
                                                <button onClick={() => openCancelModal(booking._id)} className="bg-customRed text-white py-1 px-3 rounded mt-4">Cancel Booking</button>
                                                <button onClick={() => openModal(booking._id)} className="bg-customRed text-white py-1 px-3 rounded mt-4">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Past Bookings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[65vh] overflow-auto">
                                {pastBookings.map((booking, index) => (
                                    <div key={index} className="booking-card border rounded-lg p-4 shadow-md flex flex-col items-center">
                                        <div className="text-center">
                                            <h2 className="booking-card-title text-xl font-bold mb-2">{booking.userId?.name || 'N/A'}</h2>
                                            <p className="booking-card-email text-gray-700 mb-2">{booking.userId?.email || 'N/A'}</p>
                                            <p className="booking-card-status text-gray-700 mb-2">{booking.userId?.status || 'N/A'}</p>
                                            <p className="booking-card-date text-gray-700 mb-2">Date: {new Date(booking.date).toLocaleDateString()}</p>
                                            <p className="booking-card-time text-gray-700 mb-2">Time: {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                                            <p className="booking-card-building text-gray-700 mb-2">Building: {booking.buildingId?.name || 'N/A'}</p>
                                            <p className="booking-card-room text-gray-700 mb-2">Room: {booking.room}</p>
                                            {booking.canceled && <p className="text-red-500 mb-2">Canceled</p>}
                                            <div className="flex justify-center w-full mt-4">
                                                <button onClick={() => openModal(booking._id)} className="bg-customRed text-white py-1 px-3 rounded">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[65vh] overflow-auto">
                        {filteredBookings.map((booking, index) => (
                            <div key={index} className="booking-card border rounded-lg p-4 shadow-md flex flex-col items-center">
                                <div className="text-center">
                                    <h2 className="booking-card-title text-xl font-bold mb-2">{booking.userId?.name || 'N/A'}</h2>
                                    <p className="booking-card-email text-gray-700 mb-2">{booking.userId?.email || 'N/A'}</p>
                                    <p className="booking-card-status text-gray-700 mb-2">{booking.userId?.status || 'N/A'}</p>
                                    <p className="booking-card-date text-gray-700 mb-2">Date: {new Date(booking.date).toLocaleDateString()}</p>
                                    <p className="booking-card-time text-gray-700 mb-2">Time: {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                                    <p className="booking-card-building text-gray-700 mb-2">Building: {booking.buildingId?.name || 'N/A'}</p>
                                    <p className="booking-card-room text-gray-700 mb-2">Room: {booking.room}</p>
                                    {booking.canceled && <p className="text-red-500 mb-2">Canceled</p>}
                                    <div className="flex space-x-2">
                                    <div className="flex justify-center w-full mt-4">
                                                <button onClick={() => openModal(booking._id)} className="bg-customRed text-white py-1 px-3 rounded">Delete</button>
                                            </div>
                                        {!booking.canceled && filters.bookingType === 'upcoming' && (
                                            <button onClick={() => openCancelModal(booking._id)} className="bg-customRed text-white py-1 px-3 rounded mt-4">Cancel Booking</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modal2" overlayClassName="overlay">
                <button onClick={closeModal} className="close-button">&times;</button>
                <div className='p-4 bg-white rounded-lg shadow-md'>
                    <h2 className='text-2xl font-bold mb-4'>Delete Booking</h2>
                    <p className='mb-4'>Are you sure you want to delete this booking?</p>
                    <button onClick={confirmDeleteBooking} className='bg-customRed text-white py-2 px-4 rounded'>Delete</button>
                    <button onClick={closeModal} className='bg-gray-300 text-black py-2 px-4 rounded ml-2'>Cancel</button>
                </div>
            </Modal>
            <Modal isOpen={cancelModalIsOpen} onRequestClose={closeCancelModal} className="modal" overlayClassName="overlay">
                <button onClick={closeCancelModal} className="close-button">&times;</button>
                <div className='p-4 bg-white rounded-lg shadow-md'>
                    <h2 className='text-2xl font-bold mb-4'>Cancel Booking</h2>
                    <p className='mb-4'>Please provide a reason for cancelling this booking:</p>
                    <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className='w-full p-2 border rounded mb-4'
                        placeholder='Enter reason here...'
                    />
                    <button onClick={confirmCancelBooking} className='bg-customRed text-white py-2 px-4 rounded'>Cancel Booking</button>
                    <button onClick={closeCancelModal} className='bg-gray-300 text-black py-2 px-4 rounded ml-2'>Cancel</button>
                </div>
            </Modal>
            <ToastContainer />
        </div>
    );
}
