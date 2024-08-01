import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { FaArrowLeft, FaEllipsisV } from 'react-icons/fa'; // Import the three-dot icon

export default function ManageBuildings() {
    const [buildings, setBuildings] = useState([]);
    const [showMenu, setShowMenu] = useState({});
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

    const toggleMenu = (id) => {
        setShowMenu((prevState) => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    const handlePauseClick = async (id, isPaused) => {
        try {
            await axios.put(`http://localhost:8000/pauseBuilding/${id}`, { isPaused: !isPaused });
            setBuildings((prevState) => 
                prevState.map((building) => 
                    building._id === id ? { ...building, isPaused: !isPaused } : building
                )
            );
            setShowMenu((prevState) => ({
                ...prevState,
                [id]: false // Close the menu after pausing/unpausing
            }));
            toast.success(`Building ${isPaused ? 'unpaused' : 'paused'} successfully`);
        } catch (e) {
            toast.error("Something went wrong while pausing/unpausing the building!");
        }
    };
    

    return (
        <div className='relative min-h-screen bg-white flex flex-col items-center'>
            <button
                onClick={() => navigate('/login')}
                className='absolute top-4 left-4 bg-black text-white py-2 px-4 rounded flex items-center'
            >
                <FaArrowLeft className='mr-2' /> 
                Back
            </button>
            <h1 className='text-4xl font-bold my-8'>Manage Buildings</h1>
            <Link to='/AddBuilding' className='bg-black text-white py-2 px-4 rounded mb-6'>Add a building</Link>
            <div className='flex flex-wrap justify-center overflow-auto max-h-[70vh] w-full px-4'>
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
                        <div className='absolute top-2 right-2'>
                            <button onClick={() => toggleMenu(building._id)}>
                                <FaEllipsisV />
                            </button>
                            {showMenu[building._id] && (
                                <div className='absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50'>
                                    <button 
                                        onClick={() => handlePauseClick(building._id, building.isPaused)}
                                        className='block w-full text-left px-4 py-2 text-black font-semibold rounded hover:bg-gray-300'
                                    >
                                        {building.isPaused ? 'Unpause' : 'Pause'}
                                    </button>
                                </div>
                            )}
                        </div>
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
