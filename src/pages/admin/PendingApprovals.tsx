import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import GatePassTable from '../../components/common/GatePassTable';
import { useGatePass } from '../../contexts/GatePassContext';
import { ArrowLeft, Loader2 } from 'lucide-react';

const PendingApprovals: React.FC = () => {
  const navigate = useNavigate();
  const { gatePasses, getGatePassesByCurrentStage, loading } = useGatePass();

  // Get all passes that need admin approval
  const pendingPasses = getGatePassesByCurrentStage('adminApproval') || [];

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="admin" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Pending Approvals" />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-[#4B0082] animate-spin" />
              <p className="mt-2 text-[#6B238E]">Loading approvals...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Pending Approvals" />

        <main className="flex-1 overflow-y-auto p-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center text-[#4B0082] hover:text-[#6B238E] mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </button>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#4B0082] mb-4">
              Pending Gate Passes ({pendingPasses.length})
            </h2>

            {pendingPasses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#6B238E]">No pending gate passes require approval.</p>
              </div>
            ) : (
              <GatePassTable gatePasses={pendingPasses} userRole="admin" />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PendingApprovals; 