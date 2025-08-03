'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class GraduatesSchema extends Schema {
  up () {
    this.create('graduates', (table) => {
      table.increments()                 // สร้าง primary key id อัตโนมัติ
      table.integer('order_no').notNullable()
      table.string('student_id').notNullable().unique()
      table.string('name').notNullable()
      table.string('call_time').nullable()
      table.string('status').defaultTo('รอเข้ารับ')
      table.string('last_update').nullable()
      table.string('rfid').nullable().unique()
      table.string('scan_time_1').nullable()
      table.string('scan_time_2').nullable()
      table.timestamps()                 // created_at และ updated_at
    })
  }

  down () {
    this.drop('graduates')
  }
}

module.exports = GraduatesSchema
