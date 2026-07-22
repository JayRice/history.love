import FormProps from "./FormProps"
export default interface ProfileFormProps extends FormProps {
  // null was never passed in practice; typed to match the useState<boolean>
  // setter that OnboardingScreen actually provides.
  usernameTaken?: boolean;
  setUsernameTaken?: (isUsernameTaken: boolean) => void;
}
