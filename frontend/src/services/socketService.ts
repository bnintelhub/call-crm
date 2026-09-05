import { io, Socket } from 'socket.io-client';

const host = window.location.hostname;
const defaultSocketUrl = `http://${host}:5000`;
// ✅ Use VITE_SOCKET_URL if set, else fallback from VITE_API_URL, else local default
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL 
  || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : defaultSocketUrl);

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string, role: string, name: string): Socket {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'], // polling first = more reliable behind nginx
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket?.id);
      // Join with user identity
      this.socket?.emit('user:join', { userId, role, name });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket connection error:', err.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Subscribe to an event, returns an unsubscribe function
  on(event: string, handler: (...args: any[]) => void): () => void {
    this.socket?.on(event, handler);
    return () => this.socket?.off(event, handler);
  }

  off(event: string, handler?: (...args: any[]) => void) {
    if (handler) {
      this.socket?.off(event, handler);
    } else {
      this.socket?.removeAllListeners(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Singleton instance
export const socketService = new SocketService();
