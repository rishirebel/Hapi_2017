'use strict';


let Controller = require('../Controller');
let UniversalFunctions = require('../Utils/UniversalFunctions');
let Joi = require('joi');
let Config = require('../Config');
let SUCCESS = Config.responseMessages.SUCCESS;
let ERROR = Config.responseMessages.ERROR;

const basicAuth = function (request, reply) {
    if (request.payload.adminType != "SUPER_ADMIN") {
        var error = "You are not authorized to access this functionality.";
        return UniversalFunctions.sendError("en", ERROR.UNAUTHORIZED);
    } else {
        return reply.continue;
    }
};

let NonAuthRoutes = [

    {
        method: 'POST',
        path: '/admin/loginAdmin',
        config: {
            description: 'Login Admin',
            auth: false,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                return Controller.adminController.loginAdmin(request.payload, request.info)
                    .then(response => {
                        return UniversalFunctions.sendSuccess("en", SUCCESS.DEFAULT, response, h);
                    })
                    .catch(error => {
                        winston.error("=========error=========", error);
                        return UniversalFunctions.sendError("en", error, h);
                    });
            },
            validate: {
                payload: {
                    //email: Joi.string().email().required().lowercase().trim(),
                    email: Joi.string().required().trim(),
                    password: Joi.string().required().trim()
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },

];

module.exports = [ ...NonAuthRoutes];
