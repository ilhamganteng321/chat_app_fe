import axios from "axios";

// Jika pakai Vite gunakan import.meta.env, jika CRA gunakan process.env
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Penting jika kamu menggunakan Cookies/Sessions
    headers: {
        'Content-Type': 'application/json',
    }
});