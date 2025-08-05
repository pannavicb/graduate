'use strict'

const Database = use('Database')

class DashboardController {
  async index({ response }) {
    try {
      // รวมจำนวนทั้งหมด
      const totalRes = await Database.from('graduates').count('* as count').first()
      const total = totalRes.count || 0

      // จำนวนรอเรียก (status = 'รอเข้ารับ' หรือ 'waiting')
      const waitingRes = await Database.from('graduates').where('status', 'รอเข้ารับ').count('* as count').first()
      const waiting = waitingRes.count || 0

      // จำนวนอยู่บนเวที (status = 'อยู่บนเวที' หรือ 'called_stage')
      const calledStageRes = await Database.from('graduates').where('status', 'อยู่บนเวที').count('* as count').first()
      const called_stage = calledStageRes.count || 0

      // จำนวนรับเรียบร้อย (status = 'รับเรียบร้อย' หรือ 'called_done')
      const calledDoneRes = await Database.from('graduates').where('status', 'รับเรียบร้อย').count('* as count').first()
      const called_done = calledDoneRes.count || 0

      // จำนวนขาด (status = 'ขาด')
      const absentRes = await Database.from('graduates').where('status', 'ขาด').count('* as count').first()
      const absent = absentRes.count || 0

      // รายชื่อผู้เข้าร่วมทั้งหมด เรียงตาม order_no
      const users = await Database.from('graduates').orderBy('order_no').select('*')

      // สมมติปีการศึกษาไว้ (แก้เป็นจริงตามข้อมูลหรือ config)
      const academic_year = 2567

      return response.json({
        status: 'success',
        data: {
          total,
          waiting,
          called_stage,
          called_done,
          absent,
          academic_year,
          users,
        },
      })
    } catch (error) {
      console.error('DashboardController index error:', error)
      return response.status(500).json({
        status: 'error',
        message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      })
    }
  }
}

module.exports = DashboardController
