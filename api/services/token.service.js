'use strict';
import mongoose from "mongoose"
import utils from "../utils/utils.service"
const TK  = mongoose.model('Token')
const intervalExpTime = 12 //this value is in hours,


exports.create = (userId) => {
  let newTK = new TK({
    tk: utils.generateUUID(),
    userId: userId,
    expirationDate:utils.addHoursToCurrentTime(intervalExpTime)
  })
  return  newTK.save((err, tk) => {
    if (err) throw err
    return tk
  })
}

exports.getList = () => {
  TK.find({}, function(err) {
    if (err) throw err
  })
}

exports.getToken = (index, value) => {
  let tk = {}
  tk[index] = value
  return TK.find(tk, function (err, tk) {})
}

exports.deleteOne = (index, value) => {
  let tk = {}
  tk[index] = value
  return TK.findOneAndRemove(tk, function (err) {
    if (err) return err
  })
}

exports.deleteAll = () =>{
  TK.remove((err) => {
    if(err)throw err
  })
}

exports.updateToken = (userId) => {
  return new Promise((resolve, reject) => {
    TK.findOneAndUpdate({userId: userId},
      {expirationDate: utils.addHoursToCurrentTime(intervalExpTime)},
      {new: true},
      (error, resp) => {
        if (error) {
          return reject(error)
        }
        return resolve(resp)
      })
  })
}