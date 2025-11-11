import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';
import { simulateEmailNotification } from '../services/emailService';

type ComplaintCategory = 'mess' | 'infrastructure' | 'harassment' | 'hygiene' | 'security' | 'academic' | 'other';
type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'vendor' | 'admin' | 'counselor';
  walletBalance: number;
  performanceScore?: number; // For vendors
  badges?: string[]; // For vendors
  rewardPoints?: number;
}

interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  location: string;
  photoUrl: string;
  voiceNoteUrl?: string;
  language: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  depositAmount: number;
  allocatedAmount?: number; // Amount admin allocates to vendor
  timestamp: number;
  status: 'pending' | 'awaiting_votes' | 'assigned' | 'in_progress' | 'resolved' | 'confirmed' | 'rejected';
  assignedVendorId?: string;
  assignedVendorName?: string;
  assignedCounselorId?: string; // For harassment cases
  proofUrl?: string;
  upvotes: number;
  upvotedBy: string[];
  fundsReleased: boolean;
  resolutionDeadline?: number;
  completedAt?: number;
  ratings: Rating[];
  averageRating?: number;
  needsCounseling?: boolean;
  counselingAccepted?: boolean;
  aiSentiment?: string;
  isUrgent?: boolean;
}

interface Rating {
  studentId: string;
  rating: number;
  comment: string;
  timestamp: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'payment' | 'upvote' | 'assignment' | 'resolution' | 'penalty' | 'reward';
  complaintId: string;
  amount: number;
  from: string;
  to: string;
  timestamp: number;
  description: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  complaints: Complaint[];
  transactions: Transaction[];
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'student' | 'vendor') => Promise<void>;
  logout: () => void;
  raiseComplaint: (
    title: string, 
    description: string, 
    location: string, 
    photoUrl: string, 
    category: ComplaintCategory,
    language: string,
    voiceNoteUrl?: string
  ) => void;
  upvoteComplaint: (complaintId: string) => void;
  getMyComplaints: () => Complaint[];
  getAllComplaints: () => Complaint[];
  getVendorComplaints: () => Complaint[];
  getHarassmentComplaints: () => Complaint[];
  assignVendor: (complaintId: string, vendorId: string, allocatedAmount: number) => void;
  assignCounselor: (complaintId: string, counselorId: string) => void;
  acceptCounseling: (complaintId: string) => void;
  updateComplaintStatus: (complaintId: string, status: Complaint['status']) => void;
  resolveComplaint: (complaintId: string, proofUrl: string) => void;
  confirmResolution: (complaintId: string) => void;
  releaseFunds: (complaintId: string) => void;
  rateResolution: (complaintId: string, rating: number, comment: string) => void;
  addVendor: (email: string, name: string) => void;
  addCounselor: (email: string, name: string) => void;
  getVendors: () => User[];
  getCounselors: () => User[];
  hasUserUpvoted: (complaintId: string) => boolean;
  getTotalFundsPool: () => number;
  applyPenalty: (vendorId: string, complaintId: string, amount: number) => void;
  rewardVendor: (vendorId: string, points: number) => void;
  getVendorPerformance: (vendorId: string) => {
    score: number;
    completedJobs: number;
    averageRating: number;
    onTimeCompletion: number;
    badges: string[];
  };
  getStats: () => {
    totalComplaints: number;
    pendingComplaints: number;
    awaitingVotesComplaints: number;
    assignedComplaints: number;
    resolvedComplaints: number;
    confirmedComplaints: number;
    harassmentComplaints: number;
    urgentComplaints: number;
    totalFundsPool: number;
    totalEarned: number;
    totalUpvotes: number;
    avgResolutionTime: number;
  };
  categorizeComplaint: (description: string, title: string) => ComplaintCategory;
  detectPriority: (description: string, category: ComplaintCategory) => ComplaintPriority;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Initial demo data
const DEMO_USERS: User[] = [
  { 
    id: '1', 
    email: 'admin@blockfix.com', 
    name: 'Admin User', 
    role: 'admin', 
    walletBalance: 1000,
    rewardPoints: 0 
  },
  { 
    id: '2', 
    email: 'student@test.com', 
    name: 'John Student', 
    role: 'student', 
    walletBalance: 100,
    rewardPoints: 0 
  },
  { 
    id: '3', 
    email: 'vendor@test.com', 
    name: 'Jane Vendor', 
    role: 'vendor', 
    walletBalance: 50,
    performanceScore: 100,
    badges: [],
    rewardPoints: 0 
  },
  { 
    id: '4', 
    email: 'counselor@test.com', 
    name: 'Dr. Smith', 
    role: 'counselor', 
    walletBalance: 0,
    rewardPoints: 0 
  },
];

const PASSWORDS: Record<string, string> = {
  'admin@blockfix.com': 'admin123',
  'student@test.com': 'student123',
  'vendor@test.com': 'vendor123',
  'counselor@test.com': 'counselor123',
};

// Demo complaints for initial data
const DEMO_COMPLAINTS: Complaint[] = [
  {
    id: 'demo1',
    title: 'WiFi not working in hostel block A',
    description: 'The WiFi connection has been down for 3 days in Block A. Students cannot attend online classes.',
    location: 'Hostel Block A',
    category: 'infrastructure',
    priority: 'high',
    status: 'pending',
    studentId: '2',
    studentName: 'John Student',
    depositAmount: 0,
    upvotes: 7,
    upvotedBy: ['2'],
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    photoUrl: '',
    language: 'en-US',
    fundsReleased: false,
    ratings: [],
  },
  {
    id: 'demo2',
    title: 'Mess food quality poor',
    description: 'The food quality in the mess has deteriorated significantly. Many students are complaining about undercooked meals.',
    location: 'College Mess',
    category: 'mess',
    priority: 'medium',
    status: 'pending',
    studentId: '2',
    studentName: 'John Student',
    depositAmount: 0,
    upvotes: 6,
    upvotedBy: ['2'],
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    photoUrl: '',
    language: 'en-US',
    fundsReleased: false,
    ratings: [],
  },
  {
    id: 'demo3',
    title: 'Bathroom plumbing issue',
    description: 'Water leakage in the 2nd floor bathroom. The floor is always wet and slippery.',
    location: 'Hostel Block B, 2nd Floor',
    category: 'hygiene',
    priority: 'high',
    status: 'awaiting_votes',
    studentId: '2',
    studentName: 'John Student',
    depositAmount: 0,
    upvotes: 3,
    upvotedBy: ['2'],
    timestamp: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
    photoUrl: '',
    language: 'en-US',
    fundsReleased: false,
    ratings: [],
  },
];

// Keyword-based AI categorization
const CATEGORY_KEYWORDS: Record<ComplaintCategory, string[]> = {
  mess: ['food', 'mess', 'dining', 'meal', 'canteen', 'cafeteria', 'kitchen', 'taste', 'hygiene food', 'menu'],
  infrastructure: ['room', 'building', 'wifi', 'electricity', 'water', 'plumbing', 'ac', 'fan', 'furniture', 'repair', 'maintenance', 'broken', 'damaged'],
  harassment: ['harassment', 'bully', 'threat', 'abuse', 'assault', 'misbehavior', 'inappropriate', 'unsafe', 'ragging', 'discrimination'],
  hygiene: ['clean', 'dirty', 'washroom', 'toilet', 'bathroom', 'sanitation', 'garbage', 'smell', 'pest'],
  security: ['security', 'safety', 'guard', 'entry', 'gate', 'theft', 'lost', 'stolen', 'unauthorized'],
  academic: ['class', 'professor', 'teacher', 'exam', 'assignment', 'grade', 'course', 'lab', 'library', 'books'],
  other: []
};

const URGENT_KEYWORDS = ['urgent', 'emergency', 'immediate', 'critical', 'severe', 'danger', 'serious'];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [complaints, setComplaints] = useState<Complaint[]>(DEMO_COMPLAINTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>(PASSWORDS);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('blockfix_user');
    const savedUsers = localStorage.getItem('blockfix_users');
    const savedComplaints = localStorage.getItem('blockfix_complaints');
    const savedTransactions = localStorage.getItem('blockfix_transactions');
    const savedPasswords = localStorage.getItem('blockfix_passwords');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Initialize with demo users if no saved data
      localStorage.setItem('blockfix_users', JSON.stringify(DEMO_USERS));
    }
    if (savedComplaints) {
      const loadedComplaints = JSON.parse(savedComplaints);
      // If there are no complaints, initialize with demo complaints
      if (loadedComplaints.length === 0) {
        setComplaints(DEMO_COMPLAINTS);
        localStorage.setItem('blockfix_complaints', JSON.stringify(DEMO_COMPLAINTS));
      } else {
        // Migrate old complaints to ensure all required fields exist
        const migratedComplaints = loadedComplaints.map((c: any) => ({
          ...c,
          ratings: Array.isArray(c.ratings) ? c.ratings : [],
          averageRating: c.averageRating || 0,
        }));
        setComplaints(migratedComplaints);
        localStorage.setItem('blockfix_complaints', JSON.stringify(migratedComplaints));
      }
    } else {
      // Initialize with demo complaints if no saved data
      setComplaints(DEMO_COMPLAINTS);
      localStorage.setItem('blockfix_complaints', JSON.stringify(DEMO_COMPLAINTS));
    }
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedPasswords) {
      setPasswords(JSON.parse(savedPasswords));
    } else {
      // Initialize with demo passwords if no saved data
      localStorage.setItem('blockfix_passwords', JSON.stringify(PASSWORDS));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('blockfix_users', JSON.stringify(users));
    localStorage.setItem('blockfix_complaints', JSON.stringify(complaints));
    localStorage.setItem('blockfix_transactions', JSON.stringify(transactions));
    localStorage.setItem('blockfix_passwords', JSON.stringify(passwords));
  }, [users, complaints, transactions, passwords]);

  // Sync logged-in user with users array when users change
  useEffect(() => {
    if (user) {
      const updatedUser = users.find(u => u.id === user.id);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('blockfix_user', JSON.stringify(updatedUser));
      }
    }
  }, [users]);

  const login = async (email: string, password: string) => {
    // Get fresh data from localStorage
    const savedUsers = localStorage.getItem('blockfix_users');
    const savedComplaints = localStorage.getItem('blockfix_complaints');
    const savedTransactions = localStorage.getItem('blockfix_transactions');
    
    const currentUsers = savedUsers ? JSON.parse(savedUsers) : users;
    const currentComplaints = savedComplaints ? JSON.parse(savedComplaints) : complaints;
    const currentTransactions = savedTransactions ? JSON.parse(savedTransactions) : transactions;
    
    const foundUser = currentUsers.find((u: User) => u.email === email);
    if (!foundUser || passwords[email] !== password) {
      throw new Error('Invalid email or password');
    }
    
    // Update local state with fresh data
    setUsers(currentUsers);
    setComplaints(currentComplaints);
    setTransactions(currentTransactions);
    setUser(foundUser);
    toast.success(`Welcome back, ${foundUser.name}!`);
  };

  const signup = async (email: string, password: string, name: string, role: 'student' | 'vendor') => {
    // Get fresh data from localStorage to ensure we have all existing data
    const savedUsers = localStorage.getItem('blockfix_users');
    const savedComplaints = localStorage.getItem('blockfix_complaints');
    const savedTransactions = localStorage.getItem('blockfix_transactions');
    
    const currentUsers = savedUsers ? JSON.parse(savedUsers) : users;
    const currentComplaints = savedComplaints ? JSON.parse(savedComplaints) : complaints;
    const currentTransactions = savedTransactions ? JSON.parse(savedTransactions) : transactions;
    
    if (currentUsers.find((u: User) => u.email === email)) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      walletBalance: role === 'student' ? 100 : 50,
      performanceScore: role === 'vendor' ? 100 : undefined,
      badges: role === 'vendor' ? [] : undefined,
      rewardPoints: 0,
    };

    // Update state with all existing data plus the new user
    setUsers([...currentUsers, newUser]);
    setComplaints(currentComplaints);
    setTransactions(currentTransactions);
    setPasswords(prev => ({ ...prev, [email]: password }));
    setUser(newUser);
    
    // Send registration email
    simulateEmailNotification('registration', email, {
      name,
      role,
      id: newUser.id,
    });
    
    toast.success('Account created successfully!');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('blockfix_user');
    toast.info('Logged out successfully');
  };

  // AI-based categorization
  const categorizeComplaint = (description: string, title: string): ComplaintCategory => {
    const text = `${title} ${description}`.toLowerCase();
    
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (category === 'other') continue;
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return category as ComplaintCategory;
        }
      }
    }
    
    return 'other';
  };

  // AI-based priority detection
  const detectPriority = (description: string, category: ComplaintCategory): ComplaintPriority => {
    const text = description.toLowerCase();
    
    // Harassment is always urgent
    if (category === 'harassment') return 'urgent';
    
    // Check for urgent keywords
    if (URGENT_KEYWORDS.some(keyword => text.includes(keyword))) {
      return 'urgent';
    }
    
    // Security and hygiene are high priority
    if (category === 'security' || category === 'hygiene') return 'high';
    
    // Infrastructure and mess are medium
    if (category === 'infrastructure' || category === 'mess') return 'medium';
    
    return 'low';
  };

  const raiseComplaint = (
    title: string, 
    description: string, 
    location: string, 
    photoUrl: string, 
    category: ComplaintCategory,
    language: string,
    voiceNoteUrl?: string
  ) => {
    if (!user) return;

    const defaultDeposit = 10;
    if (user.walletBalance < defaultDeposit) {
      toast.error('Insufficient balance');
      return;
    }

    // Auto-categorize if category is 'other'
    const finalCategory = category === 'other' ? categorizeComplaint(description, title) : category;
    
    // Detect priority
    const priority = detectPriority(description, finalCategory);
    const isUrgent = priority === 'urgent';

    // Harassment complaints go directly to admin
    const initialStatus = finalCategory === 'harassment' ? 'pending' : 'awaiting_votes';

    const newComplaint: Complaint = {
      id: Date.now().toString(),
      studentId: user.id,
      studentName: user.name,
      title,
      description,
      location,
      photoUrl,
      voiceNoteUrl,
      language,
      category: finalCategory,
      priority,
      depositAmount: defaultDeposit,
      timestamp: Date.now(),
      status: initialStatus,
      upvotes: 0,
      upvotedBy: [],
      fundsReleased: false,
      ratings: [],
      needsCounseling: finalCategory === 'harassment',
      counselingAccepted: false,
      aiSentiment: priority,
      isUrgent,
    };

    setComplaints(prev => [...prev, newComplaint]);

    // Deduct from user's wallet
    setUsers(prev => prev.map(u => 
      u.id === user.id ? { ...u, walletBalance: u.walletBalance - defaultDeposit } : u
    ));
    setUser(prev => prev ? { ...prev, walletBalance: prev.walletBalance - defaultDeposit } : null);

    // Add transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'deposit',
      complaintId: newComplaint.id,
      amount: defaultDeposit,
      from: user.id,
      to: 'escrow',
      timestamp: Date.now(),
      description: `Complaint deposit: ${title}`,
    };
    setTransactions(prev => [...prev, transaction]);

    if (finalCategory === 'harassment') {
      toast.success('Complaint raised and sent to admin team. Counseling support available.');
    } else {
      toast.success(`Complaint raised! Needs 5 upvotes to be visible to vendors. (Priority: ${priority})`);
    }
  };

  const upvoteComplaint = (complaintId: string) => {
    if (!user) return;

    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        if (c.upvotedBy.includes(user.id)) {
          toast.error('You have already upvoted this complaint');
          return c;
        }
        
        const newUpvotes = c.upvotes + 1;
        const newStatus = newUpvotes >= 5 && c.status === 'awaiting_votes' ? 'pending' as const : c.status;
        
        if (newUpvotes === 5) {
          toast.success('Complaint has reached 5 upvotes! Now visible to vendors.');
        }
        
        return {
          ...c,
          upvotes: newUpvotes,
          upvotedBy: [...c.upvotedBy, user.id],
          status: newStatus,
        };
      }
      return c;
    }));

    toast.success('Complaint upvoted!');
  };

  const getMyComplaints = () => {
    if (!user) return [];
    return complaints.filter(c => c.studentId === user.id);
  };

  const getAllComplaints = () => {
    return complaints;
  };

  const getVendorComplaints = () => {
    if (!user) return [];
    // Vendors only see complaints assigned to them OR complaints that are pending with 5+ upvotes
    return complaints.filter(c => 
      c.assignedVendorId === user.id || 
      (c.status === 'pending' && c.upvotes >= 5 && c.category !== 'harassment')
    );
  };

  const getHarassmentComplaints = () => {
    return complaints.filter(c => c.category === 'harassment');
  };

  const assignVendor = (complaintId: string, vendorId: string, allocatedAmount: number) => {
    const vendor = users.find(u => u.id === vendorId);
    if (!vendor) return;

    const deadline = Date.now() + (48 * 60 * 60 * 1000); // 48 hours

    setComplaints(prev => prev.map(c => 
      c.id === complaintId 
        ? { 
            ...c, 
            status: 'assigned' as const, 
            assignedVendorId: vendorId, 
            assignedVendorName: vendor.name,
            allocatedAmount,
            resolutionDeadline: deadline,
          }
        : c
    ));

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'assignment',
      complaintId,
      amount: allocatedAmount,
      from: 'admin',
      to: vendorId,
      timestamp: Date.now(),
      description: `Vendor assigned with $${allocatedAmount} allocation`,
    };
    setTransactions(prev => [...prev, transaction]);

    toast.success('Vendor assigned successfully with fund allocation!');
  };

  const assignCounselor = (complaintId: string, counselorId: string) => {
    const counselor = users.find(u => u.id === counselorId);
    if (!counselor) return;

    setComplaints(prev => prev.map(c => 
      c.id === complaintId 
        ? { ...c, assignedCounselorId: counselorId }
        : c
    ));

    toast.success('Counselor assigned to harassment case');
  };

  const acceptCounseling = (complaintId: string) => {
    setComplaints(prev => prev.map(c => 
      c.id === complaintId 
        ? { ...c, counselingAccepted: true }
        : c
    ));

    toast.success('Counseling session will be scheduled');
  };

  const updateComplaintStatus = (complaintId: string, status: Complaint['status']) => {
    setComplaints(prev => prev.map(c => 
      c.id === complaintId ? { ...c, status } : c
    ));
  };

  const resolveComplaint = (complaintId: string, proofUrl: string) => {
    const complaint = complaints.find(c => c.id === complaintId);
    
    setComplaints(prev => prev.map(c => 
      c.id === complaintId 
        ? { 
            ...c, 
            status: 'resolved' as const, 
            proofUrl,
            completedAt: Date.now(),
          }
        : c
    ));

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'resolution',
      complaintId,
      amount: 0,
      from: user?.id || '',
      to: 'student',
      timestamp: Date.now(),
      description: `Complaint marked as resolved`,
    };
    setTransactions(prev => [...prev, transaction]);

    // Send resolution email to the student
    if (complaint) {
      const student = users.find(u => u.id === complaint.studentId);
      if (student) {
        simulateEmailNotification('resolution', student.email, {
          name: student.name,
          title: complaint.title,
          id: complaint.id,
          category: complaint.category,
          resolution: proofUrl,
        });
      }
    }

    toast.success('Complaint marked as resolved! Student notified via email.');
  };

  const confirmResolution = (complaintId: string) => {
    setComplaints(prev => prev.map(c => 
      c.id === complaintId 
        ? { ...c, status: 'confirmed' as const }
        : c
    ));

    toast.success('Resolution confirmed! Awaiting admin to release funds.');
  };

  const releaseFunds = (complaintId: string) => {
    const complaint = complaints.find(c => c.id === complaintId);
    if (!complaint || !complaint.assignedVendorId) return;

    const amountToRelease = complaint.allocatedAmount || complaint.depositAmount;

    // Check if resolved on time
    const onTime = complaint.completedAt && complaint.resolutionDeadline 
      ? complaint.completedAt <= complaint.resolutionDeadline
      : true;

    // Apply penalty if late
    let finalAmount = amountToRelease;
    if (!onTime) {
      finalAmount = Math.floor(amountToRelease * 0.8); // 20% penalty
      toast.warning('20% penalty applied for late resolution');
      applyPenalty(complaint.assignedVendorId, complaintId, amountToRelease - finalAmount);
    }

    setComplaints(prev => prev.map(c => 
      c.id === complaintId 
        ? { ...c, fundsReleased: true }
        : c
    ));

    // Transfer funds to vendor
    setUsers(prev => prev.map(u => 
      u.id === complaint.assignedVendorId 
        ? { ...u, walletBalance: u.walletBalance + finalAmount }
        : u
    ));

    // Update vendor performance
    if (onTime) {
      rewardVendor(complaint.assignedVendorId, 10);
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'payment',
      complaintId,
      amount: finalAmount,
      from: 'escrow',
      to: complaint.assignedVendorId,
      timestamp: Date.now(),
      description: `Payment released to vendor`,
    };
    setTransactions(prev => [...prev, transaction]);

    toast.success(`$${finalAmount} released to vendor!`);
  };

  const rateResolution = (complaintId: string, rating: number, comment: string) => {
    if (!user) return;

    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        const existingRatings = Array.isArray(c.ratings) ? c.ratings : [];
        const newRatings = [...existingRatings, { studentId: user.id, rating, comment, timestamp: Date.now() }];
        const avgRating = newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length;
        
        // Update vendor performance score based on rating
        if (c.assignedVendorId) {
          const scoreChange = rating >= 4 ? 5 : rating >= 3 ? 0 : -5;
          setUsers(prev => prev.map(u => 
            u.id === c.assignedVendorId && u.performanceScore
              ? { ...u, performanceScore: Math.max(0, Math.min(100, u.performanceScore + scoreChange)) }
              : u
          ));
        }
        
        return {
          ...c,
          ratings: newRatings,
          averageRating: avgRating,
        };
      }
      return c;
    }));

    toast.success('Rating submitted successfully!');
  };

  const addVendor = (email: string, name: string) => {
    if (users.find(u => u.email === email)) {
      toast.error('Email already registered');
      return;
    }

    const newVendor: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'vendor',
      walletBalance: 50,
      performanceScore: 100,
      badges: [],
      rewardPoints: 0,
    };

    setUsers(prev => [...prev, newVendor]);
    setPasswords(prev => ({ ...prev, [email]: 'vendor123' }));
    toast.success('Vendor added successfully! Default password: vendor123');
  };

  const addCounselor = (email: string, name: string) => {
    if (users.find(u => u.email === email)) {
      toast.error('Email already registered');
      return;
    }

    const newCounselor: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'counselor',
      walletBalance: 0,
      rewardPoints: 0,
    };

    setUsers(prev => [...prev, newCounselor]);
    setPasswords(prev => ({ ...prev, [email]: 'counselor123' }));
    toast.success('Counselor added successfully! Default password: counselor123');
  };

  const getVendors = () => {
    return users.filter(u => u.role === 'vendor');
  };

  const getCounselors = () => {
    return users.filter(u => u.role === 'counselor');
  };

  const hasUserUpvoted = (complaintId: string) => {
    if (!user) return false;
    const complaint = complaints.find(c => c.id === complaintId);
    return complaint?.upvotedBy.includes(user.id) || false;
  };

  const getTotalFundsPool = () => {
    return complaints
      .filter(c => !c.fundsReleased)
      .reduce((sum, c) => sum + c.depositAmount, 0);
  };

  const applyPenalty = (vendorId: string, complaintId: string, amount: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === vendorId && u.performanceScore) {
        const newScore = Math.max(0, u.performanceScore - 10);
        return { ...u, performanceScore: newScore };
      }
      return u;
    }));

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'penalty',
      complaintId,
      amount,
      from: vendorId,
      to: 'system',
      timestamp: Date.now(),
      description: `Penalty for late resolution`,
    };
    setTransactions(prev => [...prev, transaction]);
  };

  const rewardVendor = (vendorId: string, points: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === vendorId) {
        const newPoints = (u.rewardPoints || 0) + points;
        const newBadges = [...(u.badges || [])];
        
        // Award badges based on points
        if (newPoints >= 100 && !newBadges.includes('Gold Star')) {
          newBadges.push('Gold Star');
          toast.success('🏆 Vendor earned Gold Star badge!');
        } else if (newPoints >= 50 && !newBadges.includes('Silver Star')) {
          newBadges.push('Silver Star');
          toast.success('🥈 Vendor earned Silver Star badge!');
        }
        
        return { ...u, rewardPoints: newPoints, badges: newBadges };
      }
      return u;
    }));

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'reward',
      complaintId: '',
      amount: points,
      from: 'system',
      to: vendorId,
      timestamp: Date.now(),
      description: `Reward points for excellent service`,
    };
    setTransactions(prev => [...prev, transaction]);
  };

  const getVendorPerformance = (vendorId: string) => {
    const vendor = users.find(u => u.id === vendorId);
    const vendorComplaints = complaints.filter(c => c.assignedVendorId === vendorId);
    const completedJobs = vendorComplaints.filter(c => c.status === 'confirmed').length;
    const onTimeJobs = vendorComplaints.filter(c => 
      c.completedAt && c.resolutionDeadline && c.completedAt <= c.resolutionDeadline
    ).length;
    
    const allRatings = vendorComplaints.flatMap(c => c.ratings || []).filter(r => r && typeof r.rating === 'number');
    const averageRating = allRatings.length > 0 
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length 
      : 0;

    return {
      score: vendor?.performanceScore || 0,
      completedJobs,
      averageRating,
      onTimeCompletion: completedJobs > 0 ? Math.round((onTimeJobs / completedJobs) * 100) : 0,
      badges: vendor?.badges || [],
    };
  };

  const getStats = () => {
    const totalComplaints = complaints.length;
    const awaitingVotesComplaints = complaints.filter(c => c.status === 'awaiting_votes').length;
    const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
    const assignedComplaints = complaints.filter(c => c.status === 'assigned' || c.status === 'in_progress').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
    const confirmedComplaints = complaints.filter(c => c.status === 'confirmed').length;
    const harassmentComplaints = complaints.filter(c => c.category === 'harassment').length;
    const urgentComplaints = complaints.filter(c => c.isUrgent).length;
    const totalFundsPool = getTotalFundsPool();
    const totalEarned = user?.role === 'vendor' 
      ? complaints.filter(c => c.assignedVendorId === user.id && c.fundsReleased).reduce((sum, c) => sum + (c.allocatedAmount || c.depositAmount), 0)
      : 0;
    const totalUpvotes = complaints.reduce((sum, c) => sum + c.upvotes, 0);
    
    const completedComplaints = complaints.filter(c => c.status === 'confirmed' && c.completedAt);
    const avgResolutionTime = completedComplaints.length > 0
      ? completedComplaints.reduce((sum, c) => sum + (c.completedAt! - c.timestamp), 0) / completedComplaints.length / (1000 * 60 * 60)
      : 0;

    return {
      totalComplaints,
      pendingComplaints,
      awaitingVotesComplaints,
      assignedComplaints,
      resolvedComplaints,
      confirmedComplaints,
      harassmentComplaints,
      urgentComplaints,
      totalFundsPool,
      totalEarned,
      totalUpvotes,
      avgResolutionTime,
    };
  };

  const value: AuthContextType = {
    user,
    users,
    complaints,
    transactions,
    login,
    signup,
    logout,
    raiseComplaint,
    upvoteComplaint,
    getMyComplaints,
    getAllComplaints,
    getVendorComplaints,
    getHarassmentComplaints,
    assignVendor,
    assignCounselor,
    acceptCounseling,
    updateComplaintStatus,
    resolveComplaint,
    confirmResolution,
    releaseFunds,
    rateResolution,
    addVendor,
    addCounselor,
    getVendors,
    getCounselors,
    hasUserUpvoted,
    getTotalFundsPool,
    applyPenalty,
    rewardVendor,
    getVendorPerformance,
    getStats,
    categorizeComplaint,
    detectPriority,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
