'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')
const { faker } = require('@faker-js/faker')

class UserSeeder {
  async run () {
    for (let i = 0; i < 5; i++) {
      const username = faker.internet.userName().toLowerCase()
      const email = faker.internet.email().toLowerCase()
      const password = await Hash.make('password123')

      await User.create({
        username,
        email,
        password,
      })
    }
  }
}

module.exports = UserSeeder
