'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ScanLogSchema extends Schema {
  up () {
    this.create('scan_logs', (table) => {
      table.increments()
      table.timestamps()
    })
  }

  down () {
    this.drop('scan_logs')
  }
}

module.exports = ScanLogSchema
