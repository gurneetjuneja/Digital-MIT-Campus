import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import { useGatePass } from '../../contexts/GatePassContext';
import { ArrowLeft, CheckCircle, XCircle, Printer, FileText, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { generateGatePassPDF } from '../../utils/pdfGenerator';

const AdminApproveGatePass: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGatePassById, approveAdminGatePass, rejectAdminGatePass, gatePasses } = useGatePass();
  
  const [gatePass, setGatePass] = useState<any>(null);
  const [remarks, setRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  useEffect(() => {
    if (id) {
      const pass = getGatePassById(id);
      if (pass) {
        setGatePass(pass);
      } else {
        toast.error('Gate pass not found');
        navigate('/admin');
      }
    }
  }, [id, gatePasses, getGatePassById, navigate]);
  
  const handleApprove = async () => {
    if (!gatePass) return;
    
    if (!gatePass.items.every(item => item.adminVerified)) {
      toast.error('Please verify all items before approving');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await approveAdminGatePass(gatePass.id, remarks);
      toast.success('Gate pass approved for reimbursement');
      navigate('/admin');
    } catch (error) {
      toast.error('Failed to approve gate pass');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleShowRejectModal = () => {
    setShowRejectModal(true);
  };
  
  const handleReject = async () => {
    if (!gatePass || !rejectReason) return;
    
    setIsLoading(true);
    
    try {
      await rejectAdminGatePass(gatePass.id, rejectReason);
      toast.success('Gate pass rejected');
      navigate('/admin');
    } catch (error) {
      toast.error('Failed to reject gate pass');
    } finally {
      setIsLoading(false);
      setShowRejectModal(false);
    }
  };
  
  if (!gatePass) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Final Approval" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <button 
            type="button"
            onClick={() => navigate('/admin')}
            className="flex items-center text-[#4B0082] hover:text-[#6B238E] mb-4 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-[#4B0082]">{gatePass.passNumber}</h2>
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
                  disabled={isLoading}
                >
                  <Download size={16} className="mr-1" />
                  Download PDF
                </button>
                
                <button
                  onClick={handleShowRejectModal}
                  disabled={isLoading}
                  className="btn btn-danger flex items-center"
                >
                  <XCircle size={16} className="mr-1" />
                  Reject
                </button>
                
                <button
                  onClick={handleApprove}
                  disabled={isLoading || !gatePass.items.every(item => item.adminVerified)}
                  className={`btn flex items-center ${
                    gatePass.items.every(item => item.adminVerified)
                      ? 'btn-primary'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle size={16} className="mr-1" />
                  {isLoading ? 'Processing...' : 'Approve'}
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
                <p className="text-gray-600 text-sm mt-2">
                  Current Stage: <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Admin Approval</span>
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Approval Timeline</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <p className="text-sm">Gate Entry: {gatePass.approvalStages.gateEntry.timestamp ? format(parseISO(gatePass.approvalStages.gateEntry.timestamp), 'MMM dd, HH:mm') : '-'}</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <p className="text-sm">Faculty Approval: {gatePass.approvalStages.facultyApproval.timestamp ? format(parseISO(gatePass.approvalStages.facultyApproval.timestamp), 'MMM dd, HH:mm') : '-'}</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <p className="text-sm">Gate Reapproval: {gatePass.approvalStages.gateReapproval.timestamp ? format(parseISO(gatePass.approvalStages.gateReapproval.timestamp), 'MMM dd, HH:mm') : '-'}</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                    <p className="text-sm">Admin Approval: Pending</p>
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
                      <th>Faculty Remarks</th>
                      <th>Security Verified</th>
                      <th>Admin Verify</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gatePass.items.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td className="font-medium">{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.description}</td>
                        <td>{item.remarks || '-'}</td>
                        <td>
                          {item.isChecked ? (
                            <span className="text-green-500 flex justify-center">
                              <CheckCircle size={16} />
                            </span>
                          ) : (
                            <span className="text-red-500 flex justify-center">
                              <XCircle size={16} />
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              className="form-checkbox"
                              checked={item.adminVerified || false}
                              onChange={() => {
                                const updatedItems = gatePass.items.map(i => 
                                  i.id === item.id ? { ...i, adminVerified: !i.adminVerified } : i
                                );
                                setGatePass({ ...gatePass, items: updatedItems });
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Previous Remarks</h4>
                <div className="space-y-2">
                  {gatePass.approvalStages.facultyApproval.remarks && (
                    <div className="text-sm">
                      <span className="font-medium">Faculty: </span>
                      {gatePass.approvalStages.facultyApproval.remarks}
                    </div>
                  )}
                  {gatePass.approvalStages.gateReapproval.remarks && (
                    <div className="text-sm">
                      <span className="font-medium">Security: </span>
                      {gatePass.approvalStages.gateReapproval.remarks}
                    </div>
                  )}
                  {!gatePass.approvalStages.facultyApproval.remarks && !gatePass.approvalStages.gateReapproval.remarks && (
                    <div className="text-sm italic text-gray-500">No previous remarks</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Reimbursement Approval Remarks</h3>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="form-input h-32"
                placeholder="Add any comments regarding reimbursement approval (optional)"
              />
            </div>
            
            <div className="border-t border-gray-200 pt-4 flex justify-between">
              <button
                onClick={() => navigate('/admin')}
                className="btn btn-outline flex items-center"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleShowRejectModal}
                  disabled={isLoading}
                  className="btn btn-danger flex items-center"
                >
                  <XCircle size={16} className="mr-1" />
                  Reject
                </button>
                
                <button
                  onClick={handleApprove}
                  disabled={isLoading || !gatePass.items.every(item => item.adminVerified)}
                  className={`btn flex items-center ${
                    gatePass.items.every(item => item.adminVerified)
                      ? 'btn-primary'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle size={16} className="mr-1" />
                  {isLoading ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Reimbursement</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this reimbursement:
            </p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="form-input h-32 mb-4"
              placeholder="Reason for rejection"
              required
            />
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              
              <button
                onClick={handleReject}
                disabled={!rejectReason || isLoading}
                className="btn btn-danger"
              >
                {isLoading ? 'Processing...' : 'Reject Reimbursement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApproveGatePass;