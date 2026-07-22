import loginWithApple from '@/src/database/auth/loginWithApple';
import loginWithEmail from '@/src/database/auth/loginWithEmail';

import { registerFcmToken } from '@/src/database/messaging/handleFcmMessaging';
import { useState } from 'react';
import { useGoogleLogin } from '@/src/hooks/useGoogleLogin';
import signupWithEmail from '@/src/database/auth/signupWithEmail';




type UseLogin = {
  loading: boolean   ;
  error: string | null;
  login: ( type: "google" | "email-login"| "email-signup" | "apple", email?: string, password?: string) => any;
};
export default  function useLogin() : UseLogin  {



  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  let {signInWithGoogle} = useGoogleLogin();


  async function login ( type: "google" | "email-login"| "email-signup" | "apple", email?: string, password?: string) {
    let response : any;

    setLoading(true);
    if (type == "google") {
      response = await signInWithGoogle()
    }else if (type == "apple" ){
      response = await loginWithApple()
    }else if (email && password){
      if (type==="email-login"){
        response = await loginWithEmail(email, password)
      }else if (type==="email-signup"){
        response = await signupWithEmail(email, password)
      }
    }

    if (response.success){
      await registerFcmToken(response.user.uid)
    }else if (response.error){
      setError(error)
    }


    setLoading(false);
    return response;
  }

  return {login, loading, error};


}