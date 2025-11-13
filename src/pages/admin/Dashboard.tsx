import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import StatsCard from '../../components/common/StatsCard';
import GatePassCard from '../../components/common/GatePassCard';
import GatePassTable from '../../components/common/GatePassTable';
import { useGatePass } from '../../contexts/GatePassContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  ClipboardList, CheckCircle, AlertCircle, User, Users, Clock, FileText
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { gatePasses, getGatePassesByCurrentStage } = useGatePass();
  const navigate = useNavigate();

  const [pendingFinalApproval, setPendingFinalApproval] = useState([]);
  const [recentGatePasses, setRecentGatePasses] = useState([]);

  const totalPasses = gatePasses.length;
  const pendingPasses = gatePasses.filter(pass => pass.status === 'pending').length;
  const approvedPasses = gatePasses.filter(pass => pass.status === 'approved').length;
  const rejectedPasses = gatePasses.filter(pass => pass.status === 'rejected').length;

  const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Administrative'];
  const departmentCounts = departments.map(dept =>
    gatePasses.filter(pass => pass.department === dept).length
  );

  const stageLabels = ['Gate Entry', 'Faculty Approval', 'Gate Reapproval', 'Admin Approval', 'Completed'];
  const stageCounts = [
    gatePasses.filter(pass => pass.currentStage === 'gateEntry').length,
    gatePasses.filter(pass => pass.currentStage === 'facultyApproval').length,
    gatePasses.filter(pass => pass.currentStage === 'gateReapproval').length,
    gatePasses.filter(pass => pass.currentStage === 'adminApproval').length,
    gatePasses.filter(pass => pass.currentStage === 'completed').length,
  ];

  useEffect(() => {
    const adminApprovalPasses = getGatePassesByCurrentStage('adminApproval');
    setPendingFinalApproval(adminApprovalPasses);

    const sorted = [...gatePasses].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5);
    setRecentGatePasses(sorted);
  }, [gatePasses, getGatePassesByCurrentStage]);

  const statusChartData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [pendingPasses, approvedPasses, rejectedPasses],
        backgroundColor: ['#F59E0B', '#10B981', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };

  const departmentChartData = {
    labels: departments,
    datasets: [
      {
        label: 'Gate Passes by Department',
        data: departmentCounts,
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(139, 92, 246, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const stageChartData = {
    labels: stageLabels,
    datasets: [
      {
        label: 'Gate Passes by Stage',
        data: stageCounts,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Admin Dashboard" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#4B0082] mb-1">
              Welcome, {currentUser?.name || 'Admin'}
            </h2>
            <p className="text-sm md:text-base text-[#6B238E]">System Overview</p>
          </div>

          {pendingFinalApproval.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h3 className="text-lg md:text-xl font-semibold text-[#4B0082]">
                  Pending Final Approval ({pendingFinalApproval.length})
                </h3>
                <button 
                  type="button"
                  onClick={() => navigate('/admin/pending')}
                  className="text-[#4B0082] hover:text-[#6B238E] text-sm font-medium hover:underline transition-colors self-start sm:self-auto"
                >
                  View All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {pendingFinalApproval.slice(0, 3).map(pass => (
                  <GatePassCard key={pass.id} gatePass={pass} userRole="admin" />
                ))}
                {pendingFinalApproval.length > 3 && (
                  <div 
                    className="flex items-center justify-center p-6 border-2 border-dashed border-[#E5D1F2] rounded-lg cursor-pointer hover:border-[#4B0082] transition-colors min-h-[200px]"
                    onClick={() => navigate('/admin/pending')}
                  >
                    <p className="text-[#6B238E] text-center">
                      +{pendingFinalApproval.length - 3} more pending approvals
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-[#4B0082]">Users</h3>
                <button 
                  type="button"
                  onClick={() => navigate('/admin/users')}
                  className="text-[#4B0082] hover:text-[#6B238E] text-xs md:text-sm font-medium hover:underline transition-colors"
                >
                  Manage
                </button>
              </div>
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-[#E5D1F2] text-[#4B0082] mr-4 flex-shrink-0">
                  <Users size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-[#6B238E]">Total Users</p>
                  <p className="text-xl md:text-2xl font-semibold text-[#4B0082]">24</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="text-[#6B238E]">Admins</span>
                  <span className="font-semibold text-[#4B0082]">3</span>
                </div>
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="text-[#6B238E]">Faculty</span>
                  <span className="font-semibold text-[#4B0082]">12</span>
                </div>
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="text-[#6B238E]">Security</span>
                  <span className="font-semibold text-[#4B0082]">9</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-[#4B0082]">Gate Passes</h3>
                <button 
                  type="button"
                  onClick={() => navigate('/admin/reports')}
                  className="text-[#4B0082] hover:text-[#6B238E] text-xs md:text-sm font-medium hover:underline transition-colors"
                >
                  View Reports
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-[#E5D1F2] text-[#4B0082] mr-4 flex-shrink-0">
                    <FileText size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-[#6B238E]">Total Passes</p>
                    <p className="text-xl md:text-2xl font-semibold text-[#4B0082]">{totalPasses}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
                  <div className="text-center p-2 rounded-lg bg-[#E5D1F2]/20">
                    <p className="text-xs md:text-sm text-[#6B238E]">Pending</p>
                    <p className="font-semibold text-[#4B0082] text-sm md:text-base">{pendingPasses}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-[#E5D1F2]/20">
                    <p className="text-xs md:text-sm text-[#6B238E]">Approved</p>
                    <p className="font-semibold text-[#4B0082] text-sm md:text-base">{approvedPasses}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-[#E5D1F2]/20">
                    <p className="text-xs md:text-sm text-[#6B238E]">Rejected</p>
                    <p className="font-semibold text-[#4B0082] text-sm md:text-base">{rejectedPasses}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-[#4B0082]">Pending Approvals</h3>
                <button 
                  type="button"
                  onClick={() => navigate('/admin/pending')}
                  className="text-[#4B0082] hover:text-[#6B238E] text-xs md:text-sm font-medium hover:underline transition-colors"
                >
                  View All
                </button>
              </div>
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-[#E5D1F2] text-[#4B0082] mr-4 flex-shrink-0">
                  <ClipboardList size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-[#6B238E]">Awaiting Final Approval</p>
                  <p className="text-xl md:text-2xl font-semibold text-[#4B0082]">{pendingFinalApproval.length}</p>
                </div>
              </div>
              {pendingFinalApproval.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  {pendingFinalApproval.slice(0, 3).map((pass) => (
                    <div key={pass.id} className="flex items-center justify-between p-2 rounded-lg bg-[#E5D1F2]/10 hover:bg-[#E5D1F2]/20 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#4B0082] text-xs md:text-sm truncate">{pass.passNumber}</p>
                        <p className="text-xs text-[#6B238E] truncate">{pass.department}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => navigate(`/admin/approve/${pass.id}`)}
                        className="text-[#4B0082] hover:text-[#6B238E] text-xs font-medium hover:underline transition-colors ml-2 flex-shrink-0"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-5">
              <h3 className="text-base md:text-lg font-semibold text-[#4B0082] mb-4">Department Distribution</h3>
              <div className="h-64 md:h-72">
                <Bar
                  data={departmentChartData}
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 md:p-5">
              <h3 className="text-base md:text-lg font-semibold text-[#4B0082] mb-4">Stage Distribution</h3>
              <div className="h-64 md:h-72">
                <Bar
                  data={stageChartData}
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <h3 className="text-base md:text-lg font-semibold text-[#4B0082]">Recent Gate Passes</h3>
              <button 
                type="button"
                onClick={() => navigate('/admin/reports')}
                className="text-[#4B0082] hover:text-[#6B238E] text-sm font-medium hover:underline transition-colors self-start sm:self-auto"
              >
                View All
              </button>
            </div>
            <div className="table-container">
              <GatePassTable gatePasses={recentGatePasses} userRole="admin" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;