'use strict';

let mongoose = require('mongoose'),
    Config = require('../Config'),
    DAO = require('../DAOManager').queries,
    Models = require('../Models');

mongoose.Promise = Promise;

console.log(process.env);

//Connect to MongoDB
mongoose.connect('mongodb://user:password@localhost/dummy', {}).then(success => {
    winston.info('MongoDB Connected');
    //run();
}).catch(err => {
    console.log("====================", err)
    winston.info({ERROR: err});
    process.exit(1);
});

/*
async function run() {

    /!*-------------------------------------------------------------------------------
     * add admin
     * -----------------------------------------------------------------------------*!/
    let password = "1e7eebb19ca71233686f26a43bbc18a9";

    let adminDetails = {
        name: "Ishan Garg",
        email: "admin@requestonline.com",
        password: password,           //321321
        // registrationDate: new Date()                                                       // UTC
    };
    let adminDetails1 = {
        name: "Zeyad",
        email: "zash@requestonline.com",
        password: password,           //321321
        // registrationDate: new Date()                                                       // UTC
    };

    /!*-------------------------------------------------------------------------------
     * add admin defaults
     * -----------------------------------------------------------------------------*!/

    try {
        const promise = [
            createAdmin(adminDetails),
            createAdmin(adminDetails1)
        ];
        await Promise.all(promise);
        winston.log("info", "Bootstrap Completed");
    }
    catch (err) {
        winston.log("info", {ERROR: err})
    }
}

function createAdmin(adminDetails) {
    return new Promise((resolve, reject) => {
        try {
            // console.log("====================");
            let adminData = DAO.findAndUpdate(Models.Admins, {email: adminDetails.email}, adminDetails, {
                lean: true,
                upsert: true,
                new: true
            });
            return resolve("Admin Added");
        } catch (err) {
            return reject(err);
        }
    });
}*/
