import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { auth, db } from '../config/firebase';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
  fetchUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const usersList: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as User;
        usersList.push({
          ...userData,
          id: doc.id
        });
      });
      
      setUsers(usersList);
    } catch (err) {
      console.error('Error fetching users:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error fetching users';
      setError(errorMessage);
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.email!));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser(userData);
            // Fetch all users if the current user is an admin
            if (userData.role === 'admin') {
              await fetchUsers();
            }
          } else {
            // Try to find user by email in case the document ID is different
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', firebaseUser.email));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const userData = querySnapshot.docs[0].data() as User;
              setCurrentUser(userData);
              // Fetch all users if the current user is an admin
              if (userData.role === 'admin') {
                await fetchUsers();
              }
            } else {
              console.error('User data not found in Firestore');
              setCurrentUser(null);
              setError('User data not found. Please contact administrator.');
              await signOut(auth);
            }
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setCurrentUser(null);
          setError('Error loading user data. Please try again.');
        }
      } else {
        setCurrentUser(null);
        setUsers([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      // Sign in with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', email));
      
      if (!userDoc.exists()) {
        // Try to find user by email in case the document ID is different
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data() as User;
          setCurrentUser(userData);
          return userData;
        }
        
        throw new Error('User data not found');
      }
      
      const userData = userDoc.data() as User;
      setCurrentUser(userData);
      return userData;
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setCurrentUser(null);
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error during logout';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    currentUser,
    users,
    loading,
    error,
    login,
    logout,
    clearError,
    fetchUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};