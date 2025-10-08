export interface User {
  id: string;
  name: string;
  email: string;
  role: 'security' | 'faculty' | 'admin';
  department?: string;
  profilePic?: string;
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  description: string;
  isChecked?: boolean;
  adminVerified?: boolean;
  remarks?: string;
}

export interface GatePass {
  id: string;
  passNumber: string;
  items: Item[];
  createdBy: User;
  createdAt: string;
  submittedBy: {
    name: string;
    contact: string;
    purpose: string;
  };
  approvalStages: {
    gateEntry: {
      status: ApprovalStatus;
      timestamp?: string;
      approvedBy?: string;
    };
    facultyApproval: {
      status: ApprovalStatus;
      timestamp?: string;
      approvedBy?: string;
      remarks?: string;
    };
    gateReapproval: {
      status: ApprovalStatus;
      timestamp?: string;
      approvedBy?: string;
    };
    adminApproval: {
      status: ApprovalStatus;
      timestamp?: string;
      approvedBy?: string;
      remarks?: string;
    };
  };
  currentStage: ApprovalStage;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
}

export type ApprovalStage = 'gateEntry' | 'facultyApproval' | 'gateReapproval' | 'adminApproval' | 'completed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'not-started';