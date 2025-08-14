const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ==========================
// Middleware
// ==========================
app.use(cors());
app.use(express.json());

// ==========================
// MySQL Connection Pool
// ==========================
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'educated'
});

// ==========================
// Helper: ดึงข้อมูลนักศึกษา
// ==========================
const getAllGraduates = async () => {
  const [rows] = await db.query(
    `SELECT * FROM graduates ORDER BY 
      CASE WHEN queue_order IS NULL THEN 1 ELSE 0 END, queue_order ASC, id ASC`
  );
  return rows;
};

// ==========================
// API: อ่าน RFID แล้วอัปเดตสถานะ
// ==========================
app.post('/rfid/read', async (req, res) => {
  const { rfid } = req.body;
  if (!rfid) return res.status(400).json({ error: 'RFID is required' });

  try {
    const [rows] = await db.query('SELECT * FROM graduates WHERE rfid = ?', [rfid]);
    if (rows.length === 0) return res.status(404).json({ error: 'Graduate not found' });

    const graduate = rows[0];
    let newStatus;
    let call_time = new Date().toISOString();

    switch (graduate.status) {
      case 'รอเข้ารับ': newStatus = 'อยู่บนเวที'; break;
      case 'อยู่บนเวที': newStatus = 'เสร็จสิ้น'; break;
      case 'เสร็จสิ้น': call_time = null; return res.json({ message: 'Graduate already completed', id: graduate.id });
      default: newStatus = 'อยู่บนเวที';
    }

    await db.query('UPDATE graduates SET status = ?, call_time = ? WHERE rfid = ?', [newStatus, call_time, rfid]);
    io.emit('updateGraduate', { id: graduate.id, status: newStatus, call_time });

    res.json({ message: 'Status updated', id: graduate.id, status: newStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================
// API: อัปเดตสถานะเป็น "เสร็จสิ้น" ตาม ID
// ==========================
app.post('/graduates/complete', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID is required' });

  try {
    const [rows] = await db.query('SELECT * FROM graduates WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Graduate not found' });

    const graduate = rows[0];
    if (graduate.status === 'เสร็จสิ้น') {
      return res.json({ message: 'Graduate already completed', id });
    }

    const call_time = new Date().toISOString();
    await db.query('UPDATE graduates SET status = ?, call_time = ? WHERE id = ?', ['เสร็จสิ้น', call_time, id]);

    io.emit('updateGraduate', { id, status: 'เสร็จสิ้น', call_time });
    res.json({ message: 'Status updated to เสร็จสิ้น', id, status: 'เสร็จสิ้น' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================
// API: ดึงข้อมูลทั้งหมด
// ==========================
app.get('/graduates', async (req, res) => {
  try {
    const rows = await getAllGraduates();
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ==========================
// API: รีเซ็ตสถานะทุกบรรทัด
// ==========================
app.post('/graduates/reset', async (req, res) => {
  try {
    // รีเซ็ตทุกบรรทัด
    await db.query("UPDATE graduates SET status = 'รอเข้ารับ', call_time = NULL");

    // ดึงข้อมูลล่าสุด
    const rows = await getAllGraduates();

    // แจ้ง frontend ทุก client
    io.emit('bulkUpdateGraduates', rows);

    res.json({ message: 'All graduates reset', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ==========================
// Start server
// ==========================
const PORT = 3333;
server.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
