import {auth} from "@/src/config/firebase";

export function getAuthUser(){
  return auth.currentUser;
}