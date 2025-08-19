const mysql = require('mysql2/promise');

const BATCH_SIZE = 150; // batch size

(async () => {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234',
      database: 'educated'
    });

    console.log('🚀 เชื่อมต่อฐานข้อมูลสำเร็จ');

    // 1️⃣ ย้ายข้อมูลจาก graduates → postdata_graduates
    await db.query('INSERT INTO postdata_graduates (student_id, name, rfid, queue_order, status, order_no, created_at, updated_at) SELECT student_id, name, rfid, queue_order, status, order_no, created_at, updated_at FROM graduates');
    console.log(`✅ ย้ายข้อมูลจาก graduates → postdata_graduates เรียบร้อย`);

    // 2️⃣ ล้างข้อมูลใน graduates
    await db.query('TRUNCATE TABLE graduates');
    console.log('🗑️ ล้างข้อมูลใน graduates เรียบร้อย');

    // 3️⃣ ดึง batch ถัดไปจาก predata_graduates ที่ยังไม่ถูกนำเข้า
    const [allPredata] = await db.query('SELECT * FROM predata_graduates ORDER BY id ASC');
    console.log(`🔹 พบข้อมูลทั้งหมด ${allPredata.length} คนใน predata_graduates`);

    // เลือก batch ถัดไป
    const batchToInsert = allPredata.slice(0, BATCH_SIZE); // เปลี่ยน index ได้ตามต้องการ

    // กำหนด order_no ต่อเนื่อง
    let orderCounter = 1;
    const batchData = batchToInsert.map(row => [
      row.student_id,
      row.name,
      row.rfid,
      row.queue_order,
      row.status,
      orderCounter++
    ]);

    // 4️⃣ นำ batch เข้า graduates
    await db.query(
      'INSERT INTO graduates (student_id, name, rfid, queue_order, status, order_no) VALUES ?',
      [batchData]
    );
    console.log(`✅ นำเข้า batch ถัดไป ${batchData.length} คนไปยัง graduates เรียบร้อย`);

    await db.end();
    console.log('🎉 การดำเนินการเสร็จสมบูรณ์');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
  }
})();
