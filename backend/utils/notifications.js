import { Server } from 'socket.io';

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('joinProject', (projectId) => {
      socket.join(projectId);
      console.log(`Socket ${socket.id} joined project room: ${projectId}`);
    });

    socket.on('leaveProject', (projectId) => {
      socket.leave(projectId);
    });

    socket.on('taskUpdate', (data) => {
      io.to(data.projectId).emit('taskUpdated', data);
    });

    socket.on('newComment', (data) => {
      io.to(data.projectId).emit('commentAdded', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};