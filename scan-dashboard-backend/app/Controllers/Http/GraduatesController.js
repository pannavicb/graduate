'use strict'

const Database = use('Database')

class GraduatesController {
  async index({ response }) {
    try {
      const graduates = await Database
        .from('graduates')
        .orderBy('order_no', 'asc')
        .select('order_no', 'student_id', 'name', 'call_time', 'status', 'last_update', 'rfid', 'scan_time_1', 'scan_time_2')

      return response.json(graduates)
    } catch (error) {
      console.error(error)
      return response.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' })
    }
  }
}

module.exports = GraduatesController
