import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  organizationId: string | null;
  setAuth: (user: User, token: string) => void;
  setOrganization: (orgId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage if available
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('token');
    const storedOrgId = localStorage.getItem('organizationId');
    const storedUser = localStorage.getItem('user');
    
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      token: storedToken,
      organizationId: storedOrgId,
      setAuth: (user, token) => {
        set({ user, token });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      },
      setOrganization: (orgId) => {
        set({ organizationId: orgId });
        localStorage.setItem('organizationId', orgId);
      },
      logout: () => {
        set({ user: null, token: null, organizationId: null });
        localStorage.removeItem('token');
        localStorage.removeItem('organizationId');
        localStorage.removeItem('user');
      },
    };
  }
  
  return {
    user: null,
    token: null,
    organizationId: null,
    setAuth: (user, token) => {
      set({ user, token });
    },
    setOrganization: (orgId) => {
      set({ organizationId: orgId });
    },
    logout: () => {
      set({ user: null, token: null, organizationId: null });
    },
  };
});

