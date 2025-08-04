'use strict'

const Schema = use('Schema')

class GraduatesSchema extends Schema {
  up () {
    this.create('graduates', (table) => {
      table.increments()
      table.integer('order_no').notNullable()
      table.string('student_id').notNullable().unique()
      table.string('name').notNullable()
      table.string('call_time').nullable()
      table.string('status').defaultTo('รอเข้ารับ')
      table.string('last_update').nullable()
      table.string('rfid').nullable().unique()
      table.string('scan_time_1').nullable()
      table.string('scan_time_2').nullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('graduates')
  }
}

module.exports = GraduatesSchema
