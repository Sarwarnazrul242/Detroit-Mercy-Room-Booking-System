import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa'; // Import the arrow icon

export default function ManageBuildings() {
    const [buildings, setBuildings] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                const res = await axios.get('http://localhost:8000/getBuildings');
                setBuildings(res.data);
            } catch (e) {
                toast.error("Something went wrong while fetching buildings!");
            }
        };

        fetchBuildings();
    }, []);

    const handleBuildingClick = (id) => {
        navigate(`/manageRooms/${id}`);
    };

    const handleEditClick = (id) => {
        navigate(`/editBuilding/${id}`);
    };

    const handleAddRoomClick = (id) => {
        navigate(`/manageRooms/${id}`);
    };

    return (
        <div className='relative min-h-screen bg-white flex flex-col items-center'>
            <button
                onClick={() => navigate('/login')}
                className='absolute top-4 left-4 bg-black text-white py-2 px-4 rounded flex items-center'
            >
                <FaArrowLeft className='mr-2' /> {/* Add the arrow icon */}
                Back to Admin Page
            </button>
            <h1 className='text-4xl font-bold my-8'>Manage Buildings</h1>
            <Link to='/AddBuilding' className='bg-black text-white py-2 px-4 rounded mb-6'>Add a building</Link>
            <div className='flex flex-wrap justify-center'>
                {buildings.map(building => (
                    <div 
                        key={building._id} 
                        className='relative border p-4 m-4 rounded-lg bg-white shadow-lg w-80 cursor-pointer'
                    >
                        {building.image && (
                            <img 
                                src={`http://localhost:8000/${building.image}`} 
                                alt={building.name} 
                                className='w-full h-48 object-contain rounded-t-lg' // Use object-contain here
                                onClick={() => handleBuildingClick(building._id)}
                            />
                        )}
                        <div className='p-4'>
                            <h2 className='text-2xl font-bold mb-2'>{building.name}</h2>
                            <div className='flex justify-between'>
                                <button 
                                    onClick={() => handleAddRoomClick(building._id)} 
                                    className='bg-black text-white py-2 px-4 rounded'
                                >
                                    Add Room
                                </button>
                                <button 
                                    onClick={() => handleEditClick(building._id)} 
                                    className='bg-gray-500 text-white py-2 px-4 rounded'
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <ToastContainer />
        </div>
    );
}
