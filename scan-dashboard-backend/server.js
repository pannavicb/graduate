'use strict'

const { Ignitor } = require('@adonisjs/ignitor')
const path = require('path')
const express = require('express')

// ✅ Express App สำหรับ React UI + Socket.IO
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
  cors: { origin: '*' }
})

// 📡 WebSocket server
io.on('connection', (socket) => {
  console.log('👤 Client connected:', socket.id)

  socket.on('update_status', (data) => {
    io.emit('status_update', data)  // Broadcast ถึงทุก client
  })

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id)
  })
})

// ⚙️ Serve React build (from /public/build)
const buildPath = path.join(__dirname, 'public', 'build')
app.use(express.static(buildPath))
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'))
})

// 🚀 Start AdonisJS HTTP server (port 3333)
new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .fireHttpServer()
  .then(() => {
    // ✅ Start WebSocket + React dashboard server on port 5000
    http.listen(5000, () => {
      console.log('🧠 Socket.IO + React Dashboard running at http://localhost:5000')
    })
  })
  .catch(console.error)
