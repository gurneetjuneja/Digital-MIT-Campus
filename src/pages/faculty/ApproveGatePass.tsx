import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import { useGatePass } from '../../contexts/GatePassContext';
import { ArrowLeft, CheckCircle, XCircle, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const ApproveGatePass: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGatePassById, approveFacultyGatePass, rejectFacultyGatePass } = useGatePass();
  
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
        navigate('/faculty');
      }
    }
  }, [id, getGatePassById, navigate]);
  
  const handleApprove = async () => {
    if (!gatePass) return;
    
    // Check if all items are verified
    if (!gatePass.items.every(item => item.isChecked)) {
      toast.error('Please verify all items before approving');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await approveFacultyGatePass(gatePass.id, remarks);
      toast.success('Gate pass approved successfully');
      setTimeout(() => {
        navigate('/faculty');
      }, 1000);
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
      await rejectFacultyGatePass(gatePass.id, rejectReason);
      toast.success('Gate pass rejected');
      setTimeout(() => {
        navigate('/faculty');
      }, 1000);
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
      <Sidebar role="faculty" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Approve Gate Pass" />
        
        <main className="flex-1 overflow-y-auto p-4">
          <button 
            onClick={() => navigate('/faculty')}
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
                  onClick={handleShowRejectModal}
                  disabled={isLoading}
                  className="btn btn-danger flex items-center"
                >
                  <XCircle size={16} className="mr-1" />
                  Reject
                </button>
                
                <button
                  onClick={handleApprove}
                  disabled={isLoading || !gatePass.items.every(item => item.isChecked)}
                  className={`btn flex items-center ${
                    gatePass.items.every(item => item.isChecked)
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
                  Current Stage: <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Faculty Approval</span>
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
                    <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                    <p className="text-sm">Faculty Approval: Pending</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
                    <p className="text-sm">Gate Reapproval: Not started</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
                    <p className="text-sm">Admin Approval: Not started</p>
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
                      <th className="w-20">Verify</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gatePass.items.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td className="font-medium">{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.description}</td>
                        <td>
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              className="form-checkbox"
                              checked={item.isChecked}
                              onChange={() => {
                                // Update local state only
                                const updatedItems = gatePass.items.map(i => 
                                  i.id === item.id ? { ...i, isChecked: !i.isChecked } : i
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
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Approval Remarks</h3>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="form-input h-32"
                placeholder="Add any comments or special instructions regarding this gate pass (optional)"
              />
            </div>
            
            <div className="border-t border-gray-200 pt-4 flex justify-between">
              <button
                onClick={() => navigate('/faculty')}
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
                  disabled={isLoading || !gatePass.items.every(item => item.isChecked)}
                  className={`btn flex items-center ${
                    gatePass.items.every(item => item.isChecked)
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
      
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Gate Pass</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this gate pass:
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
                {isLoading ? 'Processing...' : 'Reject Gate Pass'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveGatePass;