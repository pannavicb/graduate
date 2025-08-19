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
// API: ประมวลผล batch ถัดไป
// ==========================
app.post('/graduates/process-next-batch', async (req, res) => {
  const conn = await db.getConnection();
  try {
    const batchSize = 150;
    await conn.beginTransaction();

    // 1. ตรวจสอบว่า graduates ว่างหรือไม่
    const [existingGraduates] = await conn.query(`SELECT * FROM graduates`);
    if (existingGraduates.length > 0) {
      // graduates ไม่ว่าง → ย้ายไป postdata_graduates
      for (let g of existingGraduates) {
        await conn.query(
          `INSERT INTO postdata_graduates (student_id, name, rfid, status, call_time, queue_order, order_no)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [g.student_id, g.name, g.rfid, g.status, g.call_time, g.queue_order, g.order_no || null]
        );
      }
      await conn.query(`TRUNCATE TABLE graduates`);
    }

    // 2. ดึง batch 150 คนจาก predata_graduates
    const [nextBatch] = await conn.query(
      `SELECT * FROM predata_graduates WHERE status = 'รอเข้ารับ' ORDER BY 
        CASE WHEN queue_order IS NULL THEN 1 ELSE 0 END, queue_order ASC, id ASC
        LIMIT ?`, [batchSize]
    );

    if (nextBatch.length === 0) {
      await conn.commit();
      return res.json({ message: 'No more graduates in queue' });
    }

    // 3. นำ batch ใส่ table graduates และเก็บ id เพื่อลบ
    const idsToDelete = [];
    for (let g of nextBatch) {
      await conn.query(
        `INSERT INTO graduates (student_id, name, rfid, status, call_time, queue_order, order_no)
         VALUES (?, ?, ?, 'รอเข้ารับ', NULL, ?, ?)`,
        [g.student_id, g.name, g.rfid, g.queue_order, g.order_no || null]
      );
      idsToDelete.push(g.id);
    }

    // 4. ลบ record จาก predata_graduates
    if (idsToDelete.length > 0) {
      await conn.query(`DELETE FROM predata_graduates WHERE id IN (?)`, [idsToDelete]);
    }

    await conn.commit();

    // 5. แจ้ง frontend ผ่าน socket.io
    nextBatch.forEach(g => {
      io.emit('updateGraduate', { id: g.student_id, status: 'รอเข้ารับ', call_time: null });
    });

    const rows = await getAllGraduates();
    io.emit('bulkUpdateGraduates', rows);

    res.json({ message: 'Processed next batch', data: nextBatch });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to process next batch' });
  } finally {
    conn.release();
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
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query("UPDATE graduates SET status = 'รอเข้ารับ', call_time = NULL");

    // จัดเรียง queue_order ใหม่หลัง reset
    const [allGraduates] = await conn.query(`SELECT id FROM graduates ORDER BY id ASC`);
    for (let i = 0; i < allGraduates.length; i++) {
      await conn.query('UPDATE graduates SET queue_order = ? WHERE id = ?', [i + 1, allGraduates[i].id]);
    }

    await conn.commit();

    const rows = await getAllGraduates();
    io.emit('bulkUpdateGraduates', rows);
    res.json({ message: 'All graduates reset', data: rows });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    conn.release();
  }
});

// ==========================
// Start server
// ==========================
const PORT = 3333;
server.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
