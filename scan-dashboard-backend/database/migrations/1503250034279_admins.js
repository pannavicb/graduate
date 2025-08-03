'use strict'

const Schema = use('Schema')

class AdminsSchema extends Schema {
  up () {
    this.create('admins', (table) => {
      table.increments()
      table.string('username').notNullable().unique()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('admins')
  }
}

module.exports = AdminsSchema
