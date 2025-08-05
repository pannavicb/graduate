'use strict'

const User = use('App/Models/User')
const Database = use('Database')
const moment = require('moment')

class DashboardController {
  async index({ response }) {
    // 1. จำนวนผู้ใช้ทั้งหมด
    const totalUsers = await User.getCount()

    // 2. จำนวนผู้ใช้ที่สมัครวันนี้
    const today = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
    const registeredToday = await Database
      .from('users')
      .where('created_at', '>=', today)
      .count('* as count')
    const usersToday = registeredToday[0].count

    // 3. ผู้ใช้ล่าสุด 5 คน
    const latestUsers = await User.query().orderBy('created_at', 'desc').limit(5).fetch()

    return response.ok({
      total_users: totalUsers,
      users_registered_today: usersToday,
      latest_users: latestUsers
    })
  }
}

module.exports = DashboardController
