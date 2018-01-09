'use strict'

module.exports = app => {
  var userHandlers = require('../controllers/user.cntrl.js')
  app.route('/users')
    .post(userHandlers.register)
    .get(userHandlers.loginRequired, userHandlers.listAllUsers)

  app.route('/users/:userId')
    .get(userHandlers.loginRequired, userHandlers.getUser)
    .delete(userHandlers.loginRequired, userHandlers.removeUser)
    .put(userHandlers.loginRequired, userHandlers.updateUser)

  app.route('/auth/login')
    .post(userHandlers.signIn)

  app.route('/auth/logout')
    .delete(userHandlers.loginRequired, userHandlers.logout)
}