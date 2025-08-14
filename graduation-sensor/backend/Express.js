const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'educated'
});

// API: รับค่า RFID Tag จาก frontend หรือ sensor
app.post('/rfid/read', async (req, res) => {
  const { rfd_tag } = req.body;
  if (!rfd_tag) return res.status(400).json({ error: 'rfid_tag is required' });

  try {
    // หา graduate จาก rfid_tag
    const [rows] = await db.query('SELECT * FROM graduates WHERE rfid_tag = ?', [rfid_tag]);
    if (rows.length === 0) return res.status(404).json({ error: 'Graduate not found for this RFID' });

    const graduate = rows[0];
    let newStatus = graduate.status;

    // อัปเดตสถานะตามลำดับ
    if (graduate.status === 'รอเข้ารับ') newStatus = 'อยู่บนเวที';
    else if (graduate.status === 'อยู่บนเวที') newStatus = 'เสร็จสิ้น';
    else if (graduate.status === 'เสร็จสิ้น') return res.json({ message: 'Graduate already completed' });
    else newStatus = 'อยู่บนเวที';

    const call_time = new Date().toISOString();

    // อัปเดตฐานข้อมูล
    await db.query('UPDATE graduates SET status = ?, call_time = ? WHERE rfid_tag = ?', [
      newStatus,
      call_time,
      rfid_tag
    ]);

    // แจ้ง frontend realtime
    io.emit('updateGraduate', { id: graduate.id, status: newStatus, call_time });

    res.json({ message: 'Status updated', id: graduate.id, status: newStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: ดึงข้อมูลบัณฑิตทั้งหมด เรียงลำดับ queue_order ก่อน แล้ว id
app.get('/graduates', async (req, res) => {   
  try {
    const [rows] = await db.query(
      `SELECT * FROM graduates
       ORDER BY 
         CASE WHEN queue_order IS NULL THEN 1 ELSE 0 END, queue_order ASC, id ASC`
    );
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
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
        call_time: grad.call_time
      });
    });
    res.json({ success: true, message: 'รีเซ็ตสถานะทั้งหมดเรียบร้อยแล้ว' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ไม่สามารถรีเซ็ตสถานะได้' });
  }
});

// Sensor Simulation (optional): ทุก 5 วินาทีอัปเดตบัณฑิตคนถัดไป
setInterval(async () => {
  try {
    const [rows] = await db.query("SELECT * FROM graduates WHERE status='รอเข้ารับ' ORDER BY queue_order ASC, id ASC LIMIT 1");
    if (rows.length > 0) {
      const graduate = rows[0];
      const callTime = new Date().toISOString();
      await db.query('UPDATE graduates SET status=?, call_time=? WHERE id=?', ['อยู่บนเวที', callTime, graduate.id]);
      io.emit('updateGraduate', { id: graduate.id, status: 'อยู่บนเวที', call_time: callTime });
      console.log(`Sensor triggered: ${graduate.name}`);
    }
  } catch (err) {
    console.error(err);
  }
}, 5000);

server.listen(3333, () => {
  console.log('Backend running on http://localhost:3333');
});
