import { useState } from "react";
import type { AlertType } from "../Alert/Alert";

export interface AlertState {
  message: string;
  type: AlertType;
}

export function useAlert() {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = (message: string, type: AlertType = "success") => {
    setAlert({
      message,
      type,
    });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  return {
    alert,
    showAlert,
    closeAlert,
  };
}
