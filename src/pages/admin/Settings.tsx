import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import { ArrowLeft, Save, Building, Mail, Bell, Shield, Database } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');

    const [settings, setSettings] = useState({
        instituteName: 'MIT ADT University',
        emailDomain: '@mituniversity.edu.in',
        allowAutoApproval: false,
        requireAdminApproval: true,
        retentionPeriod: 90,
        emailNotifications: true,
        pushNotifications: true,
        defaultDepartments: [
            'Computer Science',
            'Information Technology',
            'Electronics',
            'Mechanical',
            'Civil',
            'Electrical',
            'Chemical'
        ].join('\n')
    });

    const handleSave = () => {
        toast.success('Settings saved successfully');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar role="admin" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Settings" />

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="flex items-center text-[#4B0082] hover:text-[#6B238E] mb-4 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Dashboard
                    </button>

                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="border-b border-gray-200 overflow-x-auto">
                            <nav className="flex -mb-px min-w-max">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('general')}
                                    className={`py-4 px-4 md:px-6 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap ${activeTab === 'general'
                                        ? 'border-[#4B0082] text-[#4B0082]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Building size={16} className="inline-block mr-2" />
                                    General
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('notifications')}
                                    className={`py-4 px-4 md:px-6 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap ${activeTab === 'notifications'
                                        ? 'border-[#4B0082] text-[#4B0082]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Bell size={16} className="inline-block mr-2" />
                                    Notifications
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('security')}
                                    className={`py-4 px-4 md:px-6 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap ${activeTab === 'security'
                                        ? 'border-[#4B0082] text-[#4B0082]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Shield size={16} className="inline-block mr-2" />
                                    Security
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('data')}
                                    className={`py-4 px-4 md:px-6 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap ${activeTab === 'data'
                                        ? 'border-[#4B0082] text-[#4B0082]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Database size={16} className="inline-block mr-2" />
                                    Data Management
                                </button>
                            </nav>
                        </div>

                        <div className="p-4 md:p-6">
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Institution Name
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.instituteName}
                                            onChange={(e) => setSettings({ ...settings, instituteName: e.target.value })}
                                            className="form-input mt-1 block w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email Domain
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.emailDomain}
                                            onChange={(e) => setSettings({ ...settings, emailDomain: e.target.value })}
                                            className="form-input mt-1 block w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Departments (one per line)
                                        </label>
                                        <textarea
                                            value={settings.defaultDepartments}
                                            onChange={(e) => setSettings({ ...settings, defaultDepartments: e.target.value })}
                                            rows={5}
                                            className="form-textarea mt-1 block w-full"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="emailNotifications"
                                            checked={settings.emailNotifications}
                                            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                            className="form-checkbox"
                                        />
                                        <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                                            Enable Email Notifications
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="pushNotifications"
                                            checked={settings.pushNotifications}
                                            onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                                            className="form-checkbox"
                                        />
                                        <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-900">
                                            Enable Push Notifications
                                        </label>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="allowAutoApproval"
                                            checked={settings.allowAutoApproval}
                                            onChange={(e) => setSettings({ ...settings, allowAutoApproval: e.target.checked })}
                                            className="form-checkbox"
                                        />
                                        <label htmlFor="allowAutoApproval" className="ml-2 block text-sm text-gray-900">
                                            Allow Automatic Approvals
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="requireAdminApproval"
                                            checked={settings.requireAdminApproval}
                                            onChange={(e) => setSettings({ ...settings, requireAdminApproval: e.target.checked })}
                                            className="form-checkbox"
                                        />
                                        <label htmlFor="requireAdminApproval" className="ml-2 block text-sm text-gray-900">
                                            Require Admin Approval
                                        </label>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'data' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Data Retention Period (days)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.retentionPeriod}
                                            onChange={(e) => setSettings({ ...settings, retentionPeriod: parseInt(e.target.value) })}
                                            className="form-input mt-1 block w-full"
                                        />
                                    </div>

                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                        <div className="flex">
                                            <div className="ml-3">
                                                <p className="text-sm text-yellow-700">
                                                    Warning: Reducing the retention period may result in permanent data loss.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="btn btn-primary flex items-center"
                                >
                                    <Save size={16} className="mr-2" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Settings; 