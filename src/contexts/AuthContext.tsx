import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '@/src/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Mock login - replace with real authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password) {
        const mockUser: User = {
          id: '1',
          email,
          username: email.split('@')[0],
          firstName: 'Demo',
          lastName: 'User',
          createdAt: new Date().toISOString(),
          profileComplete: true,
        };

        await AsyncStorage.setItem('auth_token', 'mock_token');
        await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
        return true;
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Mock registration - replace with real authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        createdAt: new Date().toISOString(),
        profileComplete: false,
      };

      await AsyncStorage.setItem('auth_token', 'mock_token');
      await AsyncStorage.setItem('user_data', JSON.stringify(newUser));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: newUser });
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext }