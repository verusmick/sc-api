'use strict';
import mongoose from "mongoose"
// const mongoose = require("mongoose");

const Schema = mongoose.Schema

/**
 * TK Schema
 */
var accountSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: false,
    unique: false
  },
  accountTypeId: {
    type: Number,
    _def: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountType' }
  },
  code: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  type: {
    type: String,
    trim: true,
    required: true,
    unique: false,
    enum: ['group', 'detail']
  },
  parent: {
    type: String,
    required: false,
    validate: {
      validator: function(value) {
        if (this.type === 'group' && (this.code || '').length > 1) {
          return !!value
        } else {
          return true;
        }
      }
    }
  },
  active: {
    type: Boolean,
    required: false
  },
  accountId: {
    type: String,
    required: false
    // unique: true,
  }
});

module.exports = mongoose.model('Account', accountSchema);