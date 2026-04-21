// Sidebar.jsx
import { useEffect, useState } from "react";
import { axiosInstance } from "../utiils/axios";
import { RequestPopup } from "./RequestPopUp";
import { useToast } from "../hooks/toast.js";
import { useAuthStore } from "../store/authStore";
import { useSocketStore } from "../store/socketStore";
import TypingIndicator from "./typing/Typing-indicator";

export const Sidebar = ({
  onSelectChat,
  selectedChatId,
  onOpenProfile,
  onSettingProfile,
}) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isRequestPopupOpen, setIsRequestPopupOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const { success, error } = useToast();
  const { user, logout } = useAuthStore();
  const [openDropdown, setOpenDropdown] = useState(false);
  const { isUserOnline, isUserTyping } = useSocketStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?.data?._id) {
      isUserOnline(user?.data?._id);
    }
    const close = () => setOpenDropdown(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    const name = chat.userId.name?.toLowerCase() || "";
    const email = chat.userId.email?.toLowerCase() || "";
    return name.includes(searchLower) || email.includes(searchLower);
  });

  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };
  // Tetap pakai gradient warna-warni untuk avatar contact (bukan DaisyUI token)
  // supaya tiap contact punya warna unik, bukan semua sama
  const getAvatarColor = (name) => {
    const colors = [
      "from-blue-400 to-indigo-600",
      "from-rose-400 to-pink-600",
      "from-sky-400 to-cyan-500",
      "from-emerald-400 to-teal-500",
      "from-fuchsia-400 to-purple-600",
      "from-violet-400 to-purple-500",
      "from-amber-400 to-orange-500",
      "from-pink-400 to-rose-500",
      "from-indigo-400 to-blue-600",
      "from-yellow-400 to-amber-500",
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const getListContactChat = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/contacts-list");
      console.log(res.data.data);
      if (res.status === 200) {
        setChats(res.data.data);
      } else {
        throw new Error("failed get list chat");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = async (userId) => {
    console.log(userId);
    console.log("ini kepanggil");

    try {
      const res = await axiosInstance.patch("/api/message", {
        sender: userId,
      });
      if (res.status === 200) {
        // Optional: update unreadCount di local state
        setChats((prev) =>
          prev.map((chat) =>
            chat.userId._id === userId ? { ...chat, unreadCount: 0 } : chat,
          ),
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChatClick = (chat) => {
    onSelectChat(chat);
    handleOpenChat(chat.userId._id);
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/api/contacts", { email });
      if (res.status === 200 || res.status === 201) {
        await getListContactChat();
        setIsPopupOpen(false);
        setEmail("");
        success("Berhasil permintaan kontak");
      }
    } catch (err) {
      error("failed to add contact or wrong email");
    } finally {
      setSubmitting(false);
    }
  };

  const getRequestCount = async () => {
    try {
      const res = await axiosInstance.get("/api/contacts");
      const data = res.data.data;
      const normalized = Array.isArray(data) ? data : [data];
      const pendingCount = normalized.filter(
        (req) => req.status === "Pending",
      ).length;
      setRequestCount(pendingCount);
    } catch (error) {
      console.error("Error getting request count:", error);
    }
  };

  useEffect(() => {
    getListContactChat();
    getRequestCount();
  }, []);

  const handleRequestProcessed = () => {
    getListContactChat();
    getRequestCount();
  };

  return (
    <>
      <div className="w-full md:w-80 h-full bg-base-100 flex flex-col relative">
        {/* Header */}
        <div className="px-5 py-4 border-b border-base-300 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-bold text-primary">ChatApp</h1>

          <div className="flex items-center gap-1">
            {/* Add Contact */}
            <button
              onClick={() => setIsPopupOpen(true)}
              className="btn btn-ghost btn-sm btn-circle text-base-content/50"
              title="Add Contact"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>

            {/* Contact Requests */}
            <button
              onClick={() => setIsRequestPopupOpen(true)}
              className="btn btn-ghost btn-sm btn-circle text-base-content/50 relative"
              title="Contact Requests"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {requestCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 badge badge-error badge-xs text-white font-bold min-w-4.5 h-4.5 p-0 flex items-center justify-center text-[10px]">
                  {requestCount > 9 ? "9+" : requestCount}
                </span>
              )}
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(!openDropdown);
                }}
                className="w-9 h-9 rounded-full bg-primary text-primary-content flex items-center justify-center cursor-pointer font-semibold text-sm shadow-sm"
              >
                {getInitials(user?.data?.name) || "tamu"}
              </div>

              {openDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-base-100 border border-base-300 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-base-content hover:bg-base-200 transition flex items-center gap-2"
                    onClick={onOpenProfile}
                  >
                    <svg
                      className="w-4 h-4 text-base-content/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile
                  </button>
                  <button
                    onClick={onSettingProfile}
                    className="w-full text-left px-4 py-2.5 text-sm text-base-content hover:bg-base-200 transition flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-base-content/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </button>
                  <div className="divider my-0 h-px bg-base-300" />
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-error/10 transition flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-base-300">
          <div className="flex items-center gap-2 bg-base-200 rounded-xl px-3 py-2">
            <svg
              className="w-4 h-4 text-base-content/40 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="bg-transparent text-sm text-base-content placeholder:text-base-content/40 outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="btn btn-ghost btn-xs btn-circle text-base-content/40"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto sidebar-scroll">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <span className="loading loading-spinner loading-md text-primary"></span>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center mb-3">
                <svg
                  className="w-7 h-7 text-base-content/20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-base-content/60 text-sm font-medium">
                No chats yet
              </p>
              <p className="text-xs text-base-content/40 mt-1">
                Add a contact to start chatting
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isSelected = selectedChatId === chat._id;
              const online = isUserOnline(chat.userId._id);
              const typing = isUserTyping(chat.userId._id);

              return (
                <div
                  key={chat._id}
                  onClick={() => onSelectChat(chat)}
                  className={`px-4 py-3 cursor-pointer transition-all duration-150 flex items-center gap-3 ${
                    isSelected
                      ? "bg-primary/10 border-l-[3px] border-primary"
                      : "border-l-[3px] border-transparent hover:bg-base-200"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-11 h-11 rounded-full bg-linear-to-br ${getAvatarColor(chat.userId.name)} text-white flex items-center justify-center font-semibold text-sm shadow-sm`}
                    >
                      {getInitials(chat.userId?.name) || "tamu"}
                    </div>
                    {online && (
                      <span className="online-dot absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div
                      // onClick={() => handleChatClick(chat)}
                      className="flex items-center justify-between mb-0.5"
                    >
                      <p
                        className={`text-sm font-semibold truncate ${isSelected ? "text-primary" : "text-base-content"}`}
                      >
                        {chat.userId.name}
                      </p>
                      {chat.time && (
                        <span className="text-[11px] text-base-content/40 ml-2 shrink-0">
                          {chat.time}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs text-base-content/40 truncate">
                        {typing ? (
                          <span className="text-primary font-medium">
                            <TypingIndicator />
                          </span>
                        ) : online ? (
                          <span className="text-success font-medium">
                            ● Online
                          </span>
                        ) : chat.lastMessage ? (
                          chat.lastMessage.message?.substring(0, 30) ||
                          "Attachment"
                        ) : (
                          chat.userId.email
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Contact Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-2xl shadow-2xl w-96 max-w-[90vw] p-6 relative animate-fadeIn border border-base-300">
            <button
              onClick={() => {
                setIsPopupOpen(false);
                setEmail("");
              }}
              className="btn btn-ghost btn-sm btn-circle absolute top-4 right-4 text-base-content/40"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-base-content">
                Add New Contact
              </h2>
              <p className="text-sm text-base-content/50 mt-0.5">
                Enter their email to send a request
              </p>
            </div>

            <form onSubmit={handleSubmitEmail}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-base-content/50 mb-1.5 uppercase tracking-wide"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="input input-bordered w-full text-sm focus:input-primary"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPopupOpen(false);
                    setEmail("");
                  }}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1"
                >
                  {submitting ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Add Contact"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <RequestPopup
        isOpen={isRequestPopupOpen}
        onClose={() => setIsRequestPopupOpen(false)}
        onRequestProcessed={handleRequestProcessed}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: oklch(var(--bc) / 0.15);
          border-radius: 4px;
        }

        @keyframes pulse-dot {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        .online-dot {
          animation: pulse-dot 2s ease infinite;
        }
      `}</style>
    </>
  );
};
