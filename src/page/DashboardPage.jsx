// DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { ChatWindow } from "../component/ChatWindow";
import { MessageInput } from "../component/MessageInput";
import { Sidebar } from "../component/Sidebar";
import Profile from "../component/Profile";
import { useSocketStore } from "../store/socketStore";
import { useThemeStore } from "../store/themeStore";
import Setting from "../component/Setting";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";

const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState(false);
  const [setting, setSetting] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isUserOnline, connectSocket, disconnectSocket } = useSocketStore();
  const { switchTheme } = useThemeStore();
  const themeCurrent = localStorage.getItem("chat-theme");

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    if (user?.data?._id) {
      connectSocket(user.data._id);
    }
    return () => {
      disconnectSocket();
    };
  }, [user?.data?._id]);

  const handleMessageSent = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (profile) {
    return (
      <div className="fixed inset-0 bg-base-100 z-50 overflow-auto">
        <Profile user={user} onClose={() => setProfile(false)} />
      </div>
    );
  }

  if (setting) {
    return (
      <div className="fixed inset-0 bg-base-100 z-50 overflow-auto">
        <Setting onClose={() => setSetting(false)} />
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-base-200 overflow-hidden font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }

        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: oklch(var(--bc) / 0.15); border-radius: 4px; }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .welcome-anim { animation: fadeSlideIn 0.45s ease both; }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .online-dot { animation: pulse-dot 2s ease infinite; }
      `}</style>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <div
        className={`
          fixed top-0 left-0 h-full z-50 transition-transform duration-300
          md:relative md:translate-x-0 md:flex md:shrink-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="w-80 h-full bg-base-100 flex flex-col shadow-sm border-r border-base-300">
          {/* Sidebar Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-base-300">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold text-sm shadow">
                  {getInitials(user?.data?.name)}
                </div>
                <span className="online-dot absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-base-100"></span>
              </div>
              <div>
                <p className="font-semibold text-base-content text-sm leading-tight">
                  {user?.data?.name || "You"}
                </p>
                <p className="text-xs text-success font-medium">Available</p>
              </div>
            </div>

            {/* Moon icon — opens Setting where user can pick theme */}
            <button
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Switch random theme"
              onClick={switchTheme}
              className="btn btn-ghost btn-sm btn-circle text-base-content/60"
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
                  strokeWidth="2"
                  d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 4h.01M12 12h.01M17 17h.01M7 17h.01M17 7h.01"
                />
              </svg>
            </button>
          </div>
          {/* Chat list via Sidebar component */}
          <div className="flex-1 overflow-y-auto sidebar-scroll">
            <Sidebar
              onSelectChat={handleSelectChat}
              selectedChatId={selectedChat?._id}
              onOpenProfile={() => setProfile(true)}
              onSettingProfile={() => setSetting(true)}
            />
          </div>
        </div>
        <Tooltip id="my-tooltip" />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-base-300 bg-base-100 flex items-center justify-between px-5 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden btn btn-ghost btn-sm btn-circle"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {selectedChat ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-semibold shadow-sm">
                    {selectedChat.userId.name?.charAt(0).toUpperCase()}
                  </div>
                  {isUserOnline(selectedChat.userId?._id) && (
                    <span className="online-dot absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-base-100"></span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-base-content text-sm">
                    {selectedChat.userId.name}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      isUserOnline(selectedChat.userId?._id)
                        ? "text-success"
                        : "text-base-content/40"
                    }`}
                  >
                    {isUserOnline(selectedChat.userId?._id)
                      ? "Online"
                      : "Offline"}
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-base-content/40 text-sm font-medium">
                ChatApp
              </span>
            )}
          </div>

          {/* <button
            onClick={logout}
            className="btn btn-ghost btn-sm text-error hover:bg-error/10 gap-1.5"
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
          </button> */}
        </header>

        {/* Chat window or welcome screen */}
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-base-200">
            <div className="welcome-anim flex flex-col items-center gap-4 text-center">
              <div className="w-24 h-24 rounded-3xl bg-base-100 shadow-md flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-primary"
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
              <div>
                <h2 className="text-2xl font-semibold text-base-content mb-1">
                  Welcome to ChatApp
                </h2>
                <p className="text-base-content/50 text-sm max-w-xs">
                  Select a conversation to start chatting, or search for someone
                  new.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <ChatWindow
              key={refreshKey}
              selectedChat={selectedChat}
              onMessageSent={handleMessageSent}
            />
            <MessageInput
              selectedChat={selectedChat}
              onMessageSent={handleMessageSent}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
