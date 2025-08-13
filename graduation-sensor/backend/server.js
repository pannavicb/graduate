const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'educated'
});

// API: ดึงข้อมูลบัณฑิตทั้งหมด
app.get('/graduates', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM graduates ORDER BY id ASC');
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// API: อัปเดตสถานะและเวลาของบัณฑิต
app.put('/graduates/:id', async (req, res) => {
  const { status, call_time } = req.body;
  try {
    await db.query(
      'UPDATE graduates SET status = ?, call_time = ? WHERE id = ?',
      [status, call_time, req.params.id]
    );
    io.emit('updateGraduate', { id: Number(req.params.id), status, call_time });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database update error' });
  }
});

// API: reset สถานะบัณฑิตทั้งหมด
app.post('/graduates/reset', async (req, res) => {
  try {
    await db.query(
      "UPDATE graduates SET status = 'รอเข้ารับ', call_time = NULL"
    );
    io.emit('resetAll');  // แจ้ง frontend ด้วยถ้าต้องการ
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Reset status failed' });
  }
});

// API: รีเซ็ตสถานะบัณฑิตทั้งหมด
app.post('/graduates/reset', async (req, res) => {
  try {
    await db.query("UPDATE graduates SET status = 'รอเข้ารับ', call_time = NULL");
    const [rows] = await db.query('SELECT * FROM graduates');
    rows.forEach(grad => {
      io.emit('updateGraduate', {
        id: grad.id,
        status: grad.status,
        call_time: grad.call_time,
      });
    });
    res.json({ success: true, message: 'รีเซ็ตสถานะทั้งหมดเรียบร้อยแล้ว' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ไม่สามารถรีเซ็ตสถานะได้' });
  }
});

// Sensor Simulation: ทุก 5 วินาที อัปเดตสถานะบัณฑิตคนถัดไปเป็น "อยู่บนเวที"
setInterval(async () => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM graduates WHERE status='รอเข้ารับ' ORDER BY id ASC LIMIT 1"
    );
    if (rows.length > 0) {
      const graduate = rows[0];
      const callTime = new Date().toISOString();
      await db.query(
        'UPDATE graduates SET status=?, call_time=? WHERE id=?',
        ['อยู่บนเวที', callTime, graduate.id]
      );
      io.emit('updateGraduate', {
        id: graduate.id,
        status: 'อยู่บนเวที',
        call_time: callTime
      });
      console.log(`Sensor triggered: ${graduate.name}`);
    }
  } catch (err) {
    console.error(err);
  }
}, 5000);

server.listen(3333, () => {
  console.log('Backend running on http://localhost:3333');
});
