import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import { useGatePass } from '../../contexts/GatePassContext';
import { useAuth } from '../../contexts/AuthContext';
import { PlusCircle, Trash2, ArrowLeft, Save, Printer, Download } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { generateGatePassPDF } from '../../utils/pdfGenerator';

interface ItemState {
  id: string;
  name: string;
  quantity: number;
  description: string;
  isChecked?: boolean;
  remarks?: string;
}

interface CreateGatePassProps {
  isReapproval?: boolean;
}

const CreateGatePass: React.FC<CreateGatePassProps> = ({ isReapproval = false }) => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { 
    getGatePassById, 
    createGatePass, 
    approveSecurityRecheck,
    rejectSecurityRecheck 
  } = useGatePass();
  const navigate = useNavigate();
  
  const [items, setItems] = useState<ItemState[]>([
    { id: uuidv4(), name: '', quantity: 1, description: '' }
  ]);
  const [submitter, setSubmitter] = useState({ name: '', contact: '', purpose: '' });
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Fetch gate pass data if in reapproval mode
  useEffect(() => {
    if (isReapproval && id) {
      const gatePass = getGatePassById(id);
      
      if (gatePass) {
        setItems(gatePass.items);
        setSubmitter(gatePass.submittedBy);
        setDepartment(gatePass.department);
      } else {
        toast.error('Gate pass not found');
        navigate('/security');
      }
    }
  }, [isReapproval, id, getGatePassById, navigate]);
  
  const handleAddItem = () => {
    setItems([...items, { id: uuidv4(), name: '', quantity: 1, description: '' }]);
  };
  
  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      toast.error('At least one item is required');
    }
  };
  
  const handleItemChange = (id: string, field: keyof ItemState, value: string | number | boolean) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (items.some(item => !item.name)) {
      toast.error('All items must have a name');
      return;
    }
    
    if (!submitter.name || !submitter.contact || !submitter.purpose) {
      toast.error('Please fill in all submitter information');
      return;
    }
    
    if (!department) {
      toast.error('Please select a department');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await createGatePass(
        {
          department,
          submittedBy: submitter
        },
        items
      );
      
      toast.success('Gate pass created successfully');
      // Add a small delay before navigation to ensure Firestore update is complete
      setTimeout(() => {
        navigate('/security');
      }, 1000);
    } catch (error) {
      toast.error('Failed to create gate pass');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApproveRecheck = async () => {
    if (!id) return;
    
    setIsLoading(true);
    
    try {
      await approveSecurityRecheck(id);
      toast.success('Items verified successfully');
      // Add a small delay before navigation to ensure Firestore update is complete
      setTimeout(() => {
        navigate('/security');
      }, 1000);
    } catch (error) {
      toast.error('Failed to verify items');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleShowRejectModal = () => {
    setShowRejectModal(true);
  };
  
  const handleRejectRecheck = async () => {
    if (!id || !rejectReason) return;
    
    setIsLoading(true);
    
    try {
      await rejectSecurityRecheck(id, rejectReason);
      toast.success('Gate pass rejected');
      // Add a small delay before navigation to ensure Firestore update is complete
      setTimeout(() => {
        navigate('/security');
      }, 1000);
    } catch (error) {
      toast.error('Failed to reject gate pass');
    } finally {
      setIsLoading(false);
      setShowRejectModal(false);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="security" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={isReapproval ? "Verify Items" : "Create Gate Pass"} />
        
        <main className="flex-1 overflow-y-auto p-4">
          <button 
            onClick={() => navigate('/security')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {isReapproval ? "Verify Faculty-Approved Items" : "Create New Gate Pass"}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Item Details</h3>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Item #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Item Name
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                            className="form-input"
                            placeholder="Item name"
                            required
                            readOnly={isReapproval}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value))}
                            className="form-input"
                            required
                            readOnly={isReapproval}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            className="form-input"
                            placeholder="Item description"
                            readOnly={isReapproval}
                          />
                        </div>
                      </div>
                      
                      {isReapproval && (
                        <div className="mt-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`verify-${item.id}`}
                              checked={!!item.isChecked}
                              onChange={(e) => handleItemChange(item.id, 'isChecked', e.target.checked)}
                              className="form-checkbox"
                            />
                            <label htmlFor={`verify-${item.id}`} className="ml-2 text-sm text-gray-700">
                              Verify item (confirm it matches faculty approval)
                            </label>
                          </div>
                          
                          {item.isChecked && (
                            <div className="mt-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Remarks (optional)
                              </label>
                              <input
                                type="text"
                                value={item.remarks || ''}
                                onChange={(e) => handleItemChange(item.id, 'remarks', e.target.value)}
                                className="form-input"
                                placeholder="Any notes about this item"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {!isReapproval && (
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center text-[#4B0082] hover:text-[#6B238E]"
                    >
                      <PlusCircle size={16} className="mr-1" />
                      Add Another Item
                    </button>
                  )}
                </div>
              </div>
              
              {!isReapproval && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Submitter Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Submitter Name
                        </label>
                        <input
                          type="text"
                          value={submitter.name}
                          onChange={(e) => setSubmitter({ ...submitter, name: e.target.value })}
                          className="form-input"
                          placeholder="Full name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Number
                        </label>
                        <input
                          type="text"
                          value={submitter.contact}
                          onChange={(e) => setSubmitter({ ...submitter, contact: e.target.value })}
                          className="form-input"
                          placeholder="Phone number"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Purpose
                        </label>
                        <input
                          type="text"
                          value={submitter.purpose}
                          onChange={(e) => setSubmitter({ ...submitter, purpose: e.target.value })}
                          className="form-input"
                          placeholder="Purpose of items"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Department Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Department
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
                  </div>
                </>
              )}
              
              <div className="flex justify-between pt-4 border-t border-gray-200">
                {!isReapproval ? (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate('/security')}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="btn btn-outline flex items-center"
                        onClick={async () => {
                            if (!formData) {
                                toast.error('Please fill in the gate pass details first');
                                return;
                            }
                            try {
                                await generateGatePassPDF({
                                    ...formData,
                                    createdAt: new Date().toISOString(),
                                    status: 'pending',
                                    currentStage: 'gateEntry',
                                    approvalStages: {
                                        gateEntry: { status: 'pending', remarks: '' },
                                        facultyApproval: { status: 'not_started', remarks: '' },
                                        gateReapproval: { status: 'not_started', remarks: '' },
                                        adminApproval: { status: 'not_started', remarks: '' }
                                    }
                                });
                                toast.success('PDF generated successfully');
                            } catch (error) {
                                console.error('Error generating PDF:', error);
                                toast.error('Failed to generate PDF');
                            }
                        }}
                      >
                        <Download size={16} className="mr-1" />
                        Download PDF
                      </button>
                      
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary flex items-center"
                      >
                        <Save size={16} className="mr-1" />
                        {isLoading ? 'Saving...' : 'Create Gate Pass'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate('/security')}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleShowRejectModal}
                        disabled={isLoading}
                        className="btn btn-danger flex items-center"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Reject
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleApproveRecheck}
                        disabled={isLoading || !items.every(item => item.isChecked)}
                        className={`btn flex items-center ${
                          items.every(item => item.isChecked)
                            ? 'bg-[#4B0082] hover:bg-[#6B238E] text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Save size={16} className="mr-1" />
                        {isLoading ? 'Processing...' : 'Verify Items'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </form>
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
                onClick={handleRejectRecheck}
                disabled={!rejectReason}
                className="btn btn-danger"
              >
                Reject Gate Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGatePass;