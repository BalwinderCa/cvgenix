import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

// Types
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token by fetching user profile
          const response = await api.get('/profiles/profiles/');
          
          if (response.data && response.data.results && response.data.results.length > 0) {
            // Get user data from the first profile
            const profile = response.data.results[0];
            const user: User = {
              id: profile.user,
              username: 'user', // We don't have username in profile data
              email: '',
              first_name: '',
              last_name: '',
              role: 'user',
              avatar: undefined,
            };
            
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, token },
            });
          } else {
            // If no profile exists, we can still be authenticated
            // Just create a basic user object
            const user: User = {
              id: 1, // Default user ID
              username: 'user',
              email: '',
              first_name: '',
              last_name: '',
              role: 'user',
              avatar: undefined,
            };
            
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, token },
            });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          dispatch({ type: 'AUTH_FAILURE' });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post('/auth/token/', {
        username,
        password,
      });

      const { access } = response.data;
      
      // Store token
      localStorage.setItem('token', access);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Fetch user data from the correct endpoint
      const userResponse = await api.get('/profiles/profiles/');
      
      if (userResponse.data && userResponse.data.results && userResponse.data.results.length > 0) {
        const profile = userResponse.data.results[0];
        const user: User = {
          id: profile.user,
          username: username, // Use the username from login
          email: '', // We'll get this from the auth response
          first_name: '',
          last_name: '',
          role: 'user',
          avatar: undefined,
        };
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token: access },
        });
        
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        // If no profile exists, create a basic user object and continue
        const user: User = {
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          first_name: response.data.user.first_name,
          last_name: response.data.user.last_name,
          role: response.data.user.role,
          avatar: response.data.user.avatar,
        };
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token: access },
        });
        
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      dispatch({ type: 'AUTH_FAILURE' });
      
      const errorMessage = error.response?.data?.detail || 'Login failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post('/auth/register/', userData);
      
      if (response.status === 201) {
        toast.success('Registration successful! Please log in.');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      dispatch({ type: 'AUTH_FAILURE' });
      
      const errorMessage = error.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
