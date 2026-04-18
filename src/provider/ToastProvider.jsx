// app/providers/ToastProvider.jsx

import { createContext, useContext, useState, useCallback } from "react";
import Toast from "../component/notif/Toast";

const ToastContext = createContext(null);

 const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};


export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const id = crypto.randomUUID();

  const addToast = useCallback((toast) => {
    const id = crypto.randomUUID();

    const newToast = {
      id,
      title: toast.title,
      message: toast.message,
      type: toast.type || "success",
      duration: toast.duration || 3000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message, options = {}) => {
      return addToast({
        title: "Success",
        message,
        type: "success",
        ...options,
      });
    },
    [addToast],
  );

  const error = useCallback(
    (message, options = {}) => {
      return addToast({
        title: "Error",
        message,
        type: "error",
        ...options,
      });
    },
    [addToast],
  );

  const info = useCallback(
    (message, options = {}) => {
      return addToast({
        title: "Info",
        message,
        type: "info",
        ...options,
      });
    },
    [addToast],
  );

  const warning = useCallback(
    (message, options = {}) => {
      return addToast({
        title: "Warning",
        message,
        type: "warning",
        ...options,
      });
    },
    [addToast],
  );

  const dismiss = useCallback(
    (id) => {
      removeToast(id);
    },
    [removeToast],
  );

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        success,
        error,
        info,
        warning,
        dismiss,
        dismissAll,
        addToast,
      }}
    >
      {children}

      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export { useToastContext }
