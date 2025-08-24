export * from './Profile';
export * from './Relationship';
export * from './Journal';
export * from './Consent';



export interface AuthState {
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