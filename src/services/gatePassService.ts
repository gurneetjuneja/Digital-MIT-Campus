import {
    collection,
    doc,
    addDoc,
    updateDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    FirestoreError
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { GatePass, ApprovalStatus } from '../types';

// Custom error class for Firebase operations
class FirebaseOperationError extends Error {
    constructor(message: string, public originalError: FirestoreError) {
        super(message);
        this.name = 'FirebaseOperationError';
    }
}

// Helper function to convert Firestore timestamp to string
const convertTimestamp = (timestamp: Timestamp): string => {
    return timestamp.toDate().toISOString();
};

// Helper function to validate gate pass data
const validateGatePassData = (data: Partial<GatePass>): boolean => {
    const requiredFields = ['passNumber', 'items', 'createdBy', 'submittedBy', 'department'];
    return requiredFields.every(field => field in data && data[field] !== null && data[field] !== undefined);
};

export const gatePassService = {
    // Create a new gate pass
    async createGatePass(gatePassData: Omit<GatePass, 'id'>): Promise<string> {
        try {
            if (!validateGatePassData(gatePassData)) {
                throw new Error('Invalid gate pass data: Missing required fields');
            }

            const gatePassRef = await addDoc(collection(db, 'gatePasses'), {
                ...gatePassData,
                createdAt: Timestamp.now(),
                approvalStages: {
                    gateEntry: { status: 'not-started' as ApprovalStatus },
                    facultyApproval: { status: 'not-started' as ApprovalStatus },
                    gateReapproval: { status: 'not-started' as ApprovalStatus },
                    adminApproval: { status: 'not-started' as ApprovalStatus }
                },
                currentStage: 'gateEntry',
                status: 'pending'
            });
            return gatePassRef.id;
        } catch (error) {
            throw new FirebaseOperationError(
                'Failed to create gate pass',
                error as FirestoreError
            );
        }
    },

    // Get gate pass by ID
    async getGatePassById(id: string): Promise<GatePass | null> {
        try {
            const docRef = doc(db, 'gatePasses', id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: convertTimestamp(data.createdAt),
                approvalStages: {
                    ...data.approvalStages,
                    gateEntry: {
                        ...data.approvalStages.gateEntry,
                        timestamp: data.approvalStages.gateEntry.timestamp ?
                            convertTimestamp(data.approvalStages.gateEntry.timestamp) : undefined
                    },
                    facultyApproval: {
                        ...data.approvalStages.facultyApproval,
                        timestamp: data.approvalStages.facultyApproval.timestamp ?
                            convertTimestamp(data.approvalStages.facultyApproval.timestamp) : undefined
                    },
                    gateReapproval: {
                        ...data.approvalStages.gateReapproval,
                        timestamp: data.approvalStages.gateReapproval.timestamp ?
                            convertTimestamp(data.approvalStages.gateReapproval.timestamp) : undefined
                    },
                    adminApproval: {
                        ...data.approvalStages.adminApproval,
                        timestamp: data.approvalStages.adminApproval.timestamp ?
                            convertTimestamp(data.approvalStages.adminApproval.timestamp) : undefined
                    }
                }
            } as GatePass;
        } catch (error) {
            throw new FirebaseOperationError(
                'Failed to fetch gate pass',
                error as FirestoreError
            );
        }
    },

    // Get gate passes by department
    async getGatePassesByDepartment(department: string): Promise<GatePass[]> {
        try {
            const q = query(
                collection(db, 'gatePasses'),
                where('department', '==', department),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: convertTimestamp(data.createdAt),
                    approvalStages: {
                        ...data.approvalStages,
                        gateEntry: {
                            ...data.approvalStages.gateEntry,
                            timestamp: data.approvalStages.gateEntry.timestamp ?
                                convertTimestamp(data.approvalStages.gateEntry.timestamp) : undefined
                        },
                        facultyApproval: {
                            ...data.approvalStages.facultyApproval,
                            timestamp: data.approvalStages.facultyApproval.timestamp ?
                                convertTimestamp(data.approvalStages.facultyApproval.timestamp) : undefined
                        },
                        gateReapproval: {
                            ...data.approvalStages.gateReapproval,
                            timestamp: data.approvalStages.gateReapproval.timestamp ?
                                convertTimestamp(data.approvalStages.gateReapproval.timestamp) : undefined
                        },
                        adminApproval: {
                            ...data.approvalStages.adminApproval,
                            timestamp: data.approvalStages.adminApproval.timestamp ?
                                convertTimestamp(data.approvalStages.adminApproval.timestamp) : undefined
                        }
                    }
                } as GatePass;
            });
        } catch (error) {
            throw new FirebaseOperationError(
                'Failed to fetch gate passes by department',
                error as FirestoreError
            );
        }
    },

    // Update gate pass approval status
    async updateApprovalStatus(
        gatePassId: string,
        stage: string,
        status: 'approved' | 'rejected',
        approverDetails: { id: string; name: string; remarks?: string }
    ): Promise<void> {
        try {
            const docRef = doc(db, 'gatePasses', gatePassId);
            const gatePass = await this.getGatePassById(gatePassId);

            if (!gatePass) {
                throw new Error('Gate pass not found');
            }

            // Validate the stage transition
            if (gatePass.currentStage !== stage) {
                throw new Error('Invalid approval stage transition');
            }

            // Determine next stage based on current stage and status
            let nextStage = stage;
            if (status === 'approved') {
                switch (stage) {
                    case 'gateEntry': nextStage = 'facultyApproval'; break;
                    case 'facultyApproval': nextStage = 'gateReapproval'; break;
                    case 'gateReapproval': nextStage = 'adminApproval'; break;
                    case 'adminApproval': nextStage = 'completed'; break;
                }
            }

            await updateDoc(docRef, {
                [`approvalStages.${stage}.status`]: status,
                [`approvalStages.${stage}.timestamp`]: Timestamp.now(),
                [`approvalStages.${stage}.approvedBy`]: approverDetails.id,
                [`approvalStages.${stage}.remarks`]: approverDetails.remarks || '',
                currentStage: nextStage,
                status: stage === 'adminApproval' && status === 'approved' ? 'approved' :
                    status === 'rejected' ? 'rejected' : 'pending'
            });
        } catch (error) {
            throw new FirebaseOperationError(
                'Failed to update approval status',
                error as FirestoreError
            );
        }
    },

    // Get all gate passes for security
    async getAllGatePasses(): Promise<GatePass[]> {
        try {
            const q = query(
                collection(db, 'gatePasses'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: convertTimestamp(data.createdAt),
                    approvalStages: {
                        ...data.approvalStages,
                        gateEntry: {
                            ...data.approvalStages.gateEntry,
                            timestamp: data.approvalStages.gateEntry.timestamp ?
                                convertTimestamp(data.approvalStages.gateEntry.timestamp) : undefined
                        },
                        facultyApproval: {
                            ...data.approvalStages.facultyApproval,
                            timestamp: data.approvalStages.facultyApproval.timestamp ?
                                convertTimestamp(data.approvalStages.facultyApproval.timestamp) : undefined
                        },
                        gateReapproval: {
                            ...data.approvalStages.gateReapproval,
                            timestamp: data.approvalStages.gateReapproval.timestamp ?
                                convertTimestamp(data.approvalStages.gateReapproval.timestamp) : undefined
                        },
                        adminApproval: {
                            ...data.approvalStages.adminApproval,
                            timestamp: data.approvalStages.adminApproval.timestamp ?
                                convertTimestamp(data.approvalStages.adminApproval.timestamp) : undefined
                        }
                    }
                } as GatePass;
            });
        } catch (error) {
            throw new FirebaseOperationError(
                'Failed to fetch all gate passes',
                error as FirestoreError
            );
        }
    }
}; 