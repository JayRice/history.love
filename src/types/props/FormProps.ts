import User from '../User';

export default interface FormProps {
  updateFormUser: <K extends keyof User>(key: K | string, value: User[K] | string) => void;
  formUser: User | null;
}