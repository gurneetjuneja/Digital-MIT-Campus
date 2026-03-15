import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import { useVCRS } from '../../contexts/VCRSContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Upload, FileText, CheckCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const SubmitBudgetApproval: React.FC = () => {
  const { currentUser } = useAuth();
  const { submitBudgetApproval, getFacultyBudget, ensureFacultyBudget, loading } = useVCRS();
  const navigate = useNavigate();
  
  const [purpose, setPurpose] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [budgetDocument, setBudgetDocument] = useState<File | null>(null);
  const [submittedApproval, setSubmittedApproval] = useState<any>(null);
  
  React.useEffect(() => {
    if (currentUser?.department) {
      setDepartment(currentUser.department);
    }
  }, [currentUser]);
  
  React.useEffect(() => {
    if (currentUser && currentUser.role === 'faculty') {
      ensureFacultyBudget(
        currentUser.id,
        currentUser.name,
        currentUser.department || 'General'
      );
    }
  }, [currentUser, ensureFacultyBudget]);
  
  const facultyBudget = currentUser ? getFacultyBudget(currentUser.id) : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, JPEG, and PNG files are allowed');
        return;
      }
      setBudgetDocument(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!purpose.trim()) {
      toast.error('Please enter the purpose');
      return;
    }
    
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }
    
    if (!department) {
      toast.error('Please select a department');
      return;
    }
    
    if (!budgetDocument) {
      toast.error('Please upload the budget approval document');
      return;
    }

    try {
      const approval = await submitBudgetApproval({
        purpose: purpose.trim(),
        budgetAmount: parseFloat(budgetAmount),
        budgetDocument,
        department: department
      });
      
      setSubmittedApproval(approval);
      toast.success('Budget approval submitted successfully!');
    } catch (error) {
      console.error('Error submitting budget approval:', error);
    }
  };

  if (submittedApproval) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="faculty" />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Budget Approval Submitted" />
          
          <main className="flex-1 overflow-y-auto p-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center mb-6">
                  <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-[#4B0082] mb-2">
                    Budget Approval Submitted Successfully!
                  </h2>
                  <p className="text-gray-600">
                    Your budget approval has been submitted and is now pending approval from:
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Budget ID</p>
                      <p className="font-semibold text-[#4B0082]">{submittedApproval.budgetId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-semibold text-[#4B0082]">{submittedApproval.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-semibold text-[#4B0082]">₹{submittedApproval.budgetAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Purpose</p>
                      <p className="font-semibold text-[#4B0082]">{submittedApproval.purpose}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-800 mb-2">Approval Workflow</h3>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                      <span>1. Dean Approval (Pending)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
                      <span>2. Vice Chancellor Approval (Not Started)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
                      <span>3. Chancellor Approval (Not Started)</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-3">
                    <strong>Note:</strong> QR code will be generated automatically once all approvals are complete.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/faculty/vcrs')}
                  className="btn btn-primary w-full"
                >
                  Go to Voucher and Claim Reimbursement Dashboard
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="faculty" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Submit Budget Approval" />
        
        <main className="flex-1 overflow-y-auto p-4">
          <button 
            onClick={() => navigate('/faculty/vcrs')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Voucher and Claim Reimbursement Dashboard
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Submit Budget Approval
            </h2>

            {facultyBudget && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Info size={20} className="text-green-600 mr-2 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 mb-1">Budget Information</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-green-600">Allotted</p>
                        <p className="font-semibold text-green-800">₹{facultyBudget.allottedBudget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-green-600">Used</p>
                        <p className="font-semibold text-green-800">₹{facultyBudget.usedBudget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-green-600">Remaining</p>
                        <p className="font-semibold text-green-800">₹{facultyBudget.remainingBudget.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">Select department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Administrative">Administrative</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="form-input h-24"
                  placeholder="Describe the purpose of this budget approval"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="form-input"
                  placeholder="Enter budget amount"
                  min="0"
                  step="0.01"
                  max={facultyBudget?.remainingBudget || undefined}
                  required
                />
                {facultyBudget && (
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: ₹{facultyBudget.remainingBudget.toLocaleString()}
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Approval Document <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="budget-document"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="budget-document"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload size={48} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, JPEG, or PNG (Max 10MB)
                    </p>
                  </label>
                </div>
                {budgetDocument && (
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <FileText size={16} className="mr-2" />
                    <span>{budgetDocument.name}</span>
                    <span className="ml-2 text-gray-400">
                      ({(budgetDocument.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> After submission, your budget approval will go through the following approval stages:
                </p>
                <ol className="list-decimal list-inside mt-2 text-sm text-blue-700 space-y-1">
                  <li>Dean Approval</li>
                  <li>Vice Chancellor Approval</li>
                  <li>Chancellor Approval</li>
                </ol>
                <p className="text-xs text-blue-600 mt-3">
                  QR code will be generated automatically once all approvals are complete. You can then use this QR code at security to initiate the gate pass process.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => navigate('/faculty/vcrs')}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Submitting...' : 'Submit Budget Approval'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SubmitBudgetApproval;
