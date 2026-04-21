// store/socketStore.js
import { create } from 'zustand';
import io from 'socket.io-client';

export const useSocketStore = create((set, get) => ({
    socket: null,
    onlineUsers: new Map(),
    typingUsers: new Map(), // userId yang sedang mengetik di chat aktif

    connectSocket: (userId) => {
        const socket = io('https://chatapp-be-production-5dee.up.railway.app', {
            withCredentials: true,
            // transports: ['websocket']
        });

        socket.on('connect', () => {
            console.log('Socket connected');
            socket.emit('user-online', userId);
        });

        socket.on('user-status', ({ userId, status }) => {
            set((state) => {
                console.log("user nya", userId, "status: ", status)
                const newOnlineUsers = new Map(state.onlineUsers);
                console.log("STORE ONLINE:", Array.from(newOnlineUsers.entries())); if (status === 'online') {
                    newOnlineUsers.set(userId, true);
                } else {
                    newOnlineUsers.delete(userId);
                }
                return { onlineUsers: newOnlineUsers };
            });
        });

        socket.on('typing-indicator', ({ senderId, isTyping }) => {
            set((state) => {
                const newTypingUsers = new Map(state.typingUsers);
                if (isTyping) {
                    newTypingUsers.set(senderId, true);
                } else {
                    newTypingUsers.delete(senderId);
                }
                return { typingUsers: newTypingUsers };
            });

            // Auto-clear setelah 3 detik
            if (isTyping) {
                setTimeout(() => {
                    set((state) => {
                        const newTypingUsers = new Map(state.typingUsers);
                        if (newTypingUsers.get(senderId)) {
                            newTypingUsers.delete(senderId);
                        }
                        return { typingUsers: newTypingUsers };
                    });
                }, 3000);
            }
        });

        socket.on('new-message', (message) => {
            // Trigger event untuk update chat window
            window.dispatchEvent(new CustomEvent('new-realtime-message', { detail: message }));
        });

        set({ socket });
        return socket;
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, onlineUsers: new Map(), typingUsers: new Map() });
        }
    },

    sendTypingStart: (senderId, receiverId) => {
        const { socket } = get();
        if (socket) {
            socket.emit('typing-start', { senderId, receiverId });
        }
    },

    sendTypingStop: (senderId, receiverId) => {
        const { socket } = get();
        if (socket) {
            socket.emit('typing-stop', { senderId, receiverId });
        }
    },

    sendMessage: (messageData) => {
        const { socket } = get();
        if (socket) {
            socket.emit('send-message', messageData);
        }
    },

    isUserOnline: (userId) => {
        const { onlineUsers } = get();
        return onlineUsers.has(userId);
    },

    isUserTyping: (userId) => {
        const { typingUsers } = get();
        return typingUsers.has(userId);
    }
}));