// hooks/useToast.js

import { useToastContext } from "../provider/ToastProvider.jsx";


export function useToast() {
    const toast = useToastContext();

    return {
        toast: toast.addToast,
        success: toast.success,
        error: toast.error,
        info: toast.info,
        warning: toast.warning,
        dismiss: toast.dismiss,
        dismissAll: toast.dismissAll,
    };
}