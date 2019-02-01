'use strict';


let DAO = require('../DAOManager').queries,
    Config = require('../Config'),
    TokenManager = require('../Libs/tokenManager'),
    emailManager = require('../Libs/emailManager'),
    ERROR = Config.responseMessages.ERROR,
    Models = require('../Models/'),
    UniversalFunctions = require('../Utils/UniversalFunctions'),
    _ = require('lodash'),
    UploadManager = require('../Libs/uploadManager'),
    randomstring = require("randomstring"),
    ObjectId = require('mongoose').Types.ObjectId


///////////////////////////////   loginAdmin  //////////////////////////////////////////////////
let loginAdmin = async (payload, loginInfo) => {
    try {
        //console.log(payload,"payload ******************", UniversalFunctions.CryptData(payload.password));
        const adminData = await DAO.getDataOne(Models.Admin, {
            userName: (payload.email),
            password: UniversalFunctions.CryptData(payload.password)
        }, {}, {lean: true});
        //console.log(adminData, "adminData **************");
        if (adminData === null) throw ERROR.INVALID_CREDENTIALS_EMAIL;

        let tokenData = {
            scope: Config.APP_CONSTANTS.SCOPE.ADMIN,
            _id: adminData._id,
            time: new Date()
        };


        let promise =
            [
                TokenManager.generateToken(tokenData, Config.APP_CONSTANTS.SCOPE.ADMIN), // after successful login generate the Auth token for admin to access API's
                // DAO.saveData(Models.LoginHistory,dataToSave), // save the login history of the admin
            ];

        let [accessToken] = await Promise.all(promise); // perform both the operations parallel

        //console.log("===loginInfo=====================",loginInfo);
        return {
            accessToken: accessToken,
            adminData: adminData
        }
    } catch (err) {
        throw err;
    }
};

module.exports = {
    loginAdmin: loginAdmin
};
