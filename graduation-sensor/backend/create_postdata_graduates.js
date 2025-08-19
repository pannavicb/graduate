const mysql = require('mysql2/promise');

(async () => {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234',
      database: 'educated'
    });

    console.log('🚀 เชื่อมต่อฐานข้อมูลสำเร็จ');

    // สร้าง table postdata_graduates ว่าง ๆ
    await db.query(`
      CREATE TABLE IF NOT EXISTS postdata_graduates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        rfid VARCHAR(20) NOT NULL UNIQUE,
        queue_order INT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'รอเข้ารับ',
        order_no INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ ตาราง postdata_graduates ถูกสร้างเรียบร้อย (ว่าง)');
    await db.end();
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
  }
})();
