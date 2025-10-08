import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import StatsCard from '../../components/common/StatsCard';
import GatePassCard from '../../components/common/GatePassCard';
import GatePassTable from '../../components/common/GatePassTable';
import { useGatePass } from '../../contexts/GatePassContext';
import { useAuth } from '../../contexts/AuthContext';
import { Package, AlertCircle, CheckCircle, Clock, RefreshCw, PlusCircle } from 'lucide-react';

const SecurityDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { gatePasses, getGatePassesByCurrentStage, loading } = useGatePass();
  const navigate = useNavigate();
  
  const [pendingReapproval, setPendingReapproval] = useState([]);
  const [recentPasses, setRecentPasses] = useState([]);
  const [todayPasses, setTodayPasses] = useState(0);
  const [totalPasses, setTotalPasses] = useState(0);
  
  useEffect(() => {
    if (!loading && gatePasses) {
      try {
        // Get passes that need security reapproval
        const reapprovalPasses = getGatePassesByCurrentStage('gateReapproval') || [];
        setPendingReapproval(reapprovalPasses);
        
        // Get recent passes (sorted by creation date)
        const sorted = [...(gatePasses || [])].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5);
        setRecentPasses(sorted);
        
        // Calculate total and today's passes
        setTotalPasses(gatePasses.length);
        const today = new Date().toISOString().split('T')[0];
        const todayCount = gatePasses.filter(pass => 
          pass.createdAt.includes(today)
        ).length;
        setTodayPasses(todayCount);
      } catch (error) {
        console.error('Error processing gate passes:', error);
      }
    }
  }, [gatePasses, getGatePassesByCurrentStage, loading]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="security" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Security Dashboard" />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <RefreshCw className="w-8 h-8 text-[#4B0082] animate-spin" />
              <p className="mt-2 text-[#6B238E]">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="security" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Security Dashboard" />
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-[#4B0082]">Welcome, {currentUser?.name}</h2>
            
            <button 
              onClick={() => navigate('/security/create-pass')}
              className="btn bg-[#4B0082] hover:bg-[#6B238E] text-white flex items-center"
            >
              <PlusCircle size={16} className="mr-2" />
              Create New Gate Pass
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard 
              title="Total Gate Passes" 
              value={totalPasses} 
              icon={<Package size={24} />}
              color="purple"
            />
            <StatsCard 
              title="Today's Passes" 
              value={todayPasses} 
              icon={<Clock size={24} />}
              color="purple"
              trend={{ value: '+3 from yesterday', up: true }}
            />
            <StatsCard 
              title="Pending Reapproval" 
              value={pendingReapproval.length} 
              icon={<RefreshCw size={24} />}
              color="purple"
            />
            <StatsCard 
              title="Needs Attention" 
              value="0" 
              icon={<AlertCircle size={24} />}
              color="purple"
            />
          </div>
          
          {pendingReapproval.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#4B0082] mb-4">
                Pending Reapproval ({pendingReapproval.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingReapproval.map(pass => (
                  <GatePassCard key={pass.id} gatePass={pass} userRole="security" />
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#4B0082]">
                Recent Gate Passes
              </h3>
              <button 
                onClick={() => navigate('/security/history')}
                className="text-[#4B0082] hover:text-[#6B238E] text-sm font-medium"
              >
                View All
              </button>
            </div>
            
            <GatePassTable gatePasses={recentPasses} userRole="security" />
          </div>
          
          <div className="bg-[#E5D1F2]/20 border border-[#4B0082]/20 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle size={24} className="text-[#4B0082]" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-[#4B0082]">Pro Tip</h3>
                <div className="mt-1 text-sm text-[#6B238E]">
                  <p>
                    You can quickly create a new gate pass by clicking the "Create New Gate Pass" button in the top right corner.
                    Make sure to verify all items carefully before submitting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SecurityDashboard;