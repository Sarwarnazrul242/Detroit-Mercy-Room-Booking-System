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
                const activeBuildings = res.data.filter(building => !building.isPaused); // Filter out paused buildings
                setBuildings(activeBuildings);
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
                        </div>
                    </div>
                ))}
            </div>
            <Link to='/login' className='text-blue-700 underline mt-4'>Back to My Account</Link>
            <ToastContainer />
        </div>
    );
}
