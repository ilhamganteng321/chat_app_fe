import { useState } from "react";
import { getFcmToken } from "../utiils/firebase";
import { useSettingStore } from "../store/settingStore";
import { axiosInstance } from "../utiils/axios";
import { THEMES } from "../constant/theme";
import { useThemeStore } from "../store/themeStore";

const Setting = ({ onClose }) => {
  const { notify, setNotify, setFcmToken, fcmToken } = useSettingStore();
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useThemeStore();

  const handleToggle = async () => {
    if (!notify) {
      // 1. Minta izin notifikasi
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        alert("Izin notifikasi ditolak");
        return;
      }

      setLoading(true);

      // 2. Ambil token FCM
      const token = await getFcmToken();

      if (token) {
        try {
          // 🔥 3. Kirim ke backend
          await axiosInstance.patch("/api/user/fcm-token", {
            token,
          });

          // 🔥 4. Simpan ke state
          setFcmToken(token);
          setNotify(true);
        } catch (err) {
          console.error(err);
          alert("Gagal simpan token ke server");
        }
      } else {
        alert("Gagal mendapatkan token");
      }

      setLoading(false);
    } else {
      // 🔥 OFF notif
      try {
        await axiosInstance.patch("/api/user/fcm-token/remove", {
          token: fcmToken,
        });
      } catch (err) {
        console.error(err);
      }

      setNotify(false);
      setFcmToken(null);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <h1 className="text-xl font-semibold mb-4">Settings</h1>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
      >
        x
      </button>

      <div className="flex items-center justify-between">
        <span>Aktifkan Notifikasi</span>

        <button
          onClick={handleToggle}
          className={`w-14 h-8 flex items-center rounded-full p-1 transition ${
            notify ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <div
            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition ${
              notify ? "translate-x-6" : ""
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {THEMES.map((t) => (
          <button
            key={t}
            className={`
                group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
                ${theme === t ? "bg-base-200" : "hover:bg-base-200/50"}
              `}
            onClick={() => setTheme(t)}
          >
            <div
              className="relative h-8 w-full rounded-md overflow-hidden"
              data-theme={t}
            >
              <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                <div className="rounded bg-primary"></div>
                <div className="rounded bg-secondary"></div>
                <div className="rounded bg-accent"></div>
                <div className="rounded bg-neutral"></div>
              </div>
            </div>
            <span className="text-[11px] font-medium truncate w-full text-center">
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </span>
          </button>
        ))}
      </div>
      <button onClick={onClose}></button>

      {loading && <p className="text-sm mt-2">Mengambil token...</p>}
    </div>
  );
};

export default Setting;
