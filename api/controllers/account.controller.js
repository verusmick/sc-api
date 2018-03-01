'use strict';
import mongoose from "mongoose";
// const mongoose = require("mongoose");

const Account = mongoose.model('Account');

exports.createAccount = (req, res) => {
  let newAccount = new Account(req.body);

  // as it's a new account setting active by default
  newAccount.active = true;
  newAccount.parent = newAccount.parent || '';

  if (newAccount.parent > 0) {
    Account.find({
      code: newAccount.parent,
      active: true
    }, (err, accounts) => {
      if (err) {
        res.status(400).send({
          err: err
        });
      } else if (!accounts.length) {
        res.status(400).send({
          err: 'It was/were not found parent code'
        })
      } else {
        var accountCode = newAccount.code || '';
        var parentCode = ((accounts || [])[0] || {}).code || '';

        var typeAccount = newAccount.type || '';
        var regex;

        // TODO: improve validation according to different standards that already are defined
        if (typeAccount === 'group') {
          regex = new RegExp('^' + parentCode + '\\d{1}$');
        } else {
          regex = new RegExp('^' + parentCode + '\\d{2}$');
        }

        if (!regex.test(accountCode)) {
          res.status(400).send({
            err: 'it seems that account code: ' + accountCode + ' has compatibility problems with parent code: ' + parentCode + ' please review it'
          });
        } else {
          newAccount.save((err, account) => {
            if (err) {
              res.status(400).send({
                err: err
              });
            } else {
              res.status(200).send({
                account: account
              });
            }
          });
        }
      }
    });
  } else {
    newAccount.save((err, account) => {
      if (err) {
        res.status(400).send({
          err: err
        });
      } else {
        res.status(200).send({
          account: account
        });
      }
    });
  }
};

exports.getAccounts = (req, res) => {
  let query = {};

  Account.find({active: true}, (err, accountsModel) => {
    // TODO: review, it's making a copy because object that arrives it's a moongose object
    // and cannot be handle as a normal object for tree algorith
    var accounts = JSON.parse(JSON.stringify(accountsModel));
    if (err) {
      res.status(400).send({
        err: err
      });
    } else {
      var query = req.query || {};
      var format = query.format || 'list';

      if (format === 'tree') {
        var relationRefs = {};
        var results = [];
        var account;
        var rootAccountsCodes = [];
        var accountRefs = {};

        for (var i = 0; i < accounts.length; i++) {
          account = accounts[i] || {};
          account.children = [];

          accountRefs[account.code] = account;

          if (!account.parent) {
            results.push(account);
            rootAccountsCodes.push(account.code);
          } else {
            if (!relationRefs[account.parent]) {
              relationRefs[account.parent] = [];
            }

            relationRefs[account.parent].push(account);
          }
        }

        for (var accountCode in relationRefs) {
          if (relationRefs.hasOwnProperty(accountCode)) {
            if (accountRefs.hasOwnProperty(accountCode)) {
              accountRefs[accountCode].children = relationRefs[accountCode];
            }
          }
        }

        res.status(200).send({
          results: results
        });
      } else {
        res.status(200).send({
          results: accounts
        });
      }
    }
  });
};

exports.getAccount = (req, res) => {
  let accountId = req.params.id;

  Account.find({_id: accountId, active: true}, (err, account) => {
    if (err) {
      res.status(400).send({
        err: err
      });
    } else {
      if (account && account.length > 0) {
        res.status(200).send({
          result: account[0]
        });
      }
    }
  });
}

exports.updateAccount = (req, res) => {
  let accountId = req.params.id;
  let accountUpdate = req.body;

  Account.findOne({
    _id: accountId,
    active: true
  }, (err, account) => {
    if (err) {
      res.status(400).send({
        err: err
      });
    } else {
      if (!account) {
        res.status(400).send({
          err: 'Account with code: ' + accountUpdate.name + ' couldn\'t be found'
        })
      } else {
        if (accountUpdate.hasOwnProperty('name')) {
          account.name = accountUpdate.name;
        }

        if (accountUpdate.hasOwnProperty('description')) {
          account.description = accountUpdate.description;
        }

        if (accountUpdate.hasOwnProperty('type')) {
          account.type = accountUpdate.type;
        }

        account.save(accountUpdate, (errUpdate, accountUpdateData) => {
          if (err) {
            res.status(400).send({
              err: errUpdate
            });
          } else {
            res.status(201).send({
              account: accountUpdateData
            });
          }
        });
      }
    }
  })

  // Account.findByIdAndUpdate(accountId, account, (err, account) => {
  //   if (err) {
  //     res.status(400).send({
  //       err: err
  //     });
  //   } else {
  //     res.status(201).send(account);
  //   }
  // });
};

exports.deleteAccount = (req, res) => {
  let accountId = req.params.id;
  // let accountDelete = req.body;

  Account.findOne({
    _id: accountId,
    active: true
  }, (err, account) => {
    if (err) {
      res.status(400).send({
        err: err
      });
    } else {
      if (!account) {
        res.status(400).send({
          err: 'Account with code: ' + accountUpdate.name + ' couldn\'t be found'
        });
      } else {
        var accountCode = account.code;

        Account.find({
          parent: accountCode
        }, (errChildrenSeek, childrenAccounts) => {
          if (errChildrenSeek) {
            res.status(400).send({
              err: err
            });
          } else {
            if (childrenAccounts && childrenAccounts.length > 0) {
              res.status(400).send({
                err: 'currently account: ' + account.name + ' has refernced some accounts as children, first remove those ones first'
              });
            } else {
              account.active = false;
              account.update(account, (err, accountDeleted) => {
                if (err) {
                  res.status(400).send({
                    err: err
                  });
                } else {
                  res.status(204).send({
                  });
                }
              });
            }
          }
        })
      }
    }
  });

};
