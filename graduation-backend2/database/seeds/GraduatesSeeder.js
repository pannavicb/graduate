'use strict'

const Database = use('Database')
const { faker } = require('@faker-js/faker')

faker.locale = 'th'

class GraduatesSeeder {
  async run () {
    // ล้างข้อมูลก่อน (อาจเอาออกถ้าต้องการเก็บข้อมูลเดิม)
    await Database.table('graduates').delete()

    const statuses = ['รอเข้ารับ', 'อยู่บนเวที', 'รับเรียบร้อย', 'ขาด']

    // ➤ ข้อมูลตัวอย่างเริ่มต้น 5 รายการ (id 1-5)
    const initialGraduates = [
      {
        order_no: 1,
        student_id: '61010001',
        name: 'นายสมชาย ใจดี',
        call_time: null,
        status: 'รอเข้ารับ',
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        order_no: 2,
        student_id: '61010002',
        name: 'นางสาวสุดารัตน์ สมหวัง',
        call_time: null,
        status: 'รอเข้ารับ',
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        order_no: 3,
        student_id: '61010003',
        name: 'นายธนพล ดีมาก',
        call_time: null,
        status: 'ขาด',
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        order_no: 4,
        student_id: '61010004',
        name: 'นางสาวปวีณา เก่งกาจ',
        call_time: null,
        status: 'รับเรียบร้อย',
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        order_no: 5,
        student_id: '61010005',
        name: 'นายสมบัติ สู้ชีวิต',
        call_time: null,
        status: 'อยู่บนเวที',
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    // ➤ รายการที่ 6-150 (รวมทั้งหมด 145 รายการ)
    const generatedGraduates = []
    for (let i = 6; i <= 150; i++) {
      const isMale = Math.random() < 0.5
      const prefix = isMale ? 'นาย' : 'นางสาว'
      // ใช้ faker.person แทน faker.name
      const firstName = isMale
        ? faker.person.firstName('male')
        : faker.person.firstName('female')
      const lastName = faker.person.lastName()
      // ใช้ faker.number.int แทน faker.datatype.number
      const studentNumber = faker.number.int({ min: 100000, max: 999999 })

      generatedGraduates.push({
        order_no: i,
        student_id: '61' + studentNumber,
        name: `${prefix} ${firstName} ${lastName}`,
        call_time: null,
        status: faker.helpers.arrayElement(statuses),
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null,
        created_at: new Date(),
        updated_at: new Date(),
      })
    }

    // ➤ รวมข้อมูลทั้ง 5 รายการแรก และ 145 รายการที่สุ่ม
    const allGraduates = [...initialGraduates, ...generatedGraduates]

    // ➤ บันทึกลงฐานข้อมูล
    await Database.table('graduates').insert(allGraduates)
    console.log('✅ Seeded 150 graduates (starting from ID 6) successfully!')
  }
}

module.exports = GraduatesSeeder
