// app/Controllers/Http/GraduateController.js
'use strict'

const Drive = use('Drive')
const Helpers = use('Helpers')
const Database = use('Database')
const fs = require('fs')
const path = require('path')
const Papa = require('papaparse')

class GraduateController {
  async importCSV({ request, response }) {
    const csvFile = request.file('file', {
      extnames: ['csv'],
      size: '2mb',
    })

    if (!csvFile) {
      return response.badRequest({ message: 'กรุณาอัปโหลดไฟล์ CSV' })
    }

    const fileName = `${new Date().getTime()}.${csvFile.extname}`
    const uploadPath = Helpers.tmpPath(fileName)

    await csvFile.move(Helpers.tmpPath(), {
      name: fileName,
      overwrite: true,
    })

    if (!csvFile.moved()) {
      return response.status(500).send(csvFile.error())
    }

    const fileContent = await fs.promises.readFile(uploadPath, 'utf-8')
    const parsed = Papa.parse(fileContent, { header: true })

    const rows = parsed.data.filter(row => row.student_id && row.name)

    const formattedRows = rows.map((row, i) => ({
      order_no: i + 1,
      student_id: row.student_id,
      name: row.name,
      call_time: row.call_time || null,
      status: row.status || 'รอเข้ารับ',
      last_update: row.last_update || null,
      rfid: row.rfid || null,
      scan_time_1: row.scan_time_1 || null,
      scan_time_2: row.scan_time_2 || null,
      created_at: new Date(),
      updated_at: new Date(),
    }))

    // ลบข้อมูลเก่า
    await Database.table('graduates').truncate()

    // แทรกข้อมูลใหม่
    await Database.table('graduates').insert(formattedRows)

    return response.ok({ message: `นำเข้าข้อมูลสำเร็จ ${formattedRows.length} รายการ` })
  }
}

module.exports = GraduateController
