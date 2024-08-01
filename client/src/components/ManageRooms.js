import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Modal from 'react-modal';
import { FaTimes, FaArrowLeft, FaEllipsisV } from 'react-icons/fa';
import './RoomStyle.css';

Modal.setAppElement('#root');

function convertTo12Hour(time) {
    if (!time) {
        return ''; // Return empty string if time is undefined or null
    }
    let [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export default function ManageRooms() {
    const { id } = useParams();
    const [building, setBuilding] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [roomName, setRoomName] = useState('');
    const [roomDescription, setRoomDescription] = useState('');
    const [roomSeats, setRoomSeats] = useState('');
    const [roomImage, setRoomImage] = useState(null);
    const [amenities, setAmenities] = useState({
        projector: false,
        whiteboard: false,
        tv: false
    });
    const [schedule, setSchedule] = useState([{ startTime: '', endTime: '', days: [] }]);
    const [showEndTime, setShowEndTime] = useState([false]);
    const [showMenu, setShowMenu] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBuilding = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/getBuilding/${id}`);
                setBuilding(res.data);
                setRooms(res.data.rooms || []);
            } catch (e) {
                toast.error("Something went wrong while fetching building details!");
            }
        };

        fetchBuilding();
    }, [id]);

    const openModal = (room = null) => {
        setIsEditMode(!!room);
        setCurrentRoom(room);
        setRoomName(room ? room.name : '');
        setRoomDescription(room ? room.description : '');
        setRoomSeats(room ? room.seats : '');
        setAmenities(room ? (room.amenities || { projector: false, whiteboard: false, tv: false }) : { projector: false, whiteboard: false, tv: false });
        setSchedule(room ? room.schedule : [{ startTime: '', endTime: '', days: [] }]);
        setShowEndTime([false]); // Reset showEndTime state
        setIsModalOpen(true);
    };

    const openDeleteModal = (room) => {
        setCurrentRoom(room);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentRoom(null);
        setRoomName('');
        setRoomDescription('');
        setRoomSeats('');
        setRoomImage(null);
        setAmenities({ projector: false, whiteboard: false, tv: false });
        setSchedule([{ startTime: '', endTime: '', days: [] }]);
        setShowEndTime([false]); // Reset showEndTime state
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setCurrentRoom(null);
    };

    const handleAddOrUpdateRoom = async () => {
        if (!roomName) {
            toast.error("Room name is required");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', roomName);
            formData.append('description', roomDescription);
            formData.append('seats', roomSeats);
            formData.append('schedule', JSON.stringify(schedule.map(slot => ({
                ...slot,
                days: slot.days || [] // Ensure days is an array
            }))));
            formData.append('amenities', JSON.stringify(amenities));
            if (roomImage) {
                formData.append('image', roomImage);
            }

            let res;
            if (isEditMode) {
                res = await axios.put(`http://localhost:8000/editRoom/${id}/${currentRoom._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await axios.put(`http://localhost:8000/addRoom/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (res.data.success) {
                const newRoom = res.data.room;
                if (isEditMode) {
                    setRooms(rooms.map(room => room._id === currentRoom._id ? newRoom : room));
                    toast.success("Room updated successfully");
                } else {
                    setRooms([...rooms, newRoom]);
                    toast.success("Room added successfully");
                }
                closeModal();
            } else {
                toast.error("Failed to add/update room");
            }
        } catch (e) {
            toast.error("An error occurred while adding/updating the room");
        }
    };

    const confirmDeleteRoom = async () => {
        try {
            const res = await axios.delete(`http://localhost:8000/deleteRoom/${id}/${currentRoom._id}`);
            if (res.data === 'success') {
                setRooms(rooms.filter(room => room._id !== currentRoom._id));
                toast.success("Room deleted successfully");
                closeDeleteModal();
            } else {
                toast.error("Failed to delete room");
            }
        } catch (e) {
            toast.error("An error occurred while deleting the room");
        }
    };

    const handleScheduleChange = (index, field, value) => {
        const newSchedule = [...schedule];
        if (!newSchedule[index].days) {
            newSchedule[index].days = [];
        }
        newSchedule[index][field] = value;
        setSchedule(newSchedule);
    };

    const addScheduleField = () => {
        setSchedule([...schedule, { startTime: '', endTime: '', days: [] }]);
        setShowEndTime([...showEndTime, false]); // Add a new false value for the new schedule
    };

    const handleDaysChange = (index, day) => {
        const newSchedule = [...schedule];
        const days = newSchedule[index].days.includes(day)
            ? newSchedule[index].days.filter(d => d !== day)
            : [...newSchedule[index].days, day];
        newSchedule[index].days = days;
        setSchedule(newSchedule);
    };

    const handleAmenitiesChange = (event) => {
        const { name, checked } = event.target;
        setAmenities({
            ...amenities,
            [name]: checked
        });
    };

    const handleImageChange = (event) => {
        setRoomImage(event.target.files[0]);
    };

    const toggleMenu = (roomId) => {
        setShowMenu((prevState) => ({
            ...prevState,
            [roomId]: !prevState[roomId]
        }));
    };

    const handlePauseClick = async (roomId, isPaused) => {
        try {
            await axios.put(`http://localhost:8000/pauseRoom/${id}/${roomId}`, { isPaused: !isPaused });
            setRooms((prevState) => 
                prevState.map((room) => 
                    room._id === roomId ? { ...room, isPaused: !isPaused } : room
                )
            );
            setShowMenu((prevState) => ({
                ...prevState,
                [roomId]: false // Close the menu after pausing/unpausing
            }));
            toast.success(`Room ${isPaused ? 'unpaused' : 'paused'} successfully`);
        } catch (e) {
            toast.error("Something went wrong while pausing/unpausing the room!");
        }
    };

    const timeSlots = [];
    for (let h = 6; h <= 23; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            timeSlots.push(`${hour}:${minute}`);
        }
    }

    return (
        <div className={`min-h-screen bg-white flex flex-col items-center ${isModalOpen || isDeleteModalOpen ? 'blur-background' : ''}`}>
            <div className='flex items-center justify-start w-full px-8 py-4'>
                <button onClick={() => navigate('/manageBuildings')} className='flex items-center bg-black text-white py-2 px-4 rounded'>
                    <FaArrowLeft className='inline-block mr-2' />
                    Back
                </button>
            </div>
            <h1 className='text-4xl font-bold my-8'>Manage Rooms for {building?.name}</h1>
            <button onClick={() => openModal()} className='bg-black text-white py-2 px-4 rounded mb-4'>Add Room</button>
            <div className='flex flex-wrap justify-center'>
                {rooms.map(room => (
                    <div key={room._id} className='relative border p-4 m-4 rounded-lg bg-white shadow-lg w-80'>
                        {room.image && (
                            <img 
                                src={`http://localhost:8000/uploads/${room.image}`} 
                                alt={room.name} 
                                className='w-full h-48 object-contain rounded-t-lg'
                            />
                        )}
                        <div className='absolute top-2 right-2'>
                            <button onClick={() => toggleMenu(room._id)}>
                                <FaEllipsisV />
                            </button>
                            {showMenu[room._id] && (
                                <div className='absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50'>
                                    <button 
                                        onClick={() => handlePauseClick(room._id, room.isPaused)}
                                        className='block w-full text-left px-4 py-2 text-black font-semibold rounded hover:bg-gray-300'
                                    >
                                        {room.isPaused ? 'Unpause' : 'Pause'}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className='p-4'>
                            <h2 className='text-2xl font-bold mb-2'>{room.name}</h2>
                            <p className='text-gray-700 mb-2'>{room.description}</p>
                            <p className='text-gray-700 mb-2'>Seats: {room.seats}</p>
                            <p className='text-gray-700 mb-4'>
                                {room.schedule.map((slot, index) => (
                                    <span key={index}>
                                        {convertTo12Hour(slot.startTime)} - {convertTo12Hour(slot.endTime)} on {slot.days?.join(', ')}<br />
                                    </span>
                                ))}
                            </p>
                            <p className='text-gray-700 mb-4'>
                                Amenities:
                                {room.amenities?.projector && <span> Projector</span>}
                                {room.amenities?.whiteboard && <span> Whiteboard</span>}
                                {room.amenities?.tv && <span> TV</span>}
                            </p>
                            <div className='flex justify-between'>
                                <button onClick={() => openModal(room)} className='bg-black text-white py-2 px-4 rounded'>Edit</button>
                                <button onClick={() => openDeleteModal(room)} className='bg-customRed text-white py-2 px-4 rounded'>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <ToastContainer />
            <Modal isOpen={isModalOpen} onRequestClose={closeModal} className="modal" overlayClassName="overlay">
                <button onClick={closeModal} className="close-button"><FaTimes /></button>
                <div className='p-8 bg-white rounded-lg shadow-md w-full max-w-8xl mx-auto'>
                    <h2 className='text-3xl font-bold mb-8'>{isEditMode ? 'Edit Room' : 'Add Room'}</h2>
                    <form className='grid grid-cols-2 gap-8'>
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-lg text-gray-700 mb-2'>Room Name</label>
                                <input 
                                    type='text' 
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    className='w-full p-4 border rounded-lg'
                                />
                            </div>
                            <div>
                                <label className='block text-lg text-gray-700 mb-2'>Room Description</label>
                                <textarea 
                                    value={roomDescription}
                                    onChange={(e) => setRoomDescription(e.target.value)}
                                    className='w-full p-4 border rounded-lg'
                                />
                            </div>
                            <div>
                                <label className='block text-lg text-gray-700 mb-2'>Number of Seats</label>
                                <input 
                                    type='number' 
                                    value={roomSeats}
                                    onChange={(e) => setRoomSeats(e.target.value)}
                                    className='w-full p-4 border rounded-lg'
                                />
                            </div>
                            <div>
                                <label className='block text-lg text-gray-700 mb-2'>Schedule</label>
                                {schedule.map((slot, index) => (
                                    <div key={index} className='mb-4'>
                                        <div className='flex mb-2'>
                                            <select 
                                                value={slot.startTime}
                                                onChange={(e) => {
                                                    handleScheduleChange(index, 'startTime', e.target.value);
                                                    const newShowEndTime = [...showEndTime];
                                                    newShowEndTime[index] = true;
                                                    setShowEndTime(newShowEndTime);
                                                }}
                                                className='w-full border rounded p-2 mr-2'
                                            >
                                                <option value=''>Start Time</option>
                                                {timeSlots.map(time => (
                                                    <option key={time} value={time}>{convertTo12Hour(time)}</option>
                                                ))}
                                            </select>
                                            {showEndTime[index] && (
                                                <select 
                                                    value={slot.endTime}
                                                    onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                                                    className='w-full border rounded p-2 ml-2'
                                                >
                                                    <option value=''>End Time</option>
                                                    {timeSlots
                                                        .filter(time => time > slot.startTime)
                                                        .map(time => (
                                                            <option key={time} value={time}>{convertTo12Hour(time)}</option>
                                                        ))}
                                                </select>
                                            )}
                                        </div>
                                        <div className='flex'>
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                <label key={day} className='mr-4'>
                                                    <input 
                                                        type='checkbox' 
                                                        checked={slot.days ? slot.days.includes(day) : false}
                                                        onChange={() => handleDaysChange(index, day)}
                                                        className='mr-2'
                                                    />
                                                    {day}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addScheduleField} className='bg-gray-500 text-white py-2 px-4 rounded'>Add More Schedule</button>
                            </div>
                            <div>
                                <label className='block text-lg text-gray-700 mb-2'>Amenities</label>
                                <div className='flex items-center mb-2'>
                                    <input 
                                        type='checkbox'
                                        name='projector'
                                        checked={amenities.projector}
                                        onChange={handleAmenitiesChange}
                                        className='mr-2'
                                    />
                                    <label>Projector</label>
                                </div>
                                <div className='flex items-center mb-2'>
                                    <input 
                                        type='checkbox'
                                        name='whiteboard'
                                        checked={amenities.whiteboard}
                                        onChange={handleAmenitiesChange}
                                        className='mr-2'
                                    />
                                    <label>Whiteboard</label>
                                </div>
                                <div className='flex items-center mb-2'>
                                    <input 
                                        type='checkbox'
                                        name='tv'
                                        checked={amenities.tv}
                                        onChange={handleAmenitiesChange}
                                        className='mr-2'
                                    />
                                    <label>TV</label>
                                </div>
                            </div>
                        </div>
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-lg text-gray-700 mb-2'>Room Image</label>
                                <div className='relative border-2 border-dashed border-gray-300 p-6 w-full h-64 flex items-center justify-center'>
                                    <input
                                        type='file'
                                        onChange={handleImageChange}
                                        className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                                    />
                                    {roomImage ? (
                                        <div className='relative w-full h-full'>
                                            <button
                                                type='button'
                                                onClick={() => setRoomImage(null)}
                                                className='absolute top-2 right-2 text-red-500 hover:text-red-700'
                                                style={{ fontSize: '32px' }}
                                            >
                                                &times;
                                            </button>
                                            <img
                                                src={URL.createObjectURL(roomImage)}
                                                alt='Room'
                                                className='w-full h-full object-contain'
                                            />
                                        </div>
                                    ) : (
                                        <div className='text-center pointer-events-none'>
                                            <svg xmlns='http://www.w3.org/2000/svg' className='h-16 w-16 text-gray-400 mx-auto' viewBox='0 0 20 20' fill='currentColor'>
                                                <path fillRule='evenodd' d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 4a3 3 0 100 6 3 3 0 000-6zM5 7a5 5 0 100 10 5 5 0 000-10zm10.707 4.293a1 1 0 00-1.414 0L12 13.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l3-3a 1 1 0 000-1.414z' clipRule='evenodd' />
                                            </svg>
                                            <span className='text-gray-500 mt-2'>Upload room image</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className='mt-8'>
                        <button onClick={handleAddOrUpdateRoom} className='bg-black text-white py-2 px-4 rounded'>{isEditMode ? 'Update Room' : 'Add Room'}</button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={isDeleteModalOpen} onRequestClose={closeDeleteModal} className="modal" overlayClassName="overlay">
                <button onClick={closeDeleteModal} className="close-button"><FaTimes /></button>
                <div className='p-4 bg-white rounded-lg shadow-md'>
                    <h2 className='text-2xl font-bold mb-4'>Delete Room</h2>
                    <p className='mb-4'>Deleting this room can lead to the cancellation of all the appointments related to this room.</p>
                    <button onClick={confirmDeleteRoom} className='bg-customRed text-white py-2 px-4 rounded'>Delete Room</button>
                </div>
            </Modal>
        </div>
    );
}
