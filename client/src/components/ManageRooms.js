import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Modal from 'react-modal';
import { FaTimes, FaArrowLeft } from 'react-icons/fa';
import './RoomStyle.css';

Modal.setAppElement('#root');

function convertTo12Hour(time) {
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
    const navigate = useNavigate();
    const [roomImage, setRoomImage] = useState(null);
    const [amenities, setAmenities] = useState({
        projector: false,
        whiteboard: false,
        tv: false
    });
    const [schedule, setSchedule] = useState([{ startTime: '', endTime: '' }]);

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
        setSchedule(room ? room.schedule : [{ startTime: '', endTime: '' }]);
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
        setSchedule([{ startTime: '', endTime: '' }]);
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
            formData.append('schedule', JSON.stringify(schedule));
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
        newSchedule[index][field] = value;
        setSchedule(newSchedule);
    };

    const addScheduleField = () => {
        setSchedule([...schedule, { startTime: '', endTime: '' }]);
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

    return (
        <div className={`min-h-screen bg-white flex flex-col items-center ${isModalOpen || isDeleteModalOpen ? 'blur-background' : ''}`}>
            <div className='flex items-center justify-start w-full px-8 py-4'>
                <button onClick={() => navigate('/manageBuildings')} className='flex items-center bg-black text-white py-2 px-4 rounded'>
                    <FaArrowLeft className='inline-block mr-2' />
                    Back to Manage Buildings
                </button>
            </div>
            <h1 className='text-4xl font-bold my-8'>Manage Rooms for {building?.name}</h1>
            <button onClick={() => openModal()} className='bg-black text-white py-2 px-4 rounded mb-4'>Add Room</button>
            <div className='flex flex-wrap justify-center'>
                {rooms.map(room => (
                    <div key={room._id} className='border p-4 m-4 rounded-lg bg-white shadow-lg w-80'>
                        {room.image && (
                            <img 
                                src={`http://localhost:8000/uploads/${room.image}`} 
                                alt={room.name} 
                                className='w-full h-48 object-contain rounded-t-lg'
                            />
                        )}
                        <div className='p-4'>
                            <h2 className='text-2xl font-bold mb-2'>{room.name}</h2>
                            <p className='text-gray-700 mb-2'>{room.description}</p>
                            <p className='text-gray-700 mb-2'>Seats: {room.seats}</p>
                            <p className='text-gray-700 mb-4'>
                                {room.schedule.map((slot, index) => (
                                    <span key={index}>
                                        {convertTo12Hour(slot.startTime)} - {convertTo12Hour(slot.endTime)}<br />
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
                                <button onClick={() => openDeleteModal(room)} className='bg-red-500 text-white py-2 px-4 rounded'>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <ToastContainer />
            <Modal isOpen={isModalOpen} onRequestClose={closeModal} className="modal" overlayClassName="overlay">
                <button onClick={closeModal} className="close-button"><FaTimes /></button>
                <div className='p-4 bg-white rounded-lg shadow-md'>
                    <h2 className='text-2xl font-bold mb-4'>{isEditMode ? 'Edit Room' : 'Add Room'}</h2>
                    <div className='mb-4'>
                        <label className='block text-gray-700 font-bold mb-2'>Room Name</label>
                        <input 
                            type='text' 
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className='w-full border rounded p-2'
                        />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 font-bold mb-2'>Room Description</label>
                        <textarea 
                            value={roomDescription}
                            onChange={(e) => setRoomDescription(e.target.value)}
                            className='w-full border rounded p-2'
                        />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 font-bold mb-2'>Number of Seats</label>
                        <input 
                            type='number' 
                            value={roomSeats}
                            onChange={(e) => setRoomSeats(e.target.value)}
                            className='w-full border rounded p-2'
                        />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 font-bold mb-2'>Schedule</label>
                        {schedule.map((slot, index) => (
                            <div key={index} className='flex mb-2'>
                                <input 
                                    type='time' 
                                    value={slot.startTime}
                                    onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                                    className='w-full border rounded p-2 mr-2'
                                />
                                <input 
                                    type='time' 
                                    value={slot.endTime}
                                    onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                                    className='w-full border rounded p-2 ml-2'
                                />
                            </div>
                        ))}
                        <button onClick={addScheduleField} className='bg-gray-500 text-white py-2 px-4 rounded'>Add More Schedule</button>
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 font-bold mb-2'>Amenities</label>
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
                    <div className='mb-4'>
                        <label className='block text-gray-700 font-bold mb-2'>Room Image</label>
                        <input 
                            type='file'
                            onChange={handleImageChange}
                            className='w-full'
                        />
                    </div>
                    <button onClick={handleAddOrUpdateRoom} className='bg-black text-white py-2 px-4 rounded'>{isEditMode ? 'Update Room' : 'Add Room'}</button>
                </div>
            </Modal>
            <Modal isOpen={isDeleteModalOpen} onRequestClose={closeDeleteModal} className="modal" overlayClassName="overlay">
                <button onClick={closeDeleteModal} className="close-button"><FaTimes /></button>
                <div className='p-4 bg-white rounded-lg shadow-md'>
                    <h2 className='text-2xl font-bold mb-4'>Delete Room</h2>
                    <p className='mb-4'>Deleting this room can lead to the cancellation of all the appointments related to this room.</p>
                    <button onClick={confirmDeleteRoom} className='bg-red-500 text-white py-2 px-4 rounded'>Delete Room</button>
                </div>
            </Modal>
        </div>
    );
}
