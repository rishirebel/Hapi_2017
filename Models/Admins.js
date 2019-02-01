'use strict';

/*
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const Admins = new Schema({
    name: {type: String, trim: true, default: null},
    email: {type: String, trim: true, default: null, index: true},
    password: {type: String, required:true},
    registrationDate: {type: Date, default: Date.now, required: true},
});

module.exports = mongoose.model('Admins', Admins);

*/


const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Config = require('../Config'),
    type = Config.APP_CONSTANTS.DATABASE.ADMIN_TYPE;

const Admin = new Schema({
    userName: {type: String, unique: true, required: true},
    password: {type: String},
    accessToken: {type: String},
    registrationDate: {type: Date, default: Date.now()},
    loginCount: {type: Number, default: 0},
    lastLogin: {type: Date, default: Date.now()},
    mobileNo: {type: String, required: true},
    countryCode: {type: String},
    adminType: {
        type: String, enum: [
            type.SUPER_ADMIN,
            type.FINANCE_ADMIN,
            type.SUB_ADMIN,
            type.STAFF_ADMIN,
        ]
    },
    status: {type: Number, default: 1}   // 1 for acticve 2 for deactive 3 for deleted
});

module.exports = mongoose.model('Admin', Admin);
