import { Server } from 'socket.io';

export function setupSystemSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('🟢 Cliente conectado al latido');

    const interval = setInterval(() => {
      socket.emit('heartbeat', {
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    }, 5000);

    socket.on('disconnect', () => {
      console.log('🔴 Cliente desconectado');
      clearInterval(interval);
    });
  });
}
