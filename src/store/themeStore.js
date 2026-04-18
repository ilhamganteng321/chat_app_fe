import { create } from "zustand";
import { THEMES } from "../constant/theme";

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("chat-theme") || "cupcake",
    setTheme: (theme) => {
        localStorage.setItem("chat-theme", theme);
        set({ theme });
    },
    switchTheme: () => {
        const randIndex = Math.floor(Math.random() * THEMES.length);
        const theme = THEMES[randIndex];
        localStorage.setItem("chat-theme", theme);
        set({ theme });
    }
}));