import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import '../rooms/RoomStyle.css';

Modal.setAppElement('#root');

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [userToSuspend, setUserToSuspend] = useState(null);
    const [suspendReason, setSuspendReason] = useState('');
    const [suspensionReasonToView, setSuspensionReasonToView] = useState('');
    const adminEmail = "nazrulsa@udmercy.edu"; 

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:8000/getUsers');
            const filteredUsers = res.data.filter(user => user.email !== adminEmail);
            setUsers(filteredUsers);
        } catch (e) {
            toast.error("Something went wrong while fetching users!");
        }
    };

    const deleteUser = async () => {
        try {
            await axios.delete(`http://localhost:8000/deleteUser/${userToDelete}`);
            setUsers(users.filter(user => user._id !== userToDelete));
            toast.success("User deleted successfully");
            closeDeleteModal();
        } catch (e) {
            toast.error("Something went wrong while deleting the user!");
        }
    };

    const suspendUser = async () => {
        try {
            await axios.put(`http://localhost:8000/suspendUser/${userToSuspend}`, { isSuspended: true, reason: suspendReason });
            setUsers(users.map(user => user._id === userToSuspend ? { ...user, isSuspended: true, suspensionReason: suspendReason } : user));
            toast.success("User suspended successfully");
            closeSuspendModal();
        } catch (e) {
            toast.error("Something went wrong while suspending the user!");
        }
    };

    const unsuspendUser = async (userId) => {
        try {
            await axios.put(`http://localhost:8000/suspendUser/${userId}`, { isSuspended: false, reason: '' });
            setUsers(users.map(user => user._id === userId ? { ...user, isSuspended: false, suspensionReason: '' } : user));
            toast.success("User unsuspended successfully");
        } catch (e) {
            toast.error("Something went wrong while unsuspending the user!");
        }
    };

    const openDeleteModal = (userId) => {
        setUserToDelete(userId);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const openSuspendModal = (userId) => {
        setUserToSuspend(userId);
        setIsSuspendModalOpen(true);
    };

    const closeSuspendModal = () => {
        setIsSuspendModalOpen(false);
        setUserToSuspend(null);
        setSuspendReason('');
    };

    const openReasonModal = (reason) => {
        setSuspensionReasonToView(reason);
        setIsReasonModalOpen(true);
    };

    const closeReasonModal = () => {
        setIsReasonModalOpen(false);
        setSuspensionReasonToView('');
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen bg-white p-8">
            <h1 className="text-4xl font-bold mb-8">Manage Users</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-left">Name</th>
                            <th className="py-2 px-4 border-b text-left">Email</th>
                            <th className="py-2 px-4 border-b text-left">Status</th>
                            <th className="py-2 px-4 border-b text-left">Phone Number</th>
                            <th className="py-2 px-4 border-b text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td className="py-2 px-4 border-b">{user.name}</td>
                                <td className="py-2 px-4 border-b">{user.email}</td>
                                <td className="py-2 px-4 border-b">{user.status}</td>
                                <td className="py-2 px-4 border-b">{user.phoneNumber}</td>
                                <td className="py-2 px-4 border-b">
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => openDeleteModal(user._id)} 
                                            className="bg-red-500 text-white py-1 px-3 rounded"
                                        >
                                            Delete
                                        </button>
                                        <button 
                                            onClick={() => user.isSuspended ? unsuspendUser(user._id) : openSuspendModal(user._id)} 
                                            className={`py-1 px-3 rounded text-white ${user.isSuspended ? 'bg-green-500' : 'bg-yellow-500'}`}
                                        >
                                            {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                                        </button>
                                        {user.isSuspended && (
                                            <button 
                                                onClick={() => openReasonModal(user.suspensionReason)} 
                                                className="bg-blue-500 text-white py-1 px-3 rounded"
                                            >
                                                View Reason
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onRequestClose={closeDeleteModal}
                contentLabel="Confirm Delete"
                className="modal"
                overlayClassName="overlay"
            >
                <div className="p-4 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Delete User</h2>
                    <p className="mb-4">Are you sure you want to delete this user?</p>
                    <div className="flex justify-end">
                        <button onClick={deleteUser} className="bg-red-500 text-white py-2 px-4 rounded mr-2">Delete</button>
                        <button onClick={closeDeleteModal} className="bg-gray-300 text-black py-2 px-4 rounded">Cancel</button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isSuspendModalOpen}
                onRequestClose={closeSuspendModal}
                contentLabel="Confirm Suspend"
                className="modal"
                overlayClassName="overlay"
            >
                <div className="p-4 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Suspend User</h2>
                    <p className="mb-4">Please provide a reason for suspending this user:</p>
                    <textarea
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        className="w-full p-2 border rounded mb-4"
                        placeholder="Enter reason here..."
                    />
                    <div className="flex justify-end">
                        <button onClick={suspendUser} className="bg-yellow-500 text-white py-2 px-4 rounded mr-2">Suspend</button>
                        <button onClick={closeSuspendModal} className="bg-gray-300 text-black py-2 px-4 rounded">Cancel</button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isReasonModalOpen}
                onRequestClose={closeReasonModal}
                contentLabel="Suspension Reason"
                className="modal"
                overlayClassName="overlay"
            >
                <div className="p-4 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Suspension Reason</h2>
                    <p className="mb-4">{suspensionReasonToView}</p>
                    <div className="flex justify-end">
                        <button onClick={closeReasonModal} className="bg-gray-300 text-black py-2 px-4 rounded">Close</button>
                    </div>
                </div>
            </Modal>

            <ToastContainer />
        </div>
    );
}
