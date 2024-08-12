import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import InputMask from 'react-input-mask';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';

export default function ManageAccount() {
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        oldPassword: '',
        password: '',
        confirmPassword: '',
        email: '',
        status: ''
    });
    const [phoneError, setPhoneError] = useState('');
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const email = Cookies.get('email');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.post("http://localhost:8000/myaccount", { cookieValue: email });
                setFormData({
                    ...formData,
                    name: res.data.name,
                    phoneNumber: res.data.phoneNumber,
                    email: res.data.email,
                    status: res.data.status
                });
            } catch (e) {
                toast.error("Something went wrong!");
            }
        };

        fetchData();
    }, [email]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const handlePhoneChange = (e) => {
        const phoneNumber = e.target.value;
        setFormData({ ...formData, phoneNumber });
        validatePhoneNumber(phoneNumber);
    }

    const validatePhoneNumber = (phoneNumber) => {
        const validPhoneNumber = /^\(\d{3}\)\d{3}-\d{4}$/;
        if (!validPhoneNumber.test(phoneNumber)) {
            setPhoneError('Invalid phone number format.');
        } else {
            setPhoneError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        if (phoneError) {
            toast.error("Please correct the errors before submitting.");
            return;
        }
        try {
            const res = await axios.put("http://localhost:8000/updateAccount", {
                email: formData.email,
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                oldPassword: formData.oldPassword,
                password: formData.password
            });

            if (res.data.success) {
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message);
            }
        } catch (e) {
            toast.error("Something went wrong!");
        }
    }

    const handleDeleteAccount = async () => {
        try {
            const res = await axios.delete("http://localhost:8000/deleteAccount", {
                data: { email: formData.email, password: deletePassword }
            });

            if (res.data.success) {
                toast.success(res.data.message);
                // Redirect to login or home page after account deletion
                Cookies.remove('email');
                window.location.href = '/signup';
            } else {
                toast.error(res.data.message);
            }
        } catch (e) {
            toast.error("Something went wrong!");
        }
    }

    return (
        <div className="container mx-auto p-8">
            <h2 className="text-2xl font-bold mb-4">Manage Account</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                        Phone Number
                    </label>
                    <InputMask
                        mask="(999)999-9999"
                        value={formData.phoneNumber}
                        onChange={handlePhoneChange}
                    >
                        {(inputProps) => (
                            <input
                                {...inputProps}
                                required
                                type="text"
                                id="phoneNumber"
                                name="phoneNumber"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        )}
                    </InputMask>
                    {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="oldPassword">
                        Old Password
                    </label>
                    <input
                        type="password"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        New Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        type="text"
                        name="email"
                        value={formData.email}
                        readOnly
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                        Status
                    </label>
                    <input
                        type="text"
                        name="status"
                        value={formData.status}
                        readOnly
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Update Account
                    </button>
                    <Link
                        to="/login"
                        className="inline-block align-baseline font-bold text-sm text-black hover:text-gray-800"
                    >
                        Cancel
                    </Link>
                </div>
            </form>

            <div className="mt-6">
                <button
                    onClick={() => setDeleteModalIsOpen(true)}
                    className="bg-customRed hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Delete Account
                </button>
            </div>

            <Modal
                isOpen={deleteModalIsOpen}
                onRequestClose={() => setDeleteModalIsOpen(false)}
                contentLabel="Delete Account"
                className="modal"
                overlayClassName="overlay"
            >
                <div className="p-4 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Delete Account</h2>
                    <p className="mb-4">Please enter your password to confirm account deletion:</p>
                    <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                        placeholder="Enter your password"
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handleDeleteAccount}
                            className="bg-customRed hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Confirm Delete
                        </button>
                        <button
                            onClick={() => setDeleteModalIsOpen(false)}
                            className="ml-4 bg-gray-300 text-black py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            <ToastContainer />
        </div>
    );
}
