'use strict'

const User = use('App/Models/User')

class UserController {
  // GET /users
  async index({ response }) {
    const users = await User.all()
    return response.status(200).json({
      status: 'success',
      data: users
    })
  }

  // GET /users/:id
  async show({ params, response }) {
    const user = await User.find(params.id)
    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }
    return response.status(200).json(user)
  }

  // POST /users
  async store({ request, response }) {
    const data = request.only(['name', 'email'])
    const user = await User.create(data)
    return response.status(201).json(user)
  }

  // PUT /users/:id
  async update({ params, request, response }) {
    const user = await User.find(params.id)
    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    const data = request.only(['name', 'email'])
    user.merge(data)
    await user.save()

    return response.status(200).json(user)
  }

  // DELETE /users/:id
  async destroy({ params, response }) {
    const user = await User.find(params.id)
    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    await user.delete()
    return response.status(200).json({ message: 'User deleted successfully' })
  }
}

module.exports = UserController
