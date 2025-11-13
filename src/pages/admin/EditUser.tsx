import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const EditUser: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { fetchUsers } = useAuth();
    const [loading, setLoading] = useState(false);

    const user = location.state?.user;
    if (!user) {
        navigate('/admin/users');
        return null;
    }

    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            const userRef = doc(db, 'users', user.email);

            await updateDoc(userRef, {
                name: formData.name,
                role: formData.role,
                department: formData.department || null
            });

            await fetchUsers();
            toast.success('User updated successfully');
            navigate('/admin/users');
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar role="admin" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Edit User" />

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/users')}
                        className="flex items-center text-[#4B0082] hover:text-[#6B238E] mb-4 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Users
                    </button>

                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                            <h2 className="text-xl md:text-2xl font-semibold text-[#4B0082] mb-6">Edit User Details</h2>

                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="form-input mt-1 block w-full"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            className="form-input mt-1 block w-full bg-gray-50"
                                            disabled
                                        />
                                        <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                            className="form-select mt-1 block w-full"
                                            required
                                            disabled={loading}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="faculty">Faculty</option>
                                            <option value="security">Security</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Department</label>
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                                            className="form-input mt-1 block w-full"
                                            placeholder="Enter department"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/users')}
                                        className="btn btn-secondary"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EditUser; 