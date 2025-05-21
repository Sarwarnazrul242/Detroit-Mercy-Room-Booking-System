import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import { FaTrashAlt } from 'react-icons/fa';
import Modal from 'react-modal';
import './CurrentBookings.css';

Modal.setAppElement('#root'); // Specify your app root element to avoid accessibility issues with modals

const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hoursInt = parseInt(hours, 10);
    const minutesInt = parseInt(minutes, 10);
    const ampm = hoursInt >= 12 ? 'PM' : 'AM';
    const formattedHours = hoursInt % 12 || 12; // Convert 0 to 12 for 12 AM/PM
    return `${formattedHours}:${minutesInt < 10 ? '0' : ''}${minutesInt} ${ampm}`;
};

export default function CurrentBookings() {
    const [bookings, setBookings] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMessageModalIsOpen, setViewMessageModalIsOpen] = useState(false);
    const email = Cookies.get('email'); // Fetch email from cookies

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.post('http://localhost:8000/getUserBookings', { userEmail: email });
                setBookings(res.data);
            } catch (e) {
                toast.error("Something went wrong while fetching your bookings!");
            }
        };
        fetchBookings();
    }, [email]);

    const handleCancelBooking = async () => {
        try {
            const res = await axios.post(`http://localhost:8000/cancelBooking`, {
                bookingId: selectedBooking._id,
                reason: 'User requested cancellation',
            });
            if (res.data.success) {
                toast.success('Booking cancelled successfully');
                setBookings(bookings.map(booking => 
                    booking._id === selectedBooking._id ? { ...booking, canceled: true } : booking
                ));
                setIsModalOpen(false);
            } else {
                toast.error('Failed to cancel booking');
            }
        } catch (e) {
            toast.error('An error occurred while cancelling the booking');
        }
    };

    const openModal = (booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
    };

    const openViewMessageModal = (booking) => {
        setSelectedBooking(booking);
        setViewMessageModalIsOpen(true);
    };

    const closeViewMessageModal = () => {
        setViewMessageModalIsOpen(false);
        setSelectedBooking(null);
    };

    const currentBookings = bookings.filter(booking => new Date(booking.date) >= new Date());
    const pastBookings = bookings.filter(booking => new Date(booking.date) < new Date());

    return (
        <div className="min-h-screen bg-white p-4 relative">
            <h1 className="text-2xl font-bold mb-8">My Bookings</h1>
            <button 
                onClick={() => setShowHistory(!showHistory)} 
                className="bg-black text-white py-2 px-4 rounded absolute top-4 right-4"
            >
                {showHistory ? 'View Upcoming Bookings' : 'View Booking History'}
            </button>
            {showHistory ? (
                <>
                    <div className="booking-grid overflow-auto max-h-[75vh]">
                        {pastBookings.length > 0 ? (
                            pastBookings.map(booking => (
                                <div key={booking._id} className="booking-card">
                                    {booking.buildingId.image && (
                                        <img 
                                            src={`http://localhost:8000/${booking.buildingId.image}`} 
                                            alt={booking.buildingId.name} 
                                        />
                                    )}
                                    <div className="booking-card-content">
                                        <h2 className="booking-card-title">{booking.buildingId.name}</h2>
                                        <p className="booking-card-room">{booking.room}</p>
                                        <p className="booking-card-date">Date: {new Date(booking.date).toLocaleDateString()}</p>
                                        <p className="booking-card-time">Time: {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                                        {booking.canceled && (
                                            <div className="text-red-500">
                                                <p>Canceled</p>
                                                <button 
                                                    onClick={() => openViewMessageModal(booking)} 
                                                    className="bg-blue-500 text-white py-1 px-2 rounded mt-2"
                                                >
                                                    View Message
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No past bookings found.</p>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="booking-grid overflow-auto max-h-[75vh]">
                        {currentBookings.length > 0 ? (
                            currentBookings.map(booking => (
                                <div key={booking._id} className="booking-card">
                                    {booking.buildingId.image && (
                                        <img 
                                            src={`http://localhost:8000/${booking.buildingId.image}`} 
                                            alt={booking.buildingId.name} 
                                        />
                                    )}
                                    <div className="booking-card-content">
                                        <h2 className="booking-card-title">{booking.buildingId.name}</h2>
                                        <p className="booking-card-room">{booking.room}</p>
                                        <p className="booking-card-date">Date: {new Date(booking.date).toLocaleDateString()}</p>
                                        <p className="booking-card-time">Time: {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                                        {!booking.canceled && (
                                            <button 
                                                onClick={() => openModal(booking)} 
                                                className="bg-customRed text-white py-2 px-4 rounded"
                                            >
                                                <FaTrashAlt /> Cancel Booking
                                            </button>
                                        )}
                                        {booking.canceled && (
                                            <div className="text-red-500">
                                                <p>Canceled</p>
                                                <button 
                                                    onClick={() => openViewMessageModal(booking)} 
                                                    className="bg-blue-500 text-white py-1 px-2 rounded mt-2"
                                                >
                                                    View Message
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No upcoming bookings found.</p>
                        )}
                    </div>
                </>
            )}
            <Modal 
                isOpen={isModalOpen} 
                onRequestClose={closeModal} 
                className="modal" 
                overlayClassName="overlay"
            >
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Cancel Booking</h2>
                    <p>Are you sure you want to cancel this booking?</p>
                    <div className="flex justify-end mt-4">
                        <button 
                            onClick={closeModal} 
                            className="bg-gray-300 text-black py-2 px-4 rounded mr-2"
                        >
                            No
                        </button>
                        <button 
                            onClick={handleCancelBooking} 
                            className="bg-customRed text-white py-2 px-4 rounded"
                        >
                            Yes, Cancel
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal 
                isOpen={viewMessageModalIsOpen} 
                onRequestClose={closeViewMessageModal} 
                className="modal" 
                overlayClassName="overlay"
            >
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Cancellation Reason</h2>
                    <p>{selectedBooking?.cancelReason}</p>
                    <div className="flex justify-end mt-4">
                        <button 
                            onClick={closeViewMessageModal} 
                            className="bg-gray-300 text-black py-2 px-4 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
            <ToastContainer />
        </div>
    );
}
