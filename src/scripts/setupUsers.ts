import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
    getAuth,
    createUserWithEmailAndPassword
} from 'firebase/auth';

const auth = getAuth();

const getRoleFromEmail = (email: string) => {
    if (email.endsWith('@security.com')) return 'security';
    if (email.endsWith('@faculty.com')) return 'faculty';
    if (email.endsWith('@admin.com')) return 'admin';
    return null;
};

const getDepartmentFromRole = (role: string) => {
    switch (role) {
        case 'security':
            return 'Security Department';
        case 'faculty':
            const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];
            return departments[Math.floor(Math.random() * departments.length)];
        case 'admin':
            return 'Administration';
        default:
            return 'General';
    }
};

export const createUser = async (email: string, password: string) => {
    try {
        const role = getRoleFromEmail(email);
        if (!role) {
            throw new Error('Invalid email domain. Must end with @security.com, @faculty.com, or @admin.com');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log(`✅ Created auth account for: ${email}`);

        const userDocRef = doc(db, 'users', email);
        await setDoc(userDocRef, {
            email: email,
            name: email.split('@')[0],
            role: role,
            department: getDepartmentFromRole(role),
            createdAt: new Date(),
            updatedAt: new Date()
        }, { merge: true });
        console.log(`✅ Added Firestore record for: ${email}`);

        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            success: true,
            message: `User created successfully with ${role} role`,
            userCredential: userCredential
        };
    } catch (error) {
        console.error('❌ Error creating user:', error);
        throw error;
    }
};

export const setupDefaultUsers = async () => {
    try {
        const defaultUsers = [
            { email: 'user1@security.com', password: '1234567890' },
            { email: 'user2@faculty.com', password: '1234567890' },
            { email: 'user3@admin.com', password: '1234567890' }
        ];

        for (const user of defaultUsers) {
            try {
                await createUser(user.email, user.password);
            } catch (error: any) {
                if (error.code === 'auth/email-already-in-use') {
                    console.log(`User ${user.email} already exists, skipping...`);
                } else {
                    throw error;
                }
            }
        }

        return {
            success: true,
            message: 'Setup completed! You can now login with these accounts or create new ones with appropriate email domains:\n\n' +
                'For Security Access: use @security.com\n' +
                'For Faculty Access: use @faculty.com\n' +
                'For Admin Access: use @admin.com\n\n' +
                'Default accounts:\n' +
                'Security: user1@security.com / 1234567890\n' +
                'Faculty: user2@faculty.com / 1234567890\n' +
                'Admin: user3@admin.com / 1234567890'
        };
    } catch (error) {
        console.error('❌ Error in setup:', error);
        throw error;
    }
}; 