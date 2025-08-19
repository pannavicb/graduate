const mysql = require('mysql2/promise');

const firstNames = ['สมชาย','สมหญิง','อนันต์','สุดา','ประสิทธิ์','กมล','ปิยะ','สุรีย์','เกษม','วรรณา','จิตรา','พงษ์ศักดิ์','ศิริพร','อรวรรณ','มานพ','สายฝน','บุญช่วย','จันทร์เพ็ญ','ถาวร','เพ็ญศรี'];
const lastNames = ['ใจดี','บุญมี','ทองสุข','สวัสดิ์','อินทร์สุข','ทองใบ','บุญช่วย','อยู่สุข','สายทอง','คำดี','พูนสุข','ทองดี','ดีมาก','พงษ์เพชร','ศรีสุข','ตั้งใจ','เพชรดี','ชื่นจิต','สุดใจ','สุขสวัสดิ์'];

function randomThaiName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

function generateStudentId(year, faculty, major, order) {
  return `${String(year).slice(-2)}${String(faculty).padStart(2,'0')}${String(major).padStart(2,'0')}${String(order).padStart(2,'0')}`;
}

(async () => {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234',
      database: 'educated'
    });

    console.log('🚀 เชื่อมต่อฐานข้อมูลสำเร็จ');

    await db.query('TRUNCATE TABLE graduates');
    console.log('🗑️ ล้างข้อมูลเรียบร้อย');

    const graduates = [];
    let total = 0;

    const years = [2565, 2566, 2567];
    const faculties = [1,2,3,4,5,6];

    // สร้างข้อมูล 150 คน
    for (const year of years) {
      for (const faculty of faculties) {
        for (let major = 1; major <= 10; major++) {
          for (let order = 1; order <= 10; order++) {
            if (total >= 150) break;
            const studentId = generateStudentId(year, faculty, major, order);
            const name = randomThaiName();
            const rfid = `RFID${String(total + 1).padStart(10,'0')}`;
            const queueOrder = total + 1;
            const status = 'รอเข้ารับ';
            const order_no = total + 1; // เรียงต่อเนื่องจาก 1 ถึง 150

            graduates.push([studentId, name, rfid, queueOrder, status, order_no]);
            total++;
          }
          if (total >= 150) break;
        }
        if (total >= 150) break;
      }
      if (total >= 150) break;
    }

    await db.query(
      'INSERT INTO graduates (student_id, name, rfid, queue_order, status, order_no) VALUES ?',
      [graduates]
    );

    console.log(`✅ เพิ่มข้อมูล ${graduates.length} คนเรียบร้อย`);
    await db.end();
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
  }
})();
