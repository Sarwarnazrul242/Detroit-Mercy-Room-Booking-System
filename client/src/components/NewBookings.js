import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

export default function NewBookings() {
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

    return (
        <div className='min-h-screen bg-white flex flex-col items-center'>
            <h1 className='text-4xl font-bold my-8'>Available Buildings</h1>
            <div className='flex flex-wrap justify-center'>
                {buildings.map(building => (
                    <div 
                        key={building._id} 
                        className='relative border p-4 m-4 rounded-lg bg-white shadow-lg w-80 cursor-pointer'
                        onClick={() => navigate(`/building/${building._id}`)}
                    >
                        {building.image && (
                            <img 
                                src={`http://localhost:8000/${building.image}`} 
                                alt={building.name} 
                                className='w-full h-48 object-contain rounded-t-lg'
                            />
                        )}
                        <div className='p-4'>
                            <h2 className='text-2xl font-bold mb-2'>{building.name}</h2>
                            {/* <p className='text-gray-700 mb-4'>{building.description}</p> */}
                            {/* <h3 className='text-lg font-semibold'>Rooms:</h3> */}
                            <ul className='list-disc list-inside'>
                                {building.rooms.map((room, index) => (
                                    <li key={index} className='mb-2'>
                                        <strong>{room.name}</strong>
                                        <ul className='list-disc list-inside ml-4'>
                                            {room.schedule.map((schedule, sIndex) => (
                                                <li key={sIndex}>
                                                    {schedule.startTime} - {schedule.endTime}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
            <Link to='/login' className='text-blue-700 underline mt-4'>Back to My Account</Link>
            <ToastContainer />
        </div>
    );
}
