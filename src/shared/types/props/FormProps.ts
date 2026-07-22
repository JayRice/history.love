import User from '../User';

export default interface FormProps {
  // Path-based setter ("profile.birthday", "partner.goals", ...). Values are
  // heterogeneous (dates, arrays, booleans, objects); the implementation in
  // OnboardingScreen is (key: string, value: any). Typed to match reality.
  updateFormUser: (key: string, value: unknown) => void;
  formUser: User | null;
}