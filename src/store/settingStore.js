import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useSettingStore = create(persist(
    (set) => ({
        notify: false,
        fcmToken: null,

        setNotify: (value) => set({ notify: value }),
        setFcmToken: (token) => set({ fcmToken: token }),
    }),
    {
        name: "setting-storage", // Nama key di localStorage
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ notify: state.notify }), // Hanya simpan 'user', isLoading tidak perlu
    }));