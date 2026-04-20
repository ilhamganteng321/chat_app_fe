import React, { useState } from "react";
import { useAuthStore } from "../store/authStore.js"; // Sesuaikan path store kamu
import { useToast } from "../hooks/toast.js";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { success } = useToast();
  const navigate = useNavigate();

  // Ambil fungsi login dan loading state dari Zustand
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login({ email, password });

    if (result.success) {
      success("berhasil login");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
  };

  const handleGoogleLogin = () => {
    // Arahkan langsung ke endpoint backend
    window.location.href =
      "https://chatapp-be-production-5dee.up.railway.app/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Selamat Datang Kembali
        </h2>

        {/* Alert Error jika login gagal */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black">
              Email
            </label>
            <input
              type="email"
              className="mt-1 block w-full px-4 py-2 border text-black border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">
              Password
            </label>
            <input
              type="password"
              className="mt-1 block w-full px-4 py-2 border text-black border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-semibold transition hover:cursor-pointer ${
              isLoading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {isLoading ? "Sedang Masuk..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Daftar sekarang
          </a>
          <button
            type="button" // Gunakan type button agar tidak men-submit form
            onClick={handleGoogleLogin}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-md border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition active:scale-95 hover:cursor-pointer"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              className="w-5 h-5"
              alt="Google"
            />
            Masuk dengan Google
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
