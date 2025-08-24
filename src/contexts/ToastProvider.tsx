import { createContext, useContext, useState } from "react";
import { Snackbar } from "react-native-paper";

const ToastContext = createContext<(msg: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  const showToast = (msg: string) => {
    setMessage(msg);
    setVisible(true);
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Snackbar visible={visible} onDismiss={() => setVisible(false)} duration={2500}>
        {message}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);