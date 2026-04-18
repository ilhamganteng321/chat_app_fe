// components/ui/Toast.jsx
import { useEffect, useState } from "react";

const ICONS = {
  success: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  error: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warning: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.332 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  ),
  info: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

// Icon untuk tombol close
const XMarkIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const COLORS = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    icon: "text-emerald-500",
    progress: "bg-emerald-500",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon: "text-red-500",
    progress: "bg-red-500",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    icon: "text-amber-500",
    progress: "bg-amber-500",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: "text-blue-500",
    progress: "bg-blue-500",
  },
};

function Toast({
  id,
  title,
  message,
  type = "success",
  onClose,
  duration = 3000,
  autoClose = true,
}) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  const Icon = ICONS[type];
  const colors = COLORS[type];

  useEffect(() => {
    if (!autoClose) return;

    const startTime = Date.now();
    const interval = 50; // Update setiap 50ms untuk animasi smooth
    const totalSteps = duration / interval;
    const stepPercentage = 100 / totalSteps;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        clearInterval(timer);
        handleClose();
      } else {
        setProgress(100 - (elapsed / duration) * 100);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [duration, autoClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.(id);
    }, 300); // Tunggu animasi keluar selesai
  };

  return (
    <div
      className={`
        relative w-80 bg-white rounded-xl shadow-lg border ${colors.border}
        transform transition-all duration-300
        ${isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
        animate-in slide-in-from-right fade-in
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Progress Bar */}
      {autoClose && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-xl overflow-hidden">
          <div
            className={`h-full ${colors.progress} transition-all duration-50`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${colors.icon}`}>
            <Icon className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold ${colors.text}`}>{title}</h3>
            {message && (
              <p className="mt-1 text-sm text-gray-600 break-words">
                {message}
              </p>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-gray-600 
                     hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close toast"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toast;
