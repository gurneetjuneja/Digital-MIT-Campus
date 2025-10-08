import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import StatsCard from '../../components/common/StatsCard';
import GatePassTable from '../../components/common/GatePassTable';
import { useGatePass } from '../../contexts/GatePassContext';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle2, ClipboardList, AlertCircle, FileCheck, Copy, Loader2 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import qrCodeImage from '../../assets/Rickrolling_QR_code.png';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const FacultyDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { gatePasses, getGatePassesByCurrentStage, loading } = useGatePass();
  const navigate = useNavigate();
  
  const [pendingApproval, setPendingApproval] = useState([]);
  const [recentPasses, setRecentPasses] = useState([]);
  const [approvedPasses, setApprovedPasses] = useState(0);
  const [rejectedPasses, setRejectedPasses] = useState(0);
  
  useEffect(() => {
    if (!loading && gatePasses) {
      try {
        // Get passes that need faculty approval
        const approvalPasses = getGatePassesByCurrentStage('facultyApproval') || [];
        setPendingApproval(approvalPasses);
        
        // Get recent passes (sorted by creation date)
        const sorted = [...(gatePasses || [])].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5);
        setRecentPasses(sorted);
        
        // Get approved/rejected counts
        const approved = gatePasses.filter(pass => 
          pass.approvalStages?.facultyApproval?.status === 'approved'
        ).length;
        const rejected = gatePasses.filter(pass => 
          pass.approvalStages?.facultyApproval?.status === 'rejected'
        ).length;
        
        setApprovedPasses(approved);
        setRejectedPasses(rejected);
      } catch (error) {
        console.error('Error processing gate passes:', error);
      }
    }
  }, [gatePasses, getGatePassesByCurrentStage, loading]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="faculty" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Faculty Dashboard" />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-[#4B0082] animate-spin" />
              <p className="mt-2 text-[#6B238E]">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser?.department) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="faculty" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Faculty Dashboard" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-gray-600">Department information not available.</p>
              <p className="text-sm text-gray-500">Please contact your administrator.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Chart data
  const chartData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [pendingApproval.length, approvedPasses, rejectedPasses],
        backgroundColor: ['#F59E0B', '#10B981', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="faculty" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Faculty Dashboard" />
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[#4B0082]">Welcome, {currentUser?.name || 'Faculty Member'}</h2>
            <p className="text-[#6B238E]">Department: {currentUser?.department}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="col-span-1 md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatsCard 
                  title="Pending Approval" 
                  value={pendingApproval.length} 
                  icon={<ClipboardList size={24} />}
                  color="yellow"
                />
                <StatsCard 
                  title="Approved Passes" 
                  value={approvedPasses} 
                  icon={<FileCheck size={24} />}
                  color="green"
                />
                <StatsCard 
                  title="Rejected Passes" 
                  value={rejectedPasses} 
                  icon={<AlertCircle size={24} />}
                  color="red"
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-[#4B0082] mb-4">Approval Statistics</h3>
              <div className="h-64 flex items-center justify-center">
                <Doughnut data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#4B0082]">My Digital Pass</h3>
              <button className="btn btn-outline flex items-center text-xs">
                <Copy size={14} className="mr-1" />
                Copy Pass ID
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between">
              <div className="mb-4 md:mb-0 md:mr-6 w-full md:w-auto">
                <div className="bg-[#4B0082] text-white rounded-lg p-4 max-w-md">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-xl font-bold">Faculty ID</h4>
                      <p className="text-[#E5D1F2]">{currentUser?.department}</p>
                    </div>
                    <div className="text-3xl">
                      <i className="fas fa-id-card"></i>
                    </div>
                  </div>
                  <div className="flex items-center mb-3">
                    <div className="w-16 h-16 rounded-full bg-white text-[#4B0082] flex items-center justify-center mr-3">
                      <span className="font-bold text-xl">{currentUser?.profilePic || currentUser?.name.substring(0, 2)}</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-lg">{currentUser?.name}</h5>
                      <p className="text-[#E5D1F2]">ID: FAC-2023-0042</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-[#E5D1F2] text-sm">
                    <div>
                      <p>Valid From</p>
                      <p className="font-semibold text-white">Jan 1, 2023</p>
                    </div>
                    <div>
                      <p>Valid Until</p>
                      <p className="font-semibold text-white">Dec 31, 2025</p>
                    </div>
                    <div>
                      <p>Access Level</p>
                      <p className="font-semibold text-white">A-2</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white p-2 rounded-lg shadow-sm inline-block">
                  <div className="w-44 h-44 flex items-center justify-center">
                    <img 
                      src={qrCodeImage} 
                      alt="Faculty QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <p className="text-sm text-[#6B238E] mt-2">Scan at entry gates</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#4B0082]">Recent Activity</h3>
              <button 
                onClick={() => navigate('/faculty/history')}
                className="text-[#4B0082] hover:text-[#6B238E] text-sm font-medium"
              >
                View All
              </button>
            </div>
            
            <GatePassTable gatePasses={recentPasses} userRole="faculty" />
          </div>
          
          <div className="bg-[#E5D1F2]/20 border border-[#4B0082]/20 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle2 size={24} className="text-[#4B0082]" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-[#4B0082]">Important Note</h3>
                <div className="mt-1 text-sm text-[#6B238E]">
                  <p>
                    When approving gate passes, make sure to carefully verify all items for reimbursement eligibility.
                    Add detailed remarks for any special considerations.
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

export default FacultyDashboard;