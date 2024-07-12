import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

export default function AddBuilding() {
    const [buildingName, setBuildingName] = useState('');
    const [buildingDescription, setBuildingDescription] = useState('');
    const [floors, setFloors] = useState(1);
    const [basement, setBasement] = useState(false);
    const [image, setImage] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', buildingName);
        formData.append('description', buildingDescription);
        formData.append('floors', floors);
        formData.append('basement', basement);
        formData.append('image', image);

        try {
            const res = await axios.post('http://localhost:8000/addBuilding', formData);
            if (res.data === 'success') {
                toast.success('Building added successfully');
                navigate('/ManageBuildings');
            } else {
                toast.error('Failed to add building');
            }
        } catch (err) {
            toast.error('An error occurred');
        }
    };

    const handleReset = () => {
        setBuildingName('');
        setBuildingDescription('');
        setFloors(1);
        setBasement(false);
        setImage(null);
    };

    return (
        <div className="relative min-h-screen bg-gray-100 p-8">
            <Link to="/ManageBuildings" className="mb-4 text-blue-500 hover:underline">Return to manage buildings</Link>
            <h1 className="text-3xl font-bold mb-8">Add a building</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <label className="block text-lg text-gray-700 mb-2">Building Name</label>
                    <input
                        type="text"
                        value={buildingName}
                        onChange={(e) => setBuildingName(e.target.value)}
                        className="w-full p-4 border rounded-lg"
                        required
                    />
                </div>
                <div>
                    <label className="block text-lg text-gray-700 mb-2">Building Description</label>
                    <textarea
                        value={buildingDescription}
                        onChange={(e) => setBuildingDescription(e.target.value)}
                        className="w-full p-4 border rounded-lg"
                        required
                    />
                </div>
                <div>
                    <label className="block text-lg text-gray-700 mb-2">Number of Floors</label>
                    <input
                        type="number"
                        value={floors}
                        onChange={(e) => setFloors(e.target.value)}
                        className="w-full p-4 border rounded-lg"
                        min="1"
                        required
                    />
                </div>
                <div className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        checked={basement}
                        onChange={(e) => setBasement(e.target.checked)}
                        className="mr-2"
                    />
                    <label className="text-lg text-gray-700">Does the building have a basement?</label>
                </div>
                <div>
                    <label className="block text-lg text-gray-700 mb-2">Upload Building Image</label>
                    <div className="relative border-2 border-dashed border-gray-300 p-6 w-full h-64 flex items-center justify-center">
                        <input
                            type="file"
                            onChange={(e) => setImage(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            required
                        />
                        {image ? (
                            <div className="relative w-full h-full">
                                <button
                                    type="button"
                                    onClick={() => setImage(null)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    style={{ fontSize: '32px' }}
                                >
                                    &times;
                                </button>
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt="Building"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="text-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 4a3 3 0 100 6 3 3 0 000-6zM5 7a5 5 0 100 10 5 5 0 000-10zm10.707 4.293a1 1 0 00-1.414 0L12 13.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-500 mt-2">Upload building image</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-between">
                    <button type="submit" className="bg-black text-white py-2 px-6 rounded-lg">Add building</button>
                    <button type="button" onClick={handleReset} className="bg-red-500 text-white py-2 px-6 rounded-lg">Discard changes</button>
                </div>
            </form>
            <ToastContainer />
        </div>
    );
}
