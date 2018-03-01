'use strict';
import mongoose from "mongoose"
// const mongoose = require("mongoose");

const Schema = mongoose.Schema

/**
 * TK Schema
 */
var accountTypeSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  accountTypeId: {
    type: Number,
    required: true,
    unique: true,
  }
});

module.exports = mongoose.model('AccountType', accountTypeSchema);