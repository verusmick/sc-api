'use strict'

module.exports = app => {
  var userHandlers = require('../controllers/user.cntrl.js');
  var accountHandler = require('../controllers/account.controller');
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

  // account endpoints
  app.route('/account')
    .post(accountHandler.createAccount)    // create account POST/account
    .get(accountHandler.getAccounts);      // list accounts GET/account

  app.route('/account/:id')
    .get(accountHandler.getAccount)         // get account GET/account:id
    .put(accountHandler.updateAccount)      // update account PUT/account
    .delete(accountHandler.deleteAccount);  // delete/archive account DELETE/account
};