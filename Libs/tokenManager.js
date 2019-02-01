'use strict'
let Jwt = require('jsonwebtoken'),
    Config = require('../Config'),
    DAO = require('../DAOManager').queries,
    Models = require('../Models/'),
    UniversalFunctions = require('../Utils/UniversalFunctions'),
    ERROR = Config.responseMessages.ERROR;

let generateToken = (tokenData, userType) => {
    return new Promise((resolve, reject) => {
        try {

            console.log("=========userType========", userType);
            let secretKey;
            switch (userType) {
                case Config.APP_CONSTANTS.SCOPE.USER:
                    secretKey = Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY_USER;
                    break;
                case Config.APP_CONSTANTS.SCOPE.SUPPLIER:
                    secretKey = Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY_Supplier;
                    break;
                case Config.APP_CONSTANTS.SCOPE.ADMIN:
                    secretKey = Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY_ADMIN;
                    break;
                default:
                    secretKey = Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY_ADMIN;
            }

            let token = Jwt.sign(tokenData, secretKey);
            console.log("=======secretKey==========", token, secretKey)

            return resolve(token);
        } catch (err) {
            return reject(err);
        }
    });
};


let verifyToken = async (tokenData) => {

    let user;
    if (tokenData.scope === Config.APP_CONSTANTS.SCOPE.ADMIN)
        user = await DAO.getData(Models.Admins, {_id: tokenData._id}, {__v: 0, password: 0}, {lean: true});
    else if (tokenData.scope === Config.APP_CONSTANTS.SCOPE.SUPPLIER)
        user = await DAO.getData(Models.Suppliers, {_id: tokenData._id}, {__v: 0}, {lean: true});
    else if (tokenData.scope === Config.APP_CONSTANTS.SCOPE.USER)
        user = await DAO.getData(Models.User, {_id: tokenData._id}, {__v: 0}, {lean: true});

    if (user && user[0]) {

        user[0].scope = tokenData.scope;
        return {
            isValid: true,
            credentials: user[0]
        };
    } else throw UniversalFunctions.sendError("en", ERROR.UNAUTHORIZED);

};

module.exports = {
    generateToken: generateToken,
    verifyToken: verifyToken
};