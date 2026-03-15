import React, { createContext, useContext, useState, useEffect } from 'react';
import { BudgetApproval, VCRSSubmission, BudgetApprovalStage, FacultyBudget } from '../types';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface VCRSContextType {
  budgetApprovals: BudgetApproval[];
  facultyBudgets: FacultyBudget[];
  loading: boolean;
  error: string | null;
  getBudgetApprovalById: (id: string) => BudgetApproval | undefined;
  getBudgetApprovalByQRCode: (qrCode: string) => BudgetApproval | undefined;
  getBudgetApprovalsByFaculty: (facultyId: string) => BudgetApproval[];
  getBudgetApprovalsByStage: (stage: BudgetApprovalStage) => BudgetApproval[];
  getFacultyBudget: (facultyId: string) => FacultyBudget | undefined;
  submitBudgetApproval: (submission: VCRSSubmission) => Promise<BudgetApproval>;
  approveBudgetStage: (id: string, stage: BudgetApprovalStage, remarks?: string) => Promise<BudgetApproval>;
  rejectBudgetStage: (id: string, stage: BudgetApprovalStage, remarks: string) => Promise<BudgetApproval>;
  linkBudgetToGatePass: (budgetId: string, gatePassId: string) => Promise<void>;
  initializeFacultyBudget: (facultyId: string, facultyName: string, department: string, allottedBudget: number) => void;
  ensureFacultyBudget: (facultyId: string, facultyName: string, department: string) => void;
}

const VCRSContext = createContext<VCRSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BUDGET_APPROVALS: 'vcrs_budget_approvals',
  FACULTY_BUDGETS: 'vcrs_faculty_budgets'
};

export const useVCRS = () => {
  const context = useContext(VCRSContext);
  if (context === undefined) {
    throw new Error('useVCRS must be used within a VCRSProvider');
  }
  return context;
};

export const VCRSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budgetApprovals, setBudgetApprovals] = useState<BudgetApproval[]>([]);
  const [facultyBudgets, setFacultyBudgets] = useState<FacultyBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    try {
      const storedApprovals = localStorage.getItem(STORAGE_KEYS.BUDGET_APPROVALS);
      const storedBudgets = localStorage.getItem(STORAGE_KEYS.FACULTY_BUDGETS);

      if (storedApprovals) {
        setBudgetApprovals(JSON.parse(storedApprovals));
      }

      if (storedBudgets) {
        const budgets = JSON.parse(storedBudgets);
        setFacultyBudgets(budgets);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading Voucher and Claim Reimbursement System data:', err);
      setError('Error loading Voucher and Claim Reimbursement System data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return;
  }, [currentUser]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEYS.BUDGET_APPROVALS, JSON.stringify(budgetApprovals));
    }
  }, [budgetApprovals, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEYS.FACULTY_BUDGETS, JSON.stringify(facultyBudgets));
    }
  }, [facultyBudgets, loading]);

  const getBudgetApprovalById = (id: string) => {
    return budgetApprovals.find(approval => approval.id === id);
  };

  const getBudgetApprovalByQRCode = (qrCode: string) => {
    return budgetApprovals.find(approval => approval.qrCode === qrCode);
  };

  const getBudgetApprovalsByFaculty = (facultyId: string) => {
    return budgetApprovals.filter(approval => approval.facultyId === facultyId);
  };

  const getBudgetApprovalsByStage = (stage: BudgetApprovalStage) => {
    return budgetApprovals.filter(approval => 
      approval.currentStage === stage && 
      approval.approvalStages[stage].status === 'pending' &&
      approval.status !== 'rejected'
    );
  };

  const getFacultyBudget = (facultyId: string) => {
    return facultyBudgets.find(budget => budget.facultyId === facultyId);
  };

  const generateQRCodeData = (approvalId: string, budgetId: string): string => {
    return `VCRS-${approvalId}-${budgetId}`;
  };

  const convertFileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const submitBudgetApproval = async (submission: VCRSSubmission): Promise<BudgetApproval> => {
    try {
      setLoading(true);
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      if (currentUser.role !== 'faculty') {
        throw new Error('Only faculty members can submit budget approvals');
      }

      const facultyBudget = getFacultyBudget(currentUser.id);
      if (!facultyBudget) {
        throw new Error('Faculty budget not found. Please contact administrator.');
      }

      if (submission.budgetAmount > facultyBudget.remainingBudget) {
        throw new Error(`Insufficient budget. Remaining: ₹${facultyBudget.remainingBudget.toLocaleString()}, Requested: ₹${submission.budgetAmount.toLocaleString()}`);
      }

      const budgetId = `BUD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
      
      let documentUrl = '';
      let documentName = '';
      if (submission.budgetDocument) {
        documentUrl = await convertFileToDataURL(submission.budgetDocument);
        documentName = submission.budgetDocument.name;
      }

      const department = submission.department || currentUser.department || facultyBudget.department || 'General';

      const newBudgetApproval: BudgetApproval = {
        id: uuidv4(),
        budgetId,
        facultyId: currentUser.id,
        facultyName: currentUser.name,
        department: department,
        purpose: submission.purpose,
        budgetAmount: submission.budgetAmount,
        allottedBudget: facultyBudget.allottedBudget,
        remainingBudget: facultyBudget.remainingBudget - submission.budgetAmount,
        budgetDocumentUrl: documentUrl,
        budgetDocumentName: documentName,
        approvalStages: {
          dean: { status: 'pending' },
          viceChancellor: { status: 'pending' },
          chancellor: { status: 'pending' }
        },
        currentStage: 'dean',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const updatedApprovals = [...budgetApprovals, newBudgetApproval];
      setBudgetApprovals(updatedApprovals);

      toast.success('Budget approval submitted successfully! Awaiting approval from Dean.');
      return newBudgetApproval;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error submitting budget approval';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveBudgetStage = async (id: string, stage: BudgetApprovalStage, remarks?: string): Promise<BudgetApproval> => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const approval = getBudgetApprovalById(id);
      if (!approval) {
        throw new Error('Budget approval not found');
      }

      if (approval.currentStage !== stage) {
        throw new Error(`Cannot approve. Current stage is ${approval.currentStage}`);
      }

      const stageOrder: BudgetApprovalStage[] = ['dean', 'viceChancellor', 'chancellor'];
      const currentIndex = stageOrder.indexOf(stage);
      const nextStage = currentIndex < stageOrder.length - 1 ? stageOrder[currentIndex + 1] : 'completed';

      const updatedApproval: BudgetApproval = {
        ...approval,
        approvalStages: {
          ...approval.approvalStages,
          [stage]: {
            status: 'approved',
            timestamp: new Date().toISOString(),
            approvedBy: currentUser.name,
            remarks
          }
        },
        currentStage: nextStage === 'completed' ? 'completed' : nextStage
      };

      if (nextStage === 'completed') {
        updatedApproval.qrCode = generateQRCodeData(approval.id, approval.budgetId);
        updatedApproval.status = 'approved';
        updatedApproval.completedAt = new Date().toISOString();
        
        const facultyBudget = getFacultyBudget(approval.facultyId);
        if (facultyBudget) {
          const updatedBudgets = facultyBudgets.map(budget =>
            budget.facultyId === approval.facultyId
              ? {
                  ...budget,
                  usedBudget: budget.usedBudget + approval.budgetAmount,
                  remainingBudget: budget.remainingBudget - approval.budgetAmount
                }
              : budget
          );
          setFacultyBudgets(updatedBudgets);
        }

        toast.success('Budget approval fully approved! QR code generated.');
      } else {
        toast.success(`Approved by ${stage}. Moving to next stage.`);
      }

      const updatedApprovals = budgetApprovals.map(a => a.id === id ? updatedApproval : a);
      setBudgetApprovals(updatedApprovals);

      return updatedApproval;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error approving budget stage';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const rejectBudgetStage = async (id: string, stage: BudgetApprovalStage, remarks: string): Promise<BudgetApproval> => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const approval = getBudgetApprovalById(id);
      if (!approval) {
        throw new Error('Budget approval not found');
      }

      const updatedApproval: BudgetApproval = {
        ...approval,
        approvalStages: {
          ...approval.approvalStages,
          [stage]: {
            status: 'rejected',
            timestamp: new Date().toISOString(),
            approvedBy: currentUser.name,
            remarks
          }
        },
        status: 'rejected'
      };

      const updatedApprovals = budgetApprovals.map(a => a.id === id ? updatedApproval : a);
      setBudgetApprovals(updatedApprovals);

      toast.success('Budget approval rejected.');
      return updatedApproval;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error rejecting budget stage';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const linkBudgetToGatePass = async (budgetId: string, gatePassId: string): Promise<void> => {
    try {
      const approval = budgetApprovals.find(a => a.budgetId === budgetId || a.id === budgetId);
      if (!approval) {
        throw new Error('Budget approval not found');
      }

      const updatedApproval: BudgetApproval = {
        ...approval,
        gatePassId
      };

      const updatedApprovals = budgetApprovals.map(a => a.id === approval.id ? updatedApproval : a);
      setBudgetApprovals(updatedApprovals);

      toast.success('Budget approval linked to gate pass');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error linking budget to gate pass';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const initializeFacultyBudget = (facultyId: string, facultyName: string, department: string, allottedBudget: number = 50000) => {
    const existing = getFacultyBudget(facultyId);
    if (existing) {
      return;
    }

    const newBudget: FacultyBudget = {
      facultyId,
      facultyName,
      department,
      allottedBudget,
      usedBudget: 0,
      remainingBudget: allottedBudget
    };

    const updatedBudgets = [...facultyBudgets, newBudget];
    setFacultyBudgets(updatedBudgets);
    localStorage.setItem(STORAGE_KEYS.FACULTY_BUDGETS, JSON.stringify(updatedBudgets));
  };

  const ensureFacultyBudget = (facultyId: string, facultyName: string, department: string) => {
    const existing = getFacultyBudget(facultyId);
    if (!existing) {
      initializeFacultyBudget(facultyId, facultyName, department, 50000);
    }
  };

  const value = {
    budgetApprovals,
    facultyBudgets,
    loading,
    error,
    getBudgetApprovalById,
    getBudgetApprovalByQRCode,
    getBudgetApprovalsByFaculty,
    getBudgetApprovalsByStage,
    getFacultyBudget,
    submitBudgetApproval,
    approveBudgetStage,
    rejectBudgetStage,
    linkBudgetToGatePass,
    initializeFacultyBudget,
    ensureFacultyBudget
  };

  return (
    <VCRSContext.Provider value={value}>
      {children}
    </VCRSContext.Provider>
  );
};
