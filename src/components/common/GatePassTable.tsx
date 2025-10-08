import React from 'react';
import { Link } from 'react-router-dom';
import { GatePass } from '../../types';
import { format, parseISO } from 'date-fns';
import { Check, X, Clock, Eye } from 'lucide-react';

interface GatePassTableProps {
  gatePasses: GatePass[];
  userRole: 'security' | 'faculty' | 'admin';
}

const GatePassTable: React.FC<GatePassTableProps> = ({ gatePasses, userRole }) => {
  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-success flex items-center"><Check size={12} className="mr-1" /> Approved</span>;
      case 'rejected':
        return <span className="badge badge-error flex items-center"><X size={12} className="mr-1" /> Rejected</span>;
      case 'pending':
        return <span className="badge badge-warning flex items-center"><Clock size={12} className="mr-1" /> Pending</span>;
      default:
        return null;
    }
  };
  
  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'gateEntry':
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Gate Entry</span>;
      case 'facultyApproval':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Faculty Approval</span>;
      case 'gateReapproval':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Gate Reapproval</span>;
      case 'adminApproval':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Admin Approval</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Completed</span>;
      default:
        return null;
    }
  };
  
  const getActionUrl = (gatePass: GatePass) => {
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
  
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Pass #</th>
            <th>Date</th>
            <th>Department</th>
            <th>Purpose</th>
            <th>Status</th>
            <th>Current Stage</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {gatePasses.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-500">
                No gate passes found
              </td>
            </tr>
          ) : (
            gatePasses.map((gatePass) => (
              <tr key={gatePass.id}>
                <td>{gatePass.passNumber}</td>
                <td>{format(parseISO(gatePass.createdAt), 'MMM dd, yyyy')}</td>
                <td>{gatePass.department}</td>
                <td className="max-w-xs truncate">{gatePass.submittedBy.purpose}</td>
                <td>{getStatusBadge(gatePass.status)}</td>
                <td>{getStageBadge(gatePass.currentStage)}</td>
                <td className="text-right">
                  <Link
                    to={getActionUrl(gatePass)}
                    className="btn btn-outline text-xs py-1 px-3 flex items-center inline-flex"
                  >
                    <Eye size={14} className="mr-1" />
                    View
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GatePassTable;