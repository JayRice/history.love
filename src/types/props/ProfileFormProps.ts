import FormProps from "./FormProps"
export default interface ProfileFormProps extends FormProps {
  usernameTaken?: boolean | null;
  setUsernameTaken?: (isUsernameTaken: boolean | null) => void;
}
