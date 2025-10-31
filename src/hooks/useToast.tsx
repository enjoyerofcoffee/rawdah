import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const DEFAULT_WAITING_TIME = 2000; // 2 seconds

export const useToast = () => {
  const [message, setMessage] = useState<string>();
  const [show, setShow] = useState(false);
  const [container] = useState(() => document.createElement("div"));

  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  const sendMessage = (msg: string) => {
    setMessage(msg);
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, DEFAULT_WAITING_TIME);
  };

  const ToastComponent = show
    ? createPortal(
        <div className="toast toast-top toast-end">
          <div className="alert alert-success">
            <span>{message}</span>
          </div>
        </div>,
        container
      )
    : null;

  return { ToastHolder: ToastComponent, sendMessage };
};
