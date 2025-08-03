'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')

class UserController {
  async index ({ response }) {
    const users = await User.all()
    return response.json(users)
  }

  async store ({ request, response }) {
    const data = request.only(['username', 'email', 'password'])
    data.password = await Hash.make(data.password)

    const user = await User.create(data)
    return response.status(201).json(user)
  }

  async show ({ params, response }) {
    const user = await User.find(params.id)
    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }
    return response.json(user)
  }

  async update ({ params, request, response }) {
    const user = await User.find(params.id)
    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    const data = request.only(['username', 'email'])
    user.merge(data)
    await user.save()

    return response.json(user)
  }

  async destroy ({ params, response }) {
    const user = await User.find(params.id)
    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    await user.delete()
    return response.status(204).send()
  }
}

module.exports = UserController
