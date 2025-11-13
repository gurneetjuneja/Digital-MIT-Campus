import React, { createContext, useContext, useState, useEffect } from 'react';
import { GatePass, Item, User, ApprovalStage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface GatePassContextType {
  gatePasses: GatePass[];
  loading: boolean;
  error: string | null;
  getGatePassById: (id: string) => GatePass | undefined;
  getGatePassesByCurrentStage: (stage: ApprovalStage) => GatePass[];
  getGatePassesByFaculty: (userId: string) => GatePass[];
  createGatePass: (data: Partial<GatePass>, items: Item[]) => Promise<GatePass>;
  updateGatePass: (id: string, data: Partial<GatePass>) => Promise<GatePass>;
  approveFacultyGatePass: (id: string, remarks?: string) => Promise<GatePass>;
  rejectFacultyGatePass: (id: string, remarks: string) => Promise<GatePass>;
  approveSecurityRecheck: (id: string) => Promise<GatePass>;
  rejectSecurityRecheck: (id: string, remarks: string) => Promise<GatePass>;
  approveAdminGatePass: (id: string, remarks?: string) => Promise<GatePass>;
  rejectAdminGatePass: (id: string, remarks: string) => Promise<GatePass>;
}

const GatePassContext = createContext<GatePassContextType | undefined>(undefined);

export const useGatePass = () => {
  const context = useContext(GatePassContext);
  if (context === undefined) {
    throw new Error('useGatePass must be used within a GatePassProvider');
  }
  return context;
};

export const GatePassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const gatePassesRef = collection(db, 'gatePasses');
    const q = query(gatePassesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const passes: GatePass[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        passes.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
        } as GatePass);
      });
      setGatePasses(passes);
      setLoading(false);
    }, (err) => {
      console.error('Error loading gate passes:', err);
      setError('Error loading gate passes');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getGatePassById = (id: string) => {
    return gatePasses.find(pass => pass.id === id);
  };

  const getGatePassesByCurrentStage = (stage: ApprovalStage) => {
    return gatePasses.filter(pass => {
      if (pass.currentStage !== stage) return false;

      if (stage === 'gateReapproval') {
        return (
          pass.approvalStages.facultyApproval.status === 'approved' &&
          pass.status !== 'rejected' &&
          pass.currentStage !== 'completed' &&
          ['not-started', 'pending'].includes(pass.approvalStages.gateReapproval.status)
        );
      }

      if (stage === 'facultyApproval') {
        return (
          pass.approvalStages.gateEntry.status === 'approved' &&
          pass.status !== 'rejected' &&
          ['not-started', 'pending'].includes(pass.approvalStages.facultyApproval.status)
        );
      }

      if (stage === 'adminApproval') {
        return (
          pass.approvalStages.gateReapproval.status === 'approved' &&
          pass.status !== 'rejected' &&
          ['not-started', 'pending'].includes(pass.approvalStages.adminApproval.status)
        );
      }

      return true;
    });
  };

  const getGatePassesByFaculty = (userId: string) => {
    return gatePasses.filter(pass => 
      pass.currentStage === 'facultyApproval' && 
      pass.department === currentUser?.department &&
      pass.status !== 'rejected' &&
      ['not-started', 'pending'].includes(pass.approvalStages.facultyApproval.status)
    );
  };

  const createGatePass = async (data: Partial<GatePass>, items: Item[]): Promise<GatePass> => {
    try {
      setLoading(true);
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const today = new Date();
      const passNumber = `GP-${today.getFullYear()}-${today.getMonth() + 1}-${Math.floor(Math.random() * 1000)}`;
      
      const newGatePass: Omit<GatePass, 'id'> = {
        passNumber,
        items,
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        submittedBy: {
          name: data.submittedBy?.name || '',
          contact: data.submittedBy?.contact || '',
          purpose: data.submittedBy?.purpose || '',
        },
        approvalStages: {
          gateEntry: {
            status: 'approved',
            timestamp: new Date().toISOString(),
            approvedBy: currentUser.name
          },
          facultyApproval: {
            status: 'pending'
          },
          gateReapproval: {
            status: 'not-started'
          },
          adminApproval: {
            status: 'not-started'
          }
        },
        currentStage: 'facultyApproval',
        department: data.department || currentUser.department || '',
        status: 'pending'
      };
      
      const docRef = await addDoc(collection(db, 'gatePasses'), {
        ...newGatePass,
        createdAt: serverTimestamp()
      });

      const createdGatePass = {
        ...newGatePass,
        id: docRef.id
      } as GatePass;

      toast.success('Gate pass created successfully');
      return createdGatePass;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating gate pass';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGatePass = async (id: string, data: Partial<GatePass>): Promise<GatePass> => {
    try {
      setLoading(true);
      
      const gatePassRef = doc(db, 'gatePasses', id);
      await updateDoc(gatePassRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      const updatedGatePass = {
        ...getGatePassById(id)!,
        ...data
      } as GatePass;

      toast.success('Gate pass updated successfully');
      return updatedGatePass;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating gate pass';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveFacultyGatePass = async (id: string, remarks?: string): Promise<GatePass> => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const gatePass = getGatePassById(id);
      if (!gatePass) {
        throw new Error('Gate pass not found');
      }

      const updatedData = {
        approvalStages: {
          ...gatePass.approvalStages,
          facultyApproval: {
            status: 'approved',
            timestamp: new Date().toISOString(),
            approvedBy: currentUser.name,
            remarks
          }
        },
        currentStage: 'gateReapproval'
      };

      return await updateGatePass(id, updatedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error approving gate pass';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const rejectFacultyGatePass = async (id: string, remarks: string): Promise<GatePass> => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const gatePass = getGatePassById(id);
      if (!gatePass) {
        throw new Error('Gate pass not found');
      }

      const updatedData = {
        approvalStages: {
          ...gatePass.approvalStages,
          facultyApproval: {
            status: 'rejected',
            timestamp: new Date().toISOString(),
            approvedBy: currentUser.name,
            remarks
          }
        },
        status: 'rejected',
        remarks
      };

      return await updateGatePass(id, updatedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error rejecting gate pass';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const approveSecurityRecheck = async (id: string): Promise<GatePass> => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const gatePass = getGatePassById(id);
      if (!gatePass) {
        throw new Error('Gate pass not found');
      }

      const updatedData = {
        approvalStages: {
          ...gatePass.approvalStages,
          gateReapproval: {
            status: 'approved',
            timestamp: new Date().toISOString(),
            approvedBy: currentUser.name
          }
        },
        currentStage: 'adminApproval'
      };

      return await updateGatePass(id, updatedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error approving gate pass recheck';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const rejectSecurityRecheck = async (id: string, remarks: string): Promise<GatePass> => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const gatePass = getGatePassById(id);
      if (!gatePass) {
        throw new Error('Gate pass not found');
      }

      const updatedData = {
        approvalStages: {
          ...gatePass.approvalStages,
          gateReapproval: {
            status: 'rejected',
            timestamp: new Date().toISOString(),
            approvedBy: currentUser.name
          }
        },
        status: 'rejected',
        remarks
      };

      return await updateGatePass(id, updatedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error rejecting gate pass recheck';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const approveAdminGatePass = async (id: string, remarks?: string): Promise<GatePass> => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const gatePass = getGatePassById(id);
      if (!gatePass) {
        throw new Error('Gate pass not found');
      }

      const updatedData = {
        approvalStages: {
          ...gatePass.approvalStages,
          adminApproval: {
            status: 'approved',
            timestamp: new Date().toISOString(),
            approvedBy: currentUser.name,
            remarks
          }
        },
        currentStage: 'completed',
        status: 'approved'
      };

      return await updateGatePass(id, updatedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error approving gate pass by admin';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const rejectAdminGatePass = async (id: string, remarks: string): Promise<GatePass> => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const gatePass = getGatePassById(id);
      if (!gatePass) {
        throw new Error('Gate pass not found');
      }

      const updatedData = {
        approvalStages: {
          ...gatePass.approvalStages,
          adminApproval: {
            status: 'rejected',
            timestamp: new Date().toISOString(),
            approvedBy: currentUser.name,
            remarks
          }
        },
        status: 'rejected',
        remarks
      };

      return await updateGatePass(id, updatedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error rejecting gate pass by admin';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const value = {
    gatePasses,
    loading,
    error,
    getGatePassById,
    getGatePassesByCurrentStage,
    getGatePassesByFaculty,
    createGatePass,
    updateGatePass,
    approveFacultyGatePass,
    rejectFacultyGatePass,
    approveSecurityRecheck,
    rejectSecurityRecheck,
    approveAdminGatePass,
    rejectAdminGatePass
  };

  return (
    <GatePassContext.Provider value={value}>
      {children}
    </GatePassContext.Provider>
  );
};