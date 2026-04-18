import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { axiosInstance } from "../utiils/axios.js";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isLoading: false,
            isCheckingAuth: false,
            error: null,

            login: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await axiosInstance.post('/api/auth/login', data);
                    if (res.status === 200) {
                        set({ user: res.data, isLoading: false });
                    }
                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Login failed';
                    set({ error: message, isLoading: false });
                    return { success: false, message };
                }
            },

            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await axiosInstance.post('/api/auth/register', data);
                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Registration failed';
                    set({ error: message, isLoading: false });
                    return { success: false, message };
                }
            },

            logout: async () => {
                try {
                    // 1. Panggil backend untuk menghapus cookie (res.clearCookie)
                    await axiosInstance.post("/api/auth/logout");
                } catch (error) {
                    console.error("Logout error:", error);
                } finally {
                    // 2. Apapun hasilnya, hapus user dari state
                    // Karena ada middleware 'persist', ini otomatis menghapus data di localStorage
                    set({ user: null, error: null });
                }
            },
            checkAuth: async () => {
                try {
                    const res = await axiosInstance.get("/api/auth/me");
                    console.log(res.data)
                    if (res.status === 200) {
                        set({
                            user: res.data, // 🔥 ambil data.user
                            isCheckingAuth: false
                        });
                    }
                } catch (error) {
                    set({ user: null, isCheckingAuth: false });
                }
            },
        }),
        {
            name: "auth-storage", // Nama key di localStorage
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ user: state.user }), // Hanya simpan 'user', isLoading tidak perlu
        }
    )
);