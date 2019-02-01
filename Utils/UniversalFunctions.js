const Boom = require('boom'),
    Models = require('../Models'),
    Joi = require('joi'),
    Config = require('../Config'),
    ERROR = Config.responseMessages.ERROR,
    SUCCESS = Config.responseMessages.SUCCESS,
    ObjectId = require('mongoose').Types.ObjectId,
    DAO = require('../DAOManager').queries,
    MD5 = require('md5');


const CryptData = function (stringToCrypt) {
    return MD5(MD5(stringToCrypt));
};

function sendError(language, data, reply) {
    console.log("-----------------error------------------", data);
    let error;
    if (typeof data == 'object' && data.hasOwnProperty('statusCode') && data.hasOwnProperty('customMessage')) {
        let finalMessage = data.customMessage;
        if (language && language == "ar") finalMessage = data.customMessage;
        error = Boom.create(data.statusCode, finalMessage);
        if (data.hasOwnProperty('type')) {
            error.output.payload.type = data.type;
            winston.error(error);
            return error;
        }
    } else {
        let errorToSend = '',
            type = '';

        if (typeof data == 'object') {
            if (data.name == 'MongoError') {

                if (language && language == "ar") errorToSend += ERROR.DB_ERROR.customMessage.ar;
                else errorToSend += ERROR.DB_ERROR.customMessage.en;

                type = ERROR.DB_ERROR.type;
                if (data.code = 11000) {

                    if (language && language == "ar") errorToSend += ERROR.DUPLICATE.customMessage.ar;
                    else errorToSend += ERROR.DUPLICATE.customMessage.en;

                    type = ERROR.DUPLICATE.type;
                }
            } else if (data.name == 'ApplicationError') {

                if (language && language == "ar") errorToSend += ERROR.APP_ERROR.customMessage.ar;
                else errorToSend += ERROR.APP_ERROR.customMessage.en;

                type = ERROR.APP_ERROR.type;
            } else if (data.name == 'ValidationError') {

                if (language && language == "ar") errorToSend += ERROR.APP_ERROR.customMessage.ar + data.message;
                else errorToSend += ERROR.APP_ERROR.customMessage.en + data.message;

                type = ERROR.APP_ERROR.type;
            } else if (data.name == 'CastError') {

                if (language && language == "ar") errorToSend += ERROR.DB_ERROR.customMessage.ar + ERROR.INVALID_OBJECT_ID.customMessage.ar;
                else errorToSend += ERROR.DB_ERROR.customMessage.en + ERROR.INVALID_OBJECT_ID.customMessage.en;

                type = ERROR.INVALID_OBJECT_ID.type;
            } else if (data.response) {
                errorToSend = data.response.message;
            }
        } else {
            errorToSend = data;
            type = ERROR.DEFAULT.type;
        }
        let customErrorMessage = errorToSend;
        if (typeof errorToSend == 'string') {
            if (errorToSend.indexOf("[") > -1) {
                customErrorMessage = errorToSend.substr(errorToSend.indexOf("["));
            } else {
                customErrorMessage = errorToSend;
            }
            customErrorMessage = customErrorMessage.replace(/"/g, '');
            customErrorMessage = customErrorMessage.replace('[', '');
            customErrorMessage = customErrorMessage.replace(']', '');
        }
        error = Boom.create(400, customErrorMessage);
        error.output.payload.type = type;
        winston.error(error);
        winston.log("error", error);
        return error;
    }
};

function sendSuccess(language, successMsg, data, h) {
    successMsg = successMsg || SUCCESS.DEFAULT.customMessage.en;

    if (typeof successMsg == 'object' && successMsg.hasOwnProperty('statusCode') && successMsg.hasOwnProperty('customMessage')) {

        let finalMessage = successMsg.customMessage.en;
        if (language && language == "ar") finalMessage = successMsg.customMessage.ar;

        return {statusCode: successMsg.statusCode, message: finalMessage, data: data || {}};
    } else return {statusCode: 200, message: successMsg, data: data || {}};
};

function failActionFunction(request, reply, error) {

    winston.info("==============request===================", request.payload, error)
    winston.log("==============request===================", request.payload, error)
    error.output.payload.type = "Joi Error";

    if (error.isBoom) {
        delete error.output.payload.validation;
        if (error.output.payload.message.indexOf("authorization") !== -1) {
            error.output.statusCode = ERROR.UNAUTHORIZED.statusCode;
            console.log(error);
            return reply(error);
        }
        let details = error.details[0];
        if (details.message.indexOf("pattern") > -1 && details.message.indexOf("required") > -1 && details.message.indexOf("fails") > -1) {
            error.output.payload.message = "Invalid " + details.path;
            console.log(error);
            return reply(error);
        }
    }
    let customErrorMessage = '';
    if (error.output.payload.message.indexOf("[") > -1) {
        customErrorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf("["));
    } else {
        customErrorMessage = error.output.payload.message;
    }
    customErrorMessage = customErrorMessage.replace(/"/g, '');
    customErrorMessage = customErrorMessage.replace('[', '');
    customErrorMessage = customErrorMessage.replace(']', '');
    error.output.payload.message = customErrorMessage.replace(/\b./g, (a) => a.toUpperCase());
    delete error.output.payload.validation;
    console.log(error);
    return error;
};

const generateFilenameWithExtension = function (oldFilename, newFilename) {
    console.log("oldFilename, newFilenameoldFilename, newFilenameoldFilename, newFilename", oldFilename, newFilename);
    let ext = oldFilename.substr(oldFilename.lastIndexOf(".") + 1);
    return newFilename + new Date().getTime() + Math.floor(Math.random() * 2920) + 1 + '.' + ext;
}

async function getSignUpResponse(payload, id) {

    console.log("===getSignUpResponse===================", payload, id);
    let pipeLine = [
        {
            $match: {
                "_id": ObjectId(id)
            }
        },
        {
            $addFields: {

                "phoneNumberObject": {
                    $arrayElemAt: [{
                        $filter: {
                            input: "$phoneNumberArray",
                            as: "item",
                            cond: {$eq: ["$$item.phoneNo", {$cond: [payload.phoneNo, payload.phoneNo, '']}]}
                        }
                    }, 0]
                },

                "emailIdObject": {
                    $arrayElemAt: [{
                        $filter: {
                            input: "$emailIdArray",
                            as: "item",
                            cond: {$gte: ["$$item.emailId", {$cond: [payload.emailId, payload.emailId, '']}]}
                        }
                    }, 0]
                }

            }
        }
    ];
    return await DAO.aggregateData(Models.User, pipeLine)
}

async function getSignUpResponse1(payload) {


    let obj = {
            $arrayElemAt: [{
                $filter: {
                    input: "$phoneNumberArray",
                    as: "item",
                    cond: {$eq: ["$$item.isRODefault", true]}
                }
            }, 0]
        },

        obj1 = {
            $arrayElemAt: [{
                $filter: {
                    input: "$emailIdArray",
                    as: "item",
                    cond: {$eq: ["$$item.isRODefault", true]}
                }
            }, 0]
        },

        obj2 = {
            $arrayElemAt: [{
                $filter: {
                    input: "$address",
                    as: "item",
                    cond: {$eq: ["$$item.type", "RO"]}
                }
            }, 0]
        },

        obj3 = {
            $arrayElemAt: [{
                $filter: {
                    input: "$address",
                    as: "item",
                    cond: {$eq: ["$$item.type", "ROC"]}
                }
            }, 0]
        },

        obj4 = {
            $arrayElemAt: [{
                $filter: {
                    input: "$phoneNumberArray",
                    as: "item",
                    cond: {$eq: ["$$item.isRODefault", true]}
                }
            }, 0]
        },


        obj5 = {
            $arrayElemAt: [{
                $filter: {
                    input: "$emailIdArray",
                    as: "item",
                    cond: {$eq: ["$$item.isRODefault", true]}
                }
            }, 0]
        };


    if (payload.role === Config.APP_CONSTANTS.DATABASE_CONSTANT.USER_TYPE.ROC) {
        obj = {
            $arrayElemAt: [{
                $filter: {
                    input: "$phoneNumberArray",
                    as: "item",
                    cond: {$eq: ["$$item.isROCDefault", true]}
                }
            }, 0]
        };

        obj1 = {
            $arrayElemAt: [{
                $filter: {
                    input: "$emailIdArray",
                    as: "item",
                    cond: {$eq: ["$$item.isROCDefault", true]}
                }
            }, 0]
        };

        obj2 = {
            $arrayElemAt: [{
                $filter: {
                    input: "$address",
                    as: "item",
                    cond: {$eq: ["$$item.type", "RO"]}
                }
            }, 0]
        };

    } else if (payload.role === Config.APP_CONSTANTS.DATABASE_CONSTANT.USER_TYPE.ROF) {
        obj = {
            $arrayElemAt: [{
                $filter: {
                    input: "$phoneNumberArray",
                    as: "item",
                    cond: {$eq: ["$$item.isROFDefault", true]}
                }
            }, 0]
        };

        obj1 = {
            $arrayElemAt: [{
                $filter: {
                    input: "$emailIdArray",
                    as: "item",
                    cond: {$eq: ["$$item.isROFDefault", true]}
                }
            }, 0]
        };

        obj2 = {
            $arrayElemAt: [{
                $filter: {
                    input: "$address",
                    as: "item",
                    cond: {$eq: ["$$item.type", "ROF"]}
                }
            }, 0]
        };
    } else if (payload.role === Config.APP_CONSTANTS.DATABASE_CONSTANT.USER_TYPE.ROCM) {
        obj = {
            $arrayElemAt: [{
                $filter: {
                    input: "$phoneNumberArray",
                    as: "item",
                    cond: {$eq: ["$$item.isROCMDefault", true]}
                }
            }, 0]
        };

        obj1 = {
            $arrayElemAt: [{
                $filter: {
                    input: "$emailIdArray",
                    as: "item",
                    cond: {$eq: ["$$item.isROCMDefault", true]}
                }
            }, 0]
        };

        obj2 = {
            $arrayElemAt: [{
                $filter: {
                    input: "$address",
                    as: "item",
                    cond: {$eq: ["$$item.type", "ROCM"]}
                }
            }, 0]
        };
    } else if (payload.role === Config.APP_CONSTANTS.DATABASE_CONSTANT.USER_TYPE.ROFM) {
        obj = {
            $arrayElemAt: [{
                $filter: {
                    input: "$phoneNumberArray",
                    as: "item",
                    cond: {$eq: ["$$item.isROFMDefault", true]}
                }
            }, 0]
        };

        obj1 = {
            $arrayElemAt: [{
                $filter: {
                    input: "$emailIdArray",
                    as: "item",
                    cond: {$eq: ["$$item.isROFMDefault", true]}
                }
            }, 0]
        };

        obj2 = {
            $arrayElemAt: [{
                $filter: {
                    input: "$address",
                    as: "item",
                    cond: {$eq: ["$$item.type", "ROFM"]}
                }
            }, 0]
        };
    }


    let addFields = {

        "phoneNumberObject": obj,

        "emailIdObject": obj1,

        "address": obj2,

        "companyAddress": obj3,

    };

    if (payload.role === Config.APP_CONSTANTS.DATABASE_CONSTANT.USER_TYPE.ROC) {
        addFields = {
            "phoneNumberObject": obj4,

            "emailIdObject": obj5,

            "address": obj2,

            "companyAddress": obj3,

            "companyNumberObject": obj,

            "companyEmailObject": obj1

        };
    }


    let pipeLine = [
        {
            $match: {
                "_id": ObjectId(payload._id)
            }
        },
        {
            $addFields: addFields
        }
    ];

    let step1 = await DAO.aggregateData(Models.User, pipeLine);

    return step1;
}

const authorizationHeaderObj = Joi.object({
    authorization: Joi.string().required()
}).unknown();

function addDaysToDate(Date, days) {
    var newDate = moment(Date).add(days, 'days').format('YYYY-MM-DD');
    return newDate;
}

module.exports = {

    failActionFunction: failActionFunction,
    sendSuccess: sendSuccess,
    sendError: sendError,
    CryptData: CryptData,
    generateFilenameWithExtension: generateFilenameWithExtension,
    getSignUpResponse: getSignUpResponse,
    getSignUpResponse1: getSignUpResponse1,
    authorizationHeaderObj: authorizationHeaderObj,
    Config: Config,
    addDaysToDate: addDaysToDate
};