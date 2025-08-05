'use strict'

const Database = use('Database')

class GraduatesController {
  async index({ response }) {
    try {
      const graduates = await Database.from('graduates').orderBy('order_no')

      return response.json({
        status: 'success',
        data: graduates,
      })
    } catch (error) {
      console.error(error)
      return response.status(500).json({
        status: 'error',
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      })
    }
  }
}

module.exports = GraduatesController
