import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import { useGatePass } from '../../contexts/GatePassContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Download, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { generateGatePassPDF } from '../../utils/pdfGenerator';

const ViewGatePass: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getGatePassById } = useGatePass();
    const { currentUser } = useAuth();
    const [gatePass, setGatePass] = useState<any>(null);

    useEffect(() => {
        if (id) {
            const pass = getGatePassById(id);
            if (pass) {
                setGatePass(pass);
            } else {
                toast.error('Gate pass not found');
                navigate(`/${currentUser?.role}`);
            }
        }
    }, [id, getGatePassById, navigate, currentUser]);

    if (!gatePass) {
        return null;
    }

    const getStatusBadge = (status: 'approved' | 'rejected' | 'pending') => {
        switch (status) {
            case 'approved':
                return <span className="badge badge-success flex items-center"><CheckCircle size={14} className="mr-1" /> Approved</span>;
            case 'rejected':
                return <span className="badge badge-error flex items-center"><XCircle size={14} className="mr-1" /> Rejected</span>;
            case 'pending':
                return <span className="badge badge-warning flex items-center">Pending</span>;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar role={currentUser?.role || 'security'} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="View Gate Pass" />

                <main className="flex-1 overflow-y-auto p-4">
                    <button
                        onClick={() => navigate(`/${currentUser?.role}`)}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Dashboard
                    </button>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">{gatePass.passNumber}</h2>
                                <p className="text-gray-600">
                                    Created on {format(parseISO(gatePass.createdAt), 'MMM dd, yyyy')} by {gatePass.createdBy.name}
                                </p>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={async () => {
                                        try {
                                            await generateGatePassPDF(gatePass);
                                            toast.success('PDF generated successfully');
                                        } catch (error) {
                                            console.error('Error generating PDF:', error);
                                            toast.error('Failed to generate PDF');
                                        }
                                    }}
                                    className="btn btn-outline flex items-center"
                                >
                                    <Download size={16} className="mr-1" />
                                    Download PDF
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">Submitter Information</h3>
                                <p className="font-medium">{gatePass.submittedBy.name}</p>
                                <p className="text-gray-600 text-sm">{gatePass.submittedBy.contact}</p>
                                <p className="text-gray-600 text-sm mt-2">Purpose: {gatePass.submittedBy.purpose}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">Department</h3>
                                <p className="font-medium">{gatePass.department}</p>
                                <p className="text-gray-600 text-sm mt-2">Status: {getStatusBadge(gatePass.status)}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">Approval Timeline</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded-full ${gatePass.approvalStages.gateEntry.status === 'approved' ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
                                        <p className="text-sm">Gate Entry: {gatePass.approvalStages.gateEntry.timestamp ? format(parseISO(gatePass.approvalStages.gateEntry.timestamp), 'MMM dd, HH:mm') : '-'}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded-full ${gatePass.approvalStages.facultyApproval.status === 'approved' ? 'bg-green-500' : gatePass.approvalStages.facultyApproval.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'} mr-2`}></div>
                                        <p className="text-sm">Faculty Approval: {gatePass.approvalStages.facultyApproval.timestamp ? format(parseISO(gatePass.approvalStages.facultyApproval.timestamp), 'MMM dd, HH:mm') : 'Pending'}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded-full ${gatePass.approvalStages.gateReapproval.status === 'approved' ? 'bg-green-500' : gatePass.approvalStages.gateReapproval.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'} mr-2`}></div>
                                        <p className="text-sm">Gate Reapproval: {gatePass.approvalStages.gateReapproval.timestamp ? format(parseISO(gatePass.approvalStages.gateReapproval.timestamp), 'MMM dd, HH:mm') : 'Not started'}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded-full ${gatePass.approvalStages.adminApproval.status === 'approved' ? 'bg-green-500' : gatePass.approvalStages.adminApproval.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'} mr-2`}></div>
                                        <p className="text-sm">Admin Approval: {gatePass.approvalStages.adminApproval.timestamp ? format(parseISO(gatePass.approvalStages.adminApproval.timestamp), 'MMM dd, HH:mm') : 'Not started'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Item Details</h3>
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th className="w-12">No.</th>
                                            <th>Item Name</th>
                                            <th>Quantity</th>
                                            <th>Description</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gatePass.items.map((item: any, index: number) => (
                                            <tr key={item.id}>
                                                <td>{index + 1}</td>
                                                <td className="font-medium">{item.name}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.description}</td>
                                                <td>
                                                    {item.isChecked ? (
                                                        <span className="text-green-500 flex items-center">
                                                            <CheckCircle size={16} className="mr-1" /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">Not verified</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {gatePass.remarks && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">Remarks</h3>
                                <p className="text-gray-700">{gatePass.remarks}</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ViewGatePass; 