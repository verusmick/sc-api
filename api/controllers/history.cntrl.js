'use strict';
import _ from "lodash"
import mongoose from "mongoose"

const Licenses = mongoose.model('License');

exports.listAllMacAddress = (req, res) => {
  function parserMacAddresResp(macList) {
    return _.forEach(macList, function (value) {
      value['macAddress'] = value._id;
      delete value._id;
    });
  }

  let agg = [
    {
      $group: {
        _id: "$macAddress", totalLicenses: {$sum: 1}
      }
    }
  ];

  Licenses.aggregate(agg, function (err, macList) {
    if (err)
      res.send(err)
    res.json(parserMacAddresResp(macList));
  });
}

exports.listAllLicenseTo = (req, res) => {
  function parserLicenseToResp(macList) {
    return _.forEach(macList, function (value) {
      value['licenseTo'] = value._id;
      delete value._id;
    });
  }

  let agg = [
    {
      $group: {
        _id: "$licenseTo", totalLicenses: {$sum: 1}
      }
    }
  ];

  Licenses.aggregate(agg, function (err, licenseToList) {
    if (err)
      res.send(err)
    res.json(parserLicenseToResp(licenseToList))
  })
}

exports.licensesList = (req, res) => {
  if(req.query && req.query.format && req.query.format === 'tree'){
    licensesListTree(req, res)
  }else{
    Licenses.find({}, function(err, task) {
      if (err)
        res.send(err)
      res.json(task)
    })
  }
}

function licensesListTree (req, res)  {
  let agg = [

    {
      $group: {
        _id: {
          licenseTo: "$licenseTo",
          endCustomer: "$endCustomer",
          macAddress: "$macAddress"
        },
        licenses: {
          $push: {
            _id: "$_id",
            endCustomer:"$endCustomer",
            licenseName: "$licenseName",
            licenseTypeCode: "$licenseTypeCode",
            content: "$content",
            options: "$options",
            filename: "$filename",
            creationDate: "$creationDate",
            macAddress: "$macAddress",
            licenseTo:"$licenseTo"
          }
        }

      }
    },
    {
      $group: {
        _id: {
          licenseTo: "$_id.licenseTo",
          endCustomer: "$_id.endCustomer"
        },
        sf_devices: {$push:{macAddress:"$_id.macAddress", licenses: "$licenses",} }
      }
    },
    {
      $group: {
        _id: "$_id.licenseTo",
        endCustomers: {$push: {endCustomer: "$_id.endCustomer", sf_devices: "$sf_devices"}}
      }
    },
    {$sort: {_id: 1}},
    {$project: { _id: 0, licenseTo: "$_id", endCustomers: "$endCustomers" }}

  ];

  Licenses.aggregate(agg, function (err, treeList) {
    if (err)
      res.send(err)
    res.json(treeList)
  });
}

