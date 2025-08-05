'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

// Route ตัวอย่างเดิม
Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})

 Route.get('/dashboard', 'DashboardController.index')

  // User API CRUD routes
  Route.get('/users', 'UserController.index')
  Route.post('/users', 'UserController.store')
  Route.get('/users/:id', 'UserController.show')
  Route.put('/users/:id', 'UserController.update')
  Route.delete('/users/:id', 'UserController.destroy')

  // Graduate API CRUD routes
  Route.get('graduates', 'GraduateController.index')
  Route.post('graduates', 'GraduateController.store')
  Route.get('graduates/:id', 'GraduateController.show')
  Route.put('graduates/:id', 'GraduateController.update')
  Route.delete('graduates/:id', 'GraduateController.destroy')


