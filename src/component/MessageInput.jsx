// MessageInput.jsx
import { useState, useRef } from "react";
import { axiosInstance } from "../utiils/axios";
import { useToast } from "../hooks/toast.js";
import { useSocketStore } from "../store/socketStore";
import { useAuthStore } from "../store/authStore";
import { useSettingStore } from "../store/settingStore";

export const MessageInput = ({ selectedChat, onMessageSent }) => {
  const [message, setMessage] = useState("");
  const { notify, fcmToken } = useSettingStore.getState();
  const { user } = useAuthStore();
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { success, error } = useToast();
  const { sendTypingStart, sendTypingStop, sendMessage } = useSocketStore();

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024;
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > maxSize) {
        error(`File ${file.name} terlalu besar (maks 10MB)`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith("image/")) return "🖼️";
    if (file.type.startsWith("video/")) return "🎥";
    if (file.type === "application/pdf") return "📄";
    return "📎";
  };

  const handleTyping = () => {
    if (!selectedChat) return;
    const userId = user?.data._id || "kosong kah";
    sendTypingStart(userId, selectedChat.userId._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop(user?.data._id, selectedChat.userId._id);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0) return;
    if (!selectedChat) {
      error("Pilih kontak terlebih dahulu");
      return;
    }

    sendTypingStop(user?.data._id, selectedChat.userId._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setSending(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("receiver", selectedChat.userId._id);
      if (message.trim()) formData.append("message", message.trim());
      files.forEach((file) => formData.append("files", file));
      formData.append("notify", notify);
      if (notify && fcmToken) formData.append("fcmToken", fcmToken);

      const response = await axiosInstance.post("/api/message", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.status === 200 || response.status === 201) {
        sendMessage({
          senderId: user?.data._id,
          receiverId: selectedChat.userId._id,
          message: message.trim(),
          attachments: response.data.data.attachments || [],
          _id: response.data.data._id,
        });

        setMessage("");
        setFiles([]);
        setUploadProgress(0);
        if (onMessageSent) onMessageSent();
      }
    } catch (err) {
      console.error("Error sending message:", err);
      error(err.response?.data?.error || "Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  const canSend =
    selectedChat && !sending && (message.trim() || files.length > 0);

  return (
    <div className="border-t border-base-300 bg-base-100">
      {/* File preview */}
      {files.length > 0 && (
        <div className="px-4 pt-3 pb-2 border-b border-base-300 bg-base-200">
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative bg-base-100 rounded-xl border border-base-300 shadow-sm p-2 pr-7 min-w-[150px] max-w-[200px]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl flex-shrink-0">
                    {getFileIcon(file)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-base-content truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-base-content/40">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-error"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {sending && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="px-4 pt-2">
          <progress
            className="progress progress-primary w-full h-1"
            value={uploadProgress}
            max="100"
          />
          <p className="text-[11px] text-base-content/50 mt-1">
            Mengupload... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Input row */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 flex items-center gap-2"
      >
        {/* Attach file button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!selectedChat || sending}
          className="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-primary flex-shrink-0"
          title="Lampirkan file"
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
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*,video/*,application/pdf,.doc,.docx,.txt"
          className="hidden"
        />

        {/* Text input */}
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder={
            selectedChat ? "Ketik pesan..." : "Pilih kontak terlebih dahulu"
          }
          disabled={!selectedChat || sending}
          className="input input-bordered input-sm flex-1 bg-base-200 border-base-300 text-base-content placeholder:text-base-content/40 focus:input-primary rounded-xl h-10 text-sm"
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!canSend}
          className="btn btn-primary btn-sm rounded-xl h-10 px-4 flex-shrink-0 gap-1.5"
        >
          {sending ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <>
              <span className="hidden sm:inline text-sm">Kirim</span>
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
