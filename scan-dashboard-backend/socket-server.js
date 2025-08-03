// socket-server.js
const io = require('socket.io')(5000, {
  cors: { origin: '*' } // อนุญาตให้ frontend เข้าถึง
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // รับ event จากฝั่ง backend เช่น เมื่อมีการเปลี่ยนสถานะ
  socket.on('update_status', (data) => {
    // ส่งต่อไปยัง clients ทุกคน
    io.emit('status_update', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

console.log('✅ Socket.IO server running at http://localhost:5000');
