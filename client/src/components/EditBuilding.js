import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

export default function EditBuilding() {
    const { id } = useParams();
    const [building, setBuilding] = useState({
        name: '',
        description: '',
        floors: 1,
        basement: false,
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBuilding = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/getBuilding/${id}`);
                const data = res.data;
                setBuilding({
                    name: data.name,
                    description: data.description,
                    floors: data.floors,
                    basement: data.basement,
                    image: data.image
                });
                setImagePreview(`http://localhost:8000/${data.image}`);
            } catch (e) {
                toast.error("Something went wrong while fetching building data!");
            }
        };

        fetchBuilding();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setBuilding({
            ...building,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setBuilding({ ...building, image: file });
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', building.name);
        formData.append('description', building.description);
        formData.append('floors', building.floors);
        formData.append('basement', building.basement);
        if (building.image && typeof building.image !== 'string') {
            formData.append('image', building.image);
        } else if (building.image && typeof building.image === 'string') {
            formData.append('existingImage', building.image);
        }

        try {
            const res = await axios.post(`http://localhost:8000/editBuilding/${id}`, formData);
            if (res.data === 'success') {
                toast.success('Building updated successfully');
                navigate('/ManageBuildings');
            } else {
                toast.error('Failed to update building');
            }
        } catch (err) {
            toast.error('An error occurred');
        }
    };

    const handleDelete = async () => {
        try {
            const res = await axios.delete(`http://localhost:8000/deleteBuilding/${id}`);
            if (res.data === 'success') {
                toast.success('Building deleted successfully');
                navigate('/ManageBuildings');
            } else {
                toast.error('Failed to delete building');
            }
        } catch (err) {
            toast.error('An error occurred');
        }
    };

    return (
        <div className="relative min-h-screen bg-white p-8">
            <Link to="/ManageBuildings" className="mb-4 text-blue-500 hover:underline">Return to manage buildings</Link>
            <h1 className="text-3xl font-bold mb-8">Edit Building</h1>
            <form onSubmit={handleSubmit} className={`grid grid-cols-2 gap-8 space-y-8 ${showDeletePopup ? 'blur-background' : ''}`}>
                <div className="space-y-8">
                    <div>
                        <label className="block text-lg text-gray-700 mb-2">Building Name</label>
                        <input
                            type="text"
                            name="name"
                            value={building.name}
                            onChange={handleInputChange}
                            className="w-full p-4 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-lg text-gray-700 mb-2">Building Description</label>
                        <textarea
                            name="description"
                            value={building.description}
                            onChange={handleInputChange}
                            className="w-full p-4 border rounded-lg"
                            required
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <div>
                            <label className="block text-lg text-gray-700 mb-2">Number of Floors</label>
                            <input
                                type="number"
                                name="floors"
                                value={building.floors}
                                onChange={handleInputChange}
                                className="w-24 p-4 border rounded-lg"
                                min="1"
                                required
                            />
                        </div>
                        <div className="flex items-center mt-6">
                            <input
                                type="checkbox"
                                name="basement"
                                checked={building.basement}
                                onChange={handleInputChange}
                                className="mr-2"
                            />
                            <label className="text-lg text-gray-700">Has Basement?</label>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <button type="submit" className="bg-black text-white py-2 px-6 rounded-lg">Update Building</button>
                        <button type="button" onClick={() => navigate('/ManageBuildings')} className="bg-gray-500 text-white py-2 px-6 rounded-lg">Cancel</button>
                    </div>
                </div>
                <div className="space-y-8">
                    <div>
                        <label className="block text-lg text-gray-700 mb-2">Upload Building Image</label>
                        <div className="relative border-2 border-dashed border-gray-300 p-6 w-full h-64 flex items-center justify-center">
                            <input
                                type="file"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {imagePreview ? (
                                <div className="relative w-full h-full">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setBuilding({ ...building, image: null });
                                            setImagePreview(null);
                                        }}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                        style={{ fontSize: '32px' }}
                                    >
                                        &times;
                                    </button>
                                    <img
                                        src={imagePreview}
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
                </div>
            </form>
            <button
                onClick={() => setShowDeletePopup(true)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
            >
                Delete Building
            </button>
            {showDeletePopup && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-10"></div>
                    <div className="fixed inset-0 flex items-center justify-center z-20">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg relative z-30">
                            <button
                                onClick={() => setShowDeletePopup(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                            <h2 className="text-xl font-bold mb-4">Are you sure you want to delete this building?</h2>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleDelete}
                                    className="bg-red-500 text-white py-2 px-6 rounded-lg mr-4"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setShowDeletePopup(false)}
                                    className="bg-gray-500 text-white py-2 px-6 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
            <ToastContainer />
        </div>
    );
}
