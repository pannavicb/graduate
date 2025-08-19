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

    await db.query('TRUNCATE TABLE predata_graduates');
    console.log('🗑️ ล้างข้อมูลเรียบร้อย');

    const graduates = [];
    let total = 0;

    const years = [2565, 2566, 2567];
    const faculties = [1,2,3,4,5,6];

    for (const year of years) {
      for (const faculty of faculties) {
        for (let major=1; major<=10; major++) {  // 10 สาขา
          for (let order=1; order<=99; order++) {
            if (total >= 5000) break;
            const studentId = generateStudentId(year, faculty, major, order);
            const name = randomThaiName();
            const rfid = `RFID${String(total+1).padStart(10,'0')}`;
            const queueOrder = total + 1;
            const status = 'รอเข้ารับ';
            graduates.push([studentId, name, rfid, queueOrder, status]);
            total++;
          }
          if (total >= 5000) break;
        }
        if (total >= 5000) break;
      }
      if (total >= 5000) break;
    }

    await db.query(
      'INSERT INTO predata_graduates (student_id, name, rfid, queue_order, status) VALUES ?',
      [graduates]
    );

    console.log(`✅ เพิ่มข้อมูล ${graduates.length} คนเรียบร้อย`);
    await db.end();
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
  }
})();
