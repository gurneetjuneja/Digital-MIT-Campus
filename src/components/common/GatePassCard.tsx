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
        return <span className="badge badge-warning"><Clock size={12} className="mr-1" /> Pending</span>;
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
    <div className={`card ${needsAction ? 'border-l-4 border-l-blue-500' : ''} card-hover`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{gatePass.passNumber}</h3>
          <p className="text-sm text-gray-600">{gatePass.submittedBy.purpose}</p>
        </div>
        <div>
          {getStatusBadge(gatePass.status)}
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">Created: {format(parseISO(gatePass.createdAt), 'MMM dd, yyyy')}</p>
        <p className="text-sm text-gray-500">Department: {gatePass.department}</p>
        <p className="text-sm text-gray-500">Items: {gatePass.items.length}</p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-1 text-xs">
          <div className={`h-1.5 w-8 rounded ${gatePass.approvalStages.gateEntry.status === 'approved' ? 'bg-green-500' : gatePass.approvalStages.gateEntry.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
          <div className={`h-1.5 w-8 rounded ${gatePass.approvalStages.facultyApproval.status === 'approved' ? 'bg-green-500' : gatePass.approvalStages.facultyApproval.status === 'rejected' ? 'bg-red-500' : gatePass.approvalStages.facultyApproval.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
          <div className={`h-1.5 w-8 rounded ${gatePass.approvalStages.gateReapproval.status === 'approved' ? 'bg-green-500' : gatePass.approvalStages.gateReapproval.status === 'rejected' ? 'bg-red-500' : gatePass.approvalStages.gateReapproval.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
          <div className={`h-1.5 w-8 rounded ${gatePass.approvalStages.adminApproval.status === 'approved' ? 'bg-green-500' : gatePass.approvalStages.adminApproval.status === 'rejected' ? 'bg-red-500' : gatePass.approvalStages.adminApproval.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
        </div>
        
        <Link 
          to={getActionUrl()} 
          className={`btn ${needsAction ? 'btn-primary' : 'btn-outline'} flex items-center text-xs`}
        >
          {getActionLabel()}
          <ArrowRight size={14} className="ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default GatePassCard;