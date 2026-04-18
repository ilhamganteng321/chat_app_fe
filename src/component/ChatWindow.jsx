// ChatWindow.jsx
import { useEffect, useRef, useState } from "react";
import { axiosInstance } from "../utiils/axios";
import { useAuthStore } from "../store/authStore";
import { useSocketStore } from "../store/socketStore";

// Komponen untuk menampilkan attachment
const MessageAttachment = ({ attachment, isSender }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (attachment.type === "image") {
    return (
      <>
        <img
          src={attachment.url}
          alt={attachment.originalName}
          className="max-w-[200px] max-h-[200px] rounded-lg cursor-pointer hover:opacity-90 transition mt-1"
          onClick={() => setIsOpen(true)}
        />

        {/* Modal preview gambar */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <img
              src={attachment.url}
              alt={attachment.originalName}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
            />
            <button
              className="btn btn-circle btn-sm absolute top-4 right-4 text-white bg-white/20 border-0 hover:bg-white/30"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
        )}
      </>
    );
  }

  if (attachment.type === "video") {
    return (
      <video
        src={attachment.url}
        controls
        className="max-w-[250px] rounded-lg mt-1"
        preload="metadata"
      />
    );
  }

  // File lainnya (PDF, DOC, dll)
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 p-2 rounded-lg hover:opacity-80 transition mt-1 ${
        isSender ? "bg-primary-content/20" : "bg-base-200"
      }`}
    >
      <span className="text-2xl">📎</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {attachment.originalName}
        </p>
        <p
          className={`text-xs ${isSender ? "text-primary-content/60" : "text-base-content/50"}`}
        >
          Klik untuk download
        </p>
      </div>
    </a>
  );
};

export const ChatWindow = ({ selectedChat, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuthStore();
  const { isUserTyping, socket, sendTypingStop } = useSocketStore();

  const isTyping = selectedChat ? isUserTyping(selectedChat.userId._id) : false;

  // Listen untuk real-time messages
  useEffect(() => {
    const handleNewMessage = (event) => {
      const newMessage = event.detail;
      if (
        selectedChat &&
        (newMessage.senderId === selectedChat.userId._id ||
          newMessage.receiverId === selectedChat.userId._id)
      ) {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      }
    };

    window.addEventListener("new-realtime-message", handleNewMessage);
    return () =>
      window.removeEventListener("new-realtime-message", handleNewMessage);
  }, [selectedChat]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (
        msg.sender === selectedChat?.userId?._id ||
        msg.receiver === selectedChat?.userId?._id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("new-message", handleNewMessage);
    return () => socket.off("new-message", handleNewMessage);
  }, [socket, selectedChat]);

  const fetchMessages = async () => {
    if (!selectedChat) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/message", {
        params: { recId: selectedChat.userId._id },
      });
      if (response.status === 200) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (error.response?.status === 404) {
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── State: no chat selected ──
  if (!selectedChat) {
    return (
      <div className="flex-1 overflow-y-auto bg-base-200 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-base-100 shadow flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-primary"
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
          <h3 className="text-base font-semibold text-base-content mb-1">
            Belum ada chat dipilih
          </h3>
          <p className="text-sm text-base-content/50">
            Pilih kontak dari sidebar untuk memulai percakapan
          </p>
        </div>
      </div>
    );
  }

  // ── State: loading ──
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-base-200 flex flex-col items-center justify-center">
        <span className="loading loading-spinner loading-md text-primary mb-3"></span>
        <p className="text-sm text-base-content/50">Memuat pesan...</p>
      </div>
    );
  }

  // ── State: empty messages ──
  const EmptyMessages = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-base-100 shadow flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-base-content/20"
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
        <h3 className="text-base font-semibold text-base-content mb-1">
          Belum ada pesan
        </h3>
        <p className="text-sm text-base-content/50">
          Mulai percakapan dengan {selectedChat.userId.name}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-base-200 flex flex-col gap-2">
      {messages.length === 0 ? (
        <EmptyMessages />
      ) : (
        <>
          {messages.map((msg) => {
            const isSender =
              msg.sender?.toString() === user?.data._id?.toString();

            return (
              <div
                key={msg._id}
                className={`max-w-[70%] flex flex-col ${isSender ? "self-end items-end" : "self-start items-start"}`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isSender
                      ? "bg-primary text-primary-content rounded-br-sm"
                      : "bg-base-100 text-base-content rounded-bl-sm"
                  }`}
                >
                  {/* Text message */}
                  {msg.message && (
                    <div className="break-words leading-relaxed">
                      {msg.message}
                    </div>
                  )}

                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="space-y-1 mt-1">
                      {msg.attachments.map((att, idx) => (
                        <MessageAttachment
                          key={idx}
                          attachment={att}
                          isSender={isSender}
                        />
                      ))}
                    </div>
                  )}

                  {/* Time */}
                  <div
                    className={`text-[10px] mt-1 ${isSender ? "text-primary-content/60" : "text-base-content/40"}`}
                  >
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="self-start bg-base-100 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
              <div className="flex gap-1 items-center">
                <span
                  className="w-1.5 h-1.5 bg-base-content/40 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-base-content/40 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-base-content/40 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
              <span className="text-xs text-base-content/50">
                {selectedChat?.userId.name} sedang mengetik...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
