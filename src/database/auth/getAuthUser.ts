import {auth} from "@/src/shared/config/firebase";

export function getAuthUser(){
  return auth.currentUser;
}