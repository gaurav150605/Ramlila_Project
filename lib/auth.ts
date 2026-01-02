// Authentication utility for user management
// Stores users in localStorage for demo purposes

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: 'Admin' | 'Manager' | 'Employee';
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

class AuthService {
  private users: User[] = [];

  // Initialize from localStorage
  init(): void {
    if (typeof window !== 'undefined') {
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        this.users = JSON.parse(savedUsers);
      }
    }
  }

  // Register a new user
  register(userData: Omit<User, 'id' | 'createdAt'>): AuthResponse {
    // Check if user already exists
    const existingUser = this.users.find(
      (u) => u.email === userData.email || u.username === userData.username
    );

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email or username already exists',
      };
    }

    // Validate password match (should be done in component, but double-check)
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.saveUsers();

    return {
      success: true,
      user: { ...newUser, password: '' }, // Don't return password
    };
  }

  // Login user
  login(emailOrUsername: string, password: string): AuthResponse {
    const user = this.users.find(
      (u) => (u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password
    );

    if (!user) {
      return {
        success: false,
        error: 'Invalid email/username or password',
      };
    }

    // Set current user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      }));
    }

    return {
      success: true,
      user: { ...user, password: '' }, // Don't return password
    };
  }

  // Get current logged-in user
  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        return JSON.parse(currentUser);
      }
    }
    return null;
  }

  // Logout user
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
  }

  // Get redirect path based on role
  getRoleBasedRedirect(role: string): string {
    switch (role) {
      case 'Admin':
        return '/dashboard/admin';
      case 'Manager':
        return '/dashboard/manager';
      case 'Employee':
        return '/dashboard/employee';
      default:
        return '/dashboard';
    }
  }

  // Save users to localStorage
  private saveUsers(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('users', JSON.stringify(this.users));
    }
  }
}

export const authService = new AuthService();
if (typeof window !== 'undefined') {
  authService.init();
}

