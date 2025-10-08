import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, UserPlus, Search, Edit2, Trash2, Download } from 'lucide-react';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import { format } from 'date-fns';

const Users: React.FC = () => {
    const navigate = useNavigate();
    const { users, fetchUsers, currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users based on search and role
    const filteredUsers = users?.filter(user => {
        const matchesSearch = searchTerm === '' ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.department?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    }) || [];

    const generatePDF = async () => {
        setGenerating(true);

        // Create the HTML content
        const content = `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column;">
                <!-- Header and main content wrapper -->
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div style="display: flex; align-items: center; gap: 20px;">
                            <img src="/mit-adt-logo.png" alt="MIT ADT University Logo" style="height: 80px;" />
                            <h1 style="margin: 0; color: #4B0082; font-size: 28px;">Digital Gate Pass System - Users List</h1>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #666;">Date: ${format(new Date(), 'MMM dd, yyyy')}</div>
                        </div>
                    </div>
                    
                    <!-- Decorative line inspired by MIT ADT's logo -->
                    <div style="height: 4px; background: linear-gradient(to right, 
                        #4B0082 0%, #4B0082 25%, 
                        #FF6B6B 25%, #FF6B6B 50%,
                        #4ECDC4 50%, #4ECDC4 75%,
                        #45B7D1 75%, #45B7D1 100%); 
                        margin-bottom: 20px;"></div>

                    <!-- Users Table -->
                    <div style="margin-bottom: 30px;">
                        <h3 style="color: #4B0082; margin-bottom: 15px;">Registered Users</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #4B0082;">
                                    <th style="padding: 12px; color: white; text-align: left; border: 1px solid #ddd;">Name</th>
                                    <th style="padding: 12px; color: white; text-align: left; border: 1px solid #ddd;">Email</th>
                                    <th style="padding: 12px; color: white; text-align: left; border: 1px solid #ddd;">Role</th>
                                    <th style="padding: 12px; color: white; text-align: left; border: 1px solid #ddd;">Department</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filteredUsers.map((user, index) => `
                                    <tr style="background-color: ${index % 2 === 0 ? '#fff' : '#f8f9fa'}">
                                        <td style="padding: 12px; border: 1px solid #ddd;">${user.name}</td>
                                        <td style="padding: 12px; border: 1px solid #ddd;">${user.email}</td>
                                        <td style="padding: 12px; border: 1px solid #ddd;">
                                            <span style="
                                                padding: 4px 8px;
                                                border-radius: 4px;
                                                font-size: 0.85em;
                                                background-color: ${user.role === 'admin' ? '#E5D1F2' :
                user.role === 'faculty' ? '#F0E6FA' : '#F8F4FC'
            };
                                                color: ${user.role === 'admin' ? '#4B0082' :
                user.role === 'faculty' ? '#6B238E' : '#9B4BC0'
            };"
                                            >
                                                ${user.role}
                                            </span>
                                        </td>
                                        <td style="padding: 12px; border: 1px solid #ddd;">${user.department || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Footer section -->
                <div style="margin-top: auto; padding-top: 40px;">
                    <div style="text-align: center; border-top: 1px solid #ddd; padding-top: 20px;">
                        <p style="color: #666; font-size: 0.9em; margin-bottom: 10px;">This is a computer-generated document. No signature is required.</p>
                        <div style="height: 3px; background: linear-gradient(to right, #4B0082, #6B238E, #9B4BC0, #E5D1F2);"></div>
                    </div>
                </div>
            </div>
        `;

        // PDF options
        const options = {
            margin: 10,
            filename: `users-list-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            // Generate PDF
            const element = document.createElement('div');
            element.innerHTML = content;
            document.body.appendChild(element);

            await html2pdf().set(options).from(element).save();

            document.body.removeChild(element);
            toast.success('PDF generated successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteUser = async (userToDelete: any) => {
        if (!currentUser?.role === 'admin') {
            toast.error('Only administrators can delete users');
            return;
        }

        if (userToDelete.email === currentUser.email) {
            toast.error('You cannot delete your own account');
            return;
        }

        if (window.confirm(`Are you sure you want to delete ${userToDelete.name}?`)) {
            try {
                setLoading(true);
                await deleteDoc(doc(db, 'users', userToDelete.email));
                await fetchUsers(); // Refresh the users list
                toast.success('User deleted successfully');
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditUser = (user: any) => {
        // Navigate to edit user page with user data
        navigate('/admin/edit-user', { state: { user } });
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar role="admin" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="User Management" />

                <main className="flex-1 overflow-y-auto p-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Dashboard
                    </button>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Users</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={generatePDF}
                                    className="btn btn-secondary flex items-center"
                                    disabled={loading || generating}
                                >
                                    <Download size={16} className="mr-2" />
                                    {generating ? 'Generating PDF...' : 'Download PDF'}
                                </button>
                                <button
                                    onClick={() => navigate('/setup')}
                                    className="btn btn-primary flex items-center"
                                    disabled={loading}
                                >
                                    <UserPlus size={16} className="mr-2" />
                                    Add New User
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div className="relative flex-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} className="text-gray-400" />
                                </span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search users..."
                                    className="form-input pl-10 w-full"
                                    disabled={loading}
                                />
                            </div>

                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="form-select"
                                disabled={loading}
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="faculty">Faculty</option>
                                <option value="security">Security</option>
                            </select>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Department</th>
                                        <th>Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.email}>
                                            <td className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-[#4B0082] text-white flex items-center justify-center mr-3">
                                                    <span className="font-semibold text-xs">
                                                        {user.name.substring(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                                {user.name}
                                            </td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`badge ${user.role === 'admin' ? 'badge-error' :
                                                    user.role === 'faculty' ? 'badge-info' :
                                                        'badge-success'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>{user.department || '-'}</td>
                                            <td>
                                                <span className="badge badge-success">Active</span>
                                            </td>
                                            <td className="text-right">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="btn btn-icon btn-ghost"
                                                    disabled={loading}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="btn btn-icon btn-ghost text-red-600"
                                                    disabled={loading || user.email === currentUser?.email}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Users; 