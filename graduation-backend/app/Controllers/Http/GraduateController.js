'use strict'

const Graduate = use('App/Models/Graduate')

class GraduateController {
  async index({ response }) {
    const graduates = await Graduate.all()
    return response.json(graduates)
  }

  async store({ request, response }) {
    const data = request.only([
      'order_no',
      'student_id',
      'name',
      'call_time',
      'status',
      'last_update',
      'rfid',
      'scan_time_1',
      'scan_time_2'
    ])

    const graduate = await Graduate.create(data)
    return response.status(201).json(graduate)
  }

  async show({ params, response }) {
    const graduate = await Graduate.find(params.id)
    return response.json(graduate)
  }

  async update({ params, request, response }) {
    const graduate = await Graduate.findOrFail(params.id)
    const data = request.only([
      'order_no',
      'student_id',
      'name',
      'call_time',
      'status',
      'last_update',
      'rfid',
      'scan_time_1',
      'scan_time_2'
    ])

    graduate.merge(data)
    await graduate.save()
    return response.json(graduate)
  }

  async destroy({ params, response }) {
    const graduate = await Graduate.findOrFail(params.id)
    await graduate.delete()
    return response.status(204).json(null)
  }
}

module.exports = GraduateController
