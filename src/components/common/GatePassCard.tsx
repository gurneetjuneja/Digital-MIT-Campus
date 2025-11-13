import React from 'react';
import { GatePass } from '../../types';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Check, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GatePassCardProps {
  gatePass: GatePass;
  userRole: 'security' | 'faculty' | 'admin';
}

const GatePassCard: React.FC<GatePassCardProps> = ({ gatePass, userRole }) => {
  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-success"><Check size={12} className="mr-1" /> Approved</span>;
      case 'rejected':
        return <span className="badge badge-error"><X size={12} className="mr-1" /> Rejected</span>;
      case 'pending':
        return <span className="bg-pink-100 text-pink-700 px-2.5 py-1 rounded-full text-xs font-medium">Pending</span>;
      default:
        return null;
    }
  };
  
  const getActionUrl = () => {
    switch (userRole) {
      case 'security':
        if (gatePass.currentStage === 'gateReapproval') {
          return `/security/reapprove/${gatePass.id}`;
        }
        return `/security/view/${gatePass.id}`;
      case 'faculty':
        if (gatePass.currentStage === 'facultyApproval') {
          return `/faculty/approve/${gatePass.id}`;
        }
        return `/faculty/view/${gatePass.id}`;
      case 'admin':
        if (gatePass.currentStage === 'adminApproval') {
          return `/admin/approve/${gatePass.id}`;
        }
        return `/admin/view/${gatePass.id}`;
      default:
        return '#';
    }
  };
  
  const getActionLabel = () => {
    switch (userRole) {
      case 'security':
        if (gatePass.currentStage === 'gateReapproval') {
          return 'Verify Items';
        }
        return 'View Details';
      case 'faculty':
        if (gatePass.currentStage === 'facultyApproval') {
          return 'Review & Approve';
        }
        return 'View Details';
      case 'admin':
        if (gatePass.currentStage === 'adminApproval') {
          return 'Final Approval';
        }
        return 'View Details';
      default:
        return 'View Details';
    }
  };
  
  const needsAction = (
    (userRole === 'security' && gatePass.currentStage === 'gateReapproval') ||
    (userRole === 'faculty' && gatePass.currentStage === 'facultyApproval') ||
    (userRole === 'admin' && gatePass.currentStage === 'adminApproval')
  );
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-5 ${needsAction ? 'border-l-4 border-l-blue-500' : ''} flex flex-col transition-shadow hover:shadow-md`}>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">
            {gatePass.passNumber}
          </h3>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-400" />
            {getStatusBadge(gatePass.status)}
          </div>
        </div>
        <p className="text-sm text-gray-500">{gatePass.submittedBy.purpose}</p>
      </div>
      
      <div className="mb-4 space-y-2">
        <p className="text-sm text-gray-700">
          Created: <span className="text-gray-900 font-medium">{format(parseISO(gatePass.createdAt), 'MMM dd, yyyy')}</span>
        </p>
        <p className="text-sm text-gray-700">
          Department: <span className="text-gray-900 font-medium">{gatePass.department}</span>
        </p>
        <p className="text-sm text-gray-700">
          Items: <span className="text-gray-900 font-medium">{gatePass.items.length}</span>
        </p>
      </div>
      
      <div className="mb-3 pt-3 border-t border-gray-200">
        <div className="flex space-x-1.5 mb-3">
          <div className={`h-3 w-full rounded ${gatePass.approvalStages.gateEntry.status === 'approved' ? 'bg-green-500' : gatePass.approvalStages.gateEntry.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'}`} title="Gate Entry"></div>
          <div className={`h-3 w-full rounded ${gatePass.approvalStages.facultyApproval.status === 'approved' ? 'bg-green-500' : gatePass.approvalStages.facultyApproval.status === 'rejected' ? 'bg-red-500' : gatePass.approvalStages.facultyApproval.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'}`} title="Faculty Approval"></div>
          <div className={`h-3 w-full rounded ${gatePass.approvalStages.gateReapproval.status === 'approved' ? 'bg-green-500' : gatePass.approvalStages.gateReapproval.status === 'rejected' ? 'bg-red-500' : gatePass.approvalStages.gateReapproval.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'}`} title="Gate Reapproval"></div>
          <div className={`h-3 w-full rounded ${gatePass.approvalStages.adminApproval.status === 'approved' ? 'bg-green-500' : gatePass.approvalStages.adminApproval.status === 'rejected' ? 'bg-red-500' : gatePass.approvalStages.adminApproval.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'}`} title="Admin Approval"></div>
          <div className={`h-3 w-full rounded ${gatePass.currentStage === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} title="Completed"></div>
        </div>
        
        <Link 
          to={getActionUrl()} 
          className={`btn ${needsAction ? 'bg-[#4B0082] hover:bg-[#6B238E] text-white' : 'btn-outline'} flex items-center justify-center text-sm px-4 py-2.5 w-full`}
        >
          {getActionLabel()}
          <ArrowRight size={16} className="ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default GatePassCard;