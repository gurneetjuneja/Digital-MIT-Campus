import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import { useVCRS } from '../../contexts/VCRSContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { BudgetApprovalStage } from '../../types';

const BudgetApprovals: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { 
    budgetApprovals, 
    getBudgetApprovalsByStage, 
    approveBudgetStage, 
    rejectBudgetStage,
    initializeFacultyBudget,
    loading 
  } = useVCRS();
  const navigate = useNavigate();
  
  const [selectedStage, setSelectedStage] = useState<BudgetApprovalStage>('dean');
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const initializeBudgets = async () => {
      if (currentUser && currentUser.role === 'admin') {
        if (users && users.length > 0) {
          users.forEach(user => {
            if (user.role === 'faculty') {
              initializeFacultyBudget(
                user.id,
                user.name,
                user.department || 'General',
                50000
              );
            }
          });
        }
      }
    };
    
    initializeBudgets();
  }, [users, currentUser, initializeFacultyBudget]);

  useEffect(() => {
    const approvals = getBudgetApprovalsByStage(selectedStage);
    setPendingApprovals(approvals);
  }, [selectedStage, budgetApprovals, getBudgetApprovalsByStage]);

  const getStageName = (stage: BudgetApprovalStage) => {
    const names: Record<BudgetApprovalStage, string> = {
      'dean': 'Dean',
      'viceChancellor': 'Vice Chancellor',
      'chancellor': 'Chancellor'
    };
    return names[stage];
  };

  const handleApprove = async (approval: any) => {
    if (!window.confirm(`Approve budget approval ${approval.budgetId} as ${getStageName(selectedStage)}?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await approveBudgetStage(approval.id, selectedStage, remarks || undefined);
      setShowDetailsModal(false);
      setSelectedApproval(null);
      setRemarks('');
      toast.success(`Budget approval approved by ${getStageName(selectedStage)} successfully`);
    } catch (error) {
      console.error('Error approving:', error);
      toast.error('Failed to approve budget. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    if (!selectedApproval) return;

    setIsProcessing(true);
    try {
      await rejectBudgetStage(selectedApproval.id, selectedStage, remarks);
      setShowRejectModal(false);
      setShowDetailsModal(false);
      setRemarks('');
      toast.success('Budget approval rejected');
    } catch (error) {
      console.error('Error rejecting:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-success flex items-center"><CheckCircle size={12} className="mr-1" /> Approved</span>;
      case 'rejected':
        return <span className="badge badge-error flex items-center"><XCircle size={12} className="mr-1" /> Rejected</span>;
      case 'pending':
        return <span className="badge badge-warning flex items-center"><Clock size={12} className="mr-1" /> Pending</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Budget Approval Management" />
        
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
            <h2 className="text-xl md:text-2xl font-semibold text-[#4B0082] mb-6">
              Budget Approval Workflow
            </h2>

            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
              {(['dean', 'viceChancellor', 'chancellor'] as BudgetApprovalStage[]).map((stage) => {
                const count = getBudgetApprovalsByStage(stage).filter(app => app.currentStage === stage && app.status === 'pending').length;
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setSelectedStage(stage)}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                      selectedStage === stage
                        ? 'border-[#4B0082] text-[#4B0082]'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {getStageName(stage)} Approval
                    {count > 0 && (
                      <span className="ml-2 bg-[#4B0082] text-white text-xs px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-[#6B238E] text-lg">No pending approvals for {getStageName(selectedStage)}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="border border-gray-200 rounded-lg p-4 md:p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h3 className="font-semibold text-[#4B0082] text-base md:text-lg truncate">{approval.budgetId}</h3>
                          {getStatusBadge(approval.status)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-sm">
                          <div>
                            <p className="text-[#6B238E] text-xs md:text-sm mb-1">Faculty</p>
                            <p className="font-medium text-gray-800 truncate">{approval.facultyName}</p>
                          </div>
                          <div>
                            <p className="text-[#6B238E] text-xs md:text-sm mb-1">Department</p>
                            <p className="font-medium text-gray-800 truncate">{approval.department}</p>
                          </div>
                          <div>
                            <p className="text-[#6B238E] text-xs md:text-sm mb-1">Amount</p>
                            <p className="font-medium text-gray-800">₹{approval.budgetAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[#6B238E] text-xs md:text-sm mb-1">Created</p>
                            <p className="font-medium text-gray-800">{format(parseISO(approval.createdAt), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-[#6B238E] text-xs md:text-sm mb-1">Purpose:</p>
                          <p className="text-sm text-gray-700">{approval.purpose}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 sm:ml-4 flex-shrink-0 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApproval(approval);
                            setShowDetailsModal(true);
                          }}
                          className="btn btn-outline flex items-center justify-center text-xs sm:text-sm px-3 py-2"
                        >
                          <Eye size={14} className="mr-1" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mt-6">
            <h2 className="text-xl md:text-2xl font-semibold text-[#4B0082] mb-4">
              Budget Approval History
            </h2>

            {budgetApprovals.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-[#6B238E] text-lg">No budget approvals yet</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Budget ID</th>
                      <th>Faculty</th>
                      <th>Department</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Current Stage</th>
                      <th>Created</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetApprovals
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((approval) => (
                        <tr key={approval.id}>
                          <td className="font-medium text-[#4B0082]">{approval.budgetId}</td>
                          <td>{approval.facultyName}</td>
                          <td>{approval.department}</td>
                          <td>₹{approval.budgetAmount.toLocaleString()}</td>
                          <td>{getStatusBadge(approval.status)}</td>
                          <td>
                            <span className="text-xs md:text-sm text-gray-600">
                              {approval.currentStage === 'completed' ? 'Completed' : 
                               approval.currentStage === 'dean' ? 'Dean Approval' :
                               approval.currentStage === 'viceChancellor' ? 'Vice Chancellor Approval' :
                               approval.currentStage === 'chancellor' ? 'Chancellor Approval' : 'Pending'}
                            </span>
                          </td>
                          <td className="text-xs md:text-sm">
                            {format(parseISO(approval.createdAt), 'MMM dd, yyyy')}
                          </td>
                          <td className="text-xs md:text-sm">
                            {approval.completedAt 
                              ? format(parseISO(approval.completedAt), 'MMM dd, yyyy')
                              : '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {showDetailsModal && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#4B0082]">
                Budget Approval Details - {selectedApproval.budgetId}
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setRemarks('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs md:text-sm text-[#6B238E] mb-1">Faculty Name</p>
                  <p className="font-medium text-gray-800">{selectedApproval.facultyName}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-[#6B238E] mb-1">Department</p>
                  <p className="font-medium text-gray-800">{selectedApproval.department}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-[#6B238E] mb-1">Budget Amount</p>
                  <p className="font-medium text-gray-800">₹{selectedApproval.budgetAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-[#6B238E] mb-1">Allotted Budget</p>
                  <p className="font-medium text-gray-800">₹{selectedApproval.allottedBudget.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-xs md:text-sm text-[#6B238E] mb-1">Purpose</p>
                <p className="bg-gray-50 p-3 rounded text-sm text-gray-800">{selectedApproval.purpose}</p>
              </div>

              {selectedApproval.budgetDocumentUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Budget Document</p>
                  <a
                    href={selectedApproval.budgetDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline flex items-center text-sm"
                  >
                    <FileText size={16} className="mr-2" />
                    View Document
                  </a>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-2">Approval Remarks (Optional)</p>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="form-input h-24"
                  placeholder="Add any remarks or comments"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowRejectModal(true);
                }}
                disabled={isProcessing}
                className="btn btn-danger flex-1"
              >
                <XCircle size={16} className="mr-2" />
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleApprove(selectedApproval)}
                disabled={isProcessing || !selectedApproval}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={16} className="mr-2" />
                {isProcessing ? 'Processing...' : `Approve as ${getStageName(selectedStage)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Budget Approval</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this budget approval:
            </p>
            
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="form-input h-32 mb-4"
              placeholder="Reason for rejection"
              required
            />
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRemarks('');
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              
              <button
                onClick={handleReject}
                disabled={!remarks.trim() || isProcessing}
                className="btn btn-danger"
              >
                {isProcessing ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetApprovals;

