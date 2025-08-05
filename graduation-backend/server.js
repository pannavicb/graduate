const io = require('socket.io')(5000, {
  cors: { origin: '*' }
})

io.on('connection', socket => {
  console.log('Client connected:', socket.id)

  // ฟัง event จาก backend เช่น การอัปเดตสถานะ
  socket.on('update_status', data => {
    // Broadcast ข้อมูลสถานะให้ทุก client
    io.emit('status_update', data)
  })
})

console.log('Socket.io server running on port 5000')
