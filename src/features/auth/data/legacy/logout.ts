import { signOut } from "../authRepository";

export default async function logout() {
  await signOut();
}
