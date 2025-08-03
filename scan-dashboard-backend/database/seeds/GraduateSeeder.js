'use strict'

const Factory = use('Factory')
const Database = use('Database')

class GraduateSeeder {
  async run () {
    await Database.table('graduates').insert([
      {
        order_no: 1,
        student_id: '650000001',
        name: 'นายสมชาย ใจดี',
        call_time: null,
        status: 'รอเข้ารับ',
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null
      },
      {
        order_no: 2,
        student_id: '650000002',
        name: 'นางสาวสุดารัตน์ อินทร์สุข',
        call_time: null,
        status: 'รอเข้ารับ',
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null
      },
      {
        order_no: 3,
        student_id: '650000003',
        name: 'นายพิทักษ์ พิทักษ์ธรรม',
        call_time: null,
        status: 'รอเข้ารับ',
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null
      },
      {
        order_no: 4,
        student_id: '650000004',
        name: 'นายอดิศร ทองแท้',
        call_time: null,
        status: 'รอเข้ารับ',
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null
      },
      {
        order_no: 5,
        student_id: '650000005',
        name: 'นางสาวพัชราภา อินทรวิเศษ',
        call_time: null,
        status: 'รอเข้ารับ',
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null
      },
      {
        order_no: 6,
        student_id: '650000006',
        name: 'นายวราวุธ สายบุญ',
        call_time: null,
        status: 'รอเข้ารับ',
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null
      },
      {
        order_no: 7,
        student_id: '650000007',
        name: 'นางสาวจินตนา รุ่งเรือง',
        call_time: null,
        status: 'รอเข้ารับ',
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null
      },
      {
        order_no: 8,
        student_id: '650000008',
        name: 'นายธนากร ใจสู้',
        call_time: null,
        status: 'รอเข้ารับ',
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null
      },
      {
        order_no: 9,
        student_id: '650000009',
        name: 'นางสาวศิริพร แก้วกล้า',
        call_time: null,
        status: 'รอเข้ารับ',
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null
      },
      {
        order_no: 10,
        student_id: '650000010',
        name: 'นายณัฐวุฒิ พงษ์ไทย',
        call_time: null,
        status: 'รอเข้ารับ',
        last_update: null,
        rfid: null,
        scan_time_1: null,
        scan_time_2: null
      },
    ])
  }
}

module.exports = GraduateSeeder
