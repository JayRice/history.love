export * from './Profile';
export * from './Relationship';
export * from './Journal';
export * from './Consent';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  profileComplete: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type NavigationParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: undefined;
  Timeline: undefined;
  Journal: undefined;
  ConsentVerification: undefined;
  Settings: undefined;
};