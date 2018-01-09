'use strict'
import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
var cors = require('cors')

/*** Import Models ***/
import User from "./api/models/userModel"
import TK from "./api/models/token.model"

/*** Import Controllers ***/
import tkHandlers from "./api/services/token.service"
import utils from "./api/utils/utils.service"

import routes from "./api/routes/todoListRoutes"
import config from "./api/config"

const app = express()
const port = process.env.PORT || 8000

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/sc', {useMongoClient: true})

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

/*** Set PATH  ***/

config.setPATH(__dirname)

/*** Interceptor ***/
app.use((req, res, next) => {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'SFT') {
    tkHandlers.getToken('tk', req.headers.authorization.split(' ')[1]).then((token) => {
      let tk = token[0]
      if (!tk) {
        req.userId = undefined
        return next()
      } else if (utils.convISODateToTimestamp(tk.expirationDate) < Date.now()) {
        req.userId = undefined
      } else {
        req.userId = tk.userId
      }
      return next()
    })
  } else {
    req.userId = undefined
    next()
  }
})
routes(app)

app.use((req, res) => {
  res.status(404).send({url: req.originalUrl + ' not found'})
})

app.listen(port)
console.log('todo list RESTful API server started on: ' + port)
module.exports = app