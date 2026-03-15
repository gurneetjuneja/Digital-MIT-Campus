import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import { useVCRS } from '../../contexts/VCRSContext';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, PlusCircle, QrCode, CheckCircle, XCircle, Clock, Download, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const VCRSDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { budgetApprovals, getBudgetApprovalsByFaculty, getFacultyBudget, ensureFacultyBudget, loading } = useVCRS();
  const navigate = useNavigate();
  
  const [myApprovals, setMyApprovals] = useState<any[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [facultyBudget, setFacultyBudget] = useState<any>(null);
  
  useEffect(() => {
    if (!loading && currentUser && currentUser.role === 'faculty') {
      ensureFacultyBudget(
        currentUser.id,
        currentUser.name,
        currentUser.department || 'General'
      );
      
      const approvals = getBudgetApprovalsByFaculty(currentUser.id);
      setMyApprovals(approvals);
      
      const budget = getFacultyBudget(currentUser.id);
      setFacultyBudget(budget);
    }
  }, [budgetApprovals, currentUser, getBudgetApprovalsByFaculty, getFacultyBudget, ensureFacultyBudget, loading]);

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

  const getCurrentStageName = (approval: any) => {
    if (approval.status === 'approved') return 'Completed';
    if (approval.status === 'rejected') return 'Rejected';
    
    const stageNames: any = {
      'dean': 'Dean Approval',
      'viceChancellor': 'Vice Chancellor Approval',
      'chancellor': 'Chancellor Approval',
      'completed': 'Completed'
    };
    return stageNames[approval.currentStage] || 'Pending';
  };

  const handleViewQR = (approval: any) => {
    if (!approval.qrCode) {
      toast.error('QR code not available yet. Budget approval must be fully approved first.');
      return;
    }
    setSelectedApproval(approval);
    setShowQRModal(true);
  };

  const handleDownloadQR = () => {
    if (!selectedApproval) return;
    
    const canvas = document.createElement('canvas');
    const qrElement = document.getElementById('qr-code-svg');
    if (qrElement) {
      const svgData = new XMLSerializer().serializeToString(qrElement);
      const canvasImg = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      canvasImg.onload = () => {
        canvas.width = canvasImg.width;
        canvas.height = canvasImg.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvasImg, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.download = `QR-${selectedApproval.budgetId}.png`;
              link.href = URL.createObjectURL(blob);
              link.click();
              toast.success('QR code downloaded');
            }
          });
        }
        URL.revokeObjectURL(url);
      };
      canvasImg.src = url;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="faculty" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Voucher and Claim Reimbursement System" />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 text-[#4B0082] animate-spin" />
              <p className="mt-2 text-[#6B238E]">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="faculty" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Voucher and Claim Reimbursement System" />
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-[#4B0082]">Voucher and Claim Reimbursement System</h2>
              <p className="text-[#6B238E]">Manage your budget approvals and QR codes</p>
            </div>
            
            <button 
              onClick={() => navigate('/faculty/vcrs/submit')}
              className="btn bg-[#4B0082] hover:bg-[#6B238E] text-white flex items-center"
            >
              <PlusCircle size={16} className="mr-2" />
              Submit Budget Approval
            </button>
          </div>

          {facultyBudget && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Allotted Budget</p>
                    <p className="text-2xl font-semibold text-[#4B0082]">
                      ₹{facultyBudget.allottedBudget.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign size={32} className="text-[#4B0082]" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Used Budget</p>
                    <p className="text-2xl font-semibold text-yellow-600">
                      ₹{facultyBudget.usedBudget.toLocaleString()}
                    </p>
                  </div>
                  <FileText size={32} className="text-yellow-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Remaining Budget</p>
                    <p className="text-2xl font-semibold text-green-600">
                      ₹{facultyBudget.remainingBudget.toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle size={32} className="text-green-600" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-semibold text-[#4B0082]">{myApprovals.length}</p>
                </div>
                <FileText size={32} className="text-[#4B0082]" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-yellow-600">
                    {myApprovals.filter(a => a.status === 'pending').length}
                  </p>
                </div>
                <Clock size={32} className="text-yellow-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {myApprovals.filter(a => a.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#4B0082] mb-4">My Budget Approvals</h3>
            
            {myApprovals.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No budget approvals submitted yet</p>
                <button
                  onClick={() => navigate('/faculty/vcrs/submit')}
                  className="btn btn-primary mt-4"
                >
                  Submit Your First Budget Approval
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Budget ID</th>
                      <th>Department</th>
                      <th>Purpose</th>
                      <th>Amount</th>
                      <th>Current Stage</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>QR Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myApprovals.map((approval) => (
                      <tr key={approval.id}>
                        <td className="font-medium">{approval.budgetId}</td>
                        <td>{approval.department}</td>
                        <td>{approval.purpose}</td>
                        <td>₹{approval.budgetAmount.toLocaleString()}</td>
                        <td>
                          <span className="text-sm text-gray-600">{getCurrentStageName(approval)}</span>
                        </td>
                        <td>{getStatusBadge(approval.status)}</td>
                        <td>{format(parseISO(approval.createdAt), 'MMM dd, yyyy')}</td>
                        <td>
                          {approval.qrCode ? (
                            <button
                              onClick={() => handleViewQR(approval)}
                              className="btn btn-outline flex items-center text-xs"
                            >
                              <QrCode size={14} className="mr-1" />
                              View QR
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">Pending Approval</span>
                          )}
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

      {showQRModal && selectedApproval && selectedApproval.qrCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#4B0082]">QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">Budget ID: {selectedApproval.budgetId}</p>
              <div className="flex justify-center p-4 bg-white border-2 border-gray-200 rounded-lg">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={selectedApproval.qrCode}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Scan this QR code at security to initiate gate pass
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleDownloadQR}
                className="btn btn-outline flex items-center flex-1"
              >
                <Download size={16} className="mr-2" />
                Download QR
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="btn btn-primary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VCRSDashboard;
