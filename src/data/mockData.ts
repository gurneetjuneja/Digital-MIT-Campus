import { GatePass, User } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays } from 'date-fns';

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Security User',
    email: 'security@college.edu',
    role: 'security',
    profilePic: 'SU'
  },
  {
    id: '2',
    name: 'Rajkumar Patil',
    email: 'faculty@college.edu',
    role: 'faculty',
    department: 'Computer Science',
    profilePic: 'RP'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@college.edu',
    role: 'admin',
    profilePic: 'AU'
  },
  {
    id: '4',
    name: 'Ishwari Raskar',
    email: 'ishwari@college.edu',
    role: 'faculty',
    department: 'Information Technology',
    profilePic: 'IR'
  },
  {
    id: '5',
    name: 'Kalyani Lokhande',
    email: 'kalyani@college.edu',
    role: 'faculty',
    department: 'Electronics',
    profilePic: 'KL'
  },
  {
    id: '6',
    name: 'Rahul Bhole',
    email: 'rahul@college.edu',
    role: 'faculty',
    department: 'Mechanical',
    profilePic: 'RB'
  },
  {
    id: '7',
    name: 'Reetika Kerketta',
    email: 'reetika@college.edu',
    role: 'faculty',
    department: 'Civil',
    profilePic: 'RK'
  }
];

// Generate mock gate passes
const generateMockPasses = (): GatePass[] => {
  const statuses: ('pending' | 'approved' | 'rejected')[] = ['pending', 'approved', 'rejected'];
  const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];
  const purposes = ['Laboratory Equipment', 'Office Supplies', 'Event Materials', 'Maintenance Tools', 'Research Equipment'];
  
  return Array.from({ length: 15 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const randomDepartment = departments[Math.floor(Math.random() * departments.length)];
    const randomPurpose = purposes[Math.floor(Math.random() * purposes.length)];
    const daysAgo = Math.floor(Math.random() * 10);
    
    const currentStage: ('gateEntry' | 'facultyApproval' | 'gateReapproval' | 'adminApproval' | 'completed')[] = [
      'gateEntry', 'facultyApproval', 'gateReapproval', 'adminApproval', 'completed'
    ];
    
    const randomStage = currentStage[Math.floor(Math.random() * currentStage.length)];
    const randomFaculty = mockUsers.filter(user => user.role === 'faculty')[Math.floor(Math.random() * (mockUsers.length - 3))];
    
    return {
      id: uuidv4(),
      passNumber: `GP-${2023 + Math.floor(i / 12)}-${(i % 12) + 1}-${100 + i}`,
      items: [
        {
          id: uuidv4(),
          name: 'Laptop',
          quantity: 1,
          description: 'Dell XPS 15',
          isChecked: Math.random() > 0.5,
          remarks: Math.random() > 0.7 ? 'Needs repair' : undefined
        },
        {
          id: uuidv4(),
          name: 'Projector',
          quantity: 1,
          description: 'Epson Projector',
          isChecked: Math.random() > 0.5,
          remarks: Math.random() > 0.7 ? 'New purchase' : undefined
        }
      ],
      createdBy: mockUsers[0],
      createdAt: format(subDays(new Date(), daysAgo), 'yyyy-MM-dd HH:mm:ss'),
      submittedBy: {
        name: `Submitter ${i + 1}`,
        contact: `98765${i}${i}${i}${i}${i}`,
        purpose: randomPurpose
      },
      approvalStages: {
        gateEntry: {
          status: 'approved',
          timestamp: format(subDays(new Date(), daysAgo), 'yyyy-MM-dd HH:mm:ss'),
          approvedBy: mockUsers[0].name
        },
        facultyApproval: {
          status: randomStage === 'gateEntry' ? 'pending' : 
                  (randomStage === 'completed' || randomStage === 'gateReapproval' || randomStage === 'adminApproval') ? 'approved' : 
                  Math.random() > 0.7 ? 'rejected' : 'pending',
          timestamp: randomStage !== 'gateEntry' ? format(subDays(new Date(), daysAgo - 1), 'yyyy-MM-dd HH:mm:ss') : undefined,
          approvedBy: randomStage !== 'gateEntry' ? randomFaculty.name : undefined,
          remarks: Math.random() > 0.7 ? 'Items verified' : undefined
        },
        gateReapproval: {
          status: (randomStage === 'gateEntry' || randomStage === 'facultyApproval') ? 'not-started' : 
                 (randomStage === 'completed' || randomStage === 'adminApproval') ? 'approved' : 
                 Math.random() > 0.7 ? 'rejected' : 'pending',
          timestamp: (randomStage !== 'gateEntry' && randomStage !== 'facultyApproval') ? format(subDays(new Date(), daysAgo - 2), 'yyyy-MM-dd HH:mm:ss') : undefined,
          approvedBy: (randomStage !== 'gateEntry' && randomStage !== 'facultyApproval') ? mockUsers[0].name : undefined
        },
        adminApproval: {
          status: (randomStage === 'gateEntry' || randomStage === 'facultyApproval' || randomStage === 'gateReapproval') ? 'not-started' : 
                 (randomStage === 'completed') ? 'approved' : 
                 Math.random() > 0.8 ? 'rejected' : 'pending',
          timestamp: randomStage === 'completed' ? format(subDays(new Date(), daysAgo - 3), 'yyyy-MM-dd HH:mm:ss') : undefined,
          approvedBy: randomStage === 'completed' ? mockUsers[2].name : undefined,
          remarks: Math.random() > 0.7 ? 'Approved for reimbursement' : undefined
        }
      },
      currentStage: randomStage,
      department: randomDepartment,
      status: status,
      remarks: Math.random() > 0.7 ? 'This is a remark for the gate pass' : undefined
    };
  });
};

export const mockGatePasses: GatePass[] = generateMockPasses();

// For statistics/dashboard data
export const dashboardStats = {
  totalPasses: mockGatePasses.length,
  pendingApprovals: mockGatePasses.filter(pass => pass.status === 'pending').length,
  approvedPasses: mockGatePasses.filter(pass => pass.status === 'approved').length,
  rejectedPasses: mockGatePasses.filter(pass => pass.status === 'rejected').length,
  
  // Stage distribution
  stageDistribution: {
    gateEntry: mockGatePasses.filter(pass => pass.currentStage === 'gateEntry').length,
    facultyApproval: mockGatePasses.filter(pass => pass.currentStage === 'facultyApproval').length,
    gateReapproval: mockGatePasses.filter(pass => pass.currentStage === 'gateReapproval').length,
    adminApproval: mockGatePasses.filter(pass => pass.currentStage === 'adminApproval').length,
    completed: mockGatePasses.filter(pass => pass.currentStage === 'completed').length
  },
  
  // Department distribution
  departmentDistribution: {
    'Computer Science': mockGatePasses.filter(pass => pass.department === 'Computer Science').length,
    'Information Technology': mockGatePasses.filter(pass => pass.department === 'Information Technology').length,
    'Electronics': mockGatePasses.filter(pass => pass.department === 'Electronics').length,
    'Mechanical': mockGatePasses.filter(pass => pass.department === 'Mechanical').length,
    'Civil': mockGatePasses.filter(pass => pass.department === 'Civil').length,
  }
};