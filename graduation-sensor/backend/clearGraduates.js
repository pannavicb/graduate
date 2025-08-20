// clearGraduates.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
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
// API: ล้างข้อมูล postdata_graduates และ predata_graduates
// ==========================

app.post('/graduates/clear-data', async (req, res) => {
    
  try {
    await db.query('TRUNCATE TABLE graduates');
    await db.query('TRUNCATE TABLE postdata_graduates');
    await db.query('TRUNCATE TABLE predata_graduates');
    // res.json({ message: 'Cleared postdata_graduates and predata_graduates' });
    res.json({ message: 'Cleared predata_graduates, postdata_graduates and graduates' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear data' });
  }

});

// ==========================
// Start server
// ==========================

const PORT = 3334; // ใช้ port ต่างจาก backend หลัก
app.listen(PORT, () => console.log(`ClearGraduates service running on http://localhost:${PORT}`));
