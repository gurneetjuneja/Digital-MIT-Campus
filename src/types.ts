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

export type BudgetApprovalStage = 'dean' | 'viceChancellor' | 'chancellor';
export type BudgetApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface BudgetApprovalStageData {
  status: BudgetApprovalStatus;
  timestamp?: string;
  approvedBy?: string;
  remarks?: string;
}

export interface BudgetApproval {
  id: string;
  budgetId: string;
  facultyId: string;
  facultyName: string;
  department: string;
  purpose: string;
  budgetAmount: number;
  allottedBudget: number;
  remainingBudget: number;
  budgetDocumentUrl?: string;
  budgetDocumentName?: string;
  approvalStages: {
    dean: BudgetApprovalStageData;
    viceChancellor: BudgetApprovalStageData;
    chancellor: BudgetApprovalStageData;
  };
  currentStage: BudgetApprovalStage | 'completed';
  qrCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  completedAt?: string;
  gatePassId?: string;
}

export interface VCRSSubmission {
  purpose: string;
  budgetAmount: number;
  budgetDocument: File | null;
  department: string;
}

export interface FacultyBudget {
  facultyId: string;
  facultyName: string;
  department: string;
  allottedBudget: number;
  usedBudget: number;
  remainingBudget: number;
}