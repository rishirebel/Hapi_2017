'use strict';

const async = require('async');
const Config = require('../Config');
const FCM = require('fcm-node');
const gcm = require('node-gcm');
const client = require('twilio')(Config.smsConfig.twilioCredentials.accountSid, Config.smsConfig.twilioCredentials.authToken);
const nodeMailerModule = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const mandrillTransport = require('nodemailer-mandrill-transport');
const transport = nodeMailerModule.createTransport(smtpTransport(Config.emailConfig.nodeMailer.Mandrill));
const Models = require('../Models');
const moment = require('moment');
//var transport = nodeMailerModule.createTransport(mandrillTransport({
//    auth: {
//        apiKey: 'QLh2vY7dNMda3N_xyLyQ7w'
//    }
//}));
var Path = require('path');
var apns = require('apn');
var plivo = require('plivo');
/*
const serverKeyUser = '';
const fcm = new FCM(serverKeyUser);
*/

const sendPushUser = (notificationData, callback) => {
    async.auto({
        sendPush: (cb) => {
            const message = {
                to: notificationData.deviceToken,
                notification: {
                    sound: 'default',
                    badge: 1,
                    title: notificationData.title || "",
                    body: notificationData.body || "",
                    type: notificationData.type || "",
                    notificationData: notificationData
                },
                data: {
                    sound: 'default',
                    badge: 1,
                    title: notificationData.title || "",
                    body: notificationData.body || "",
                    type: notificationData.type || "",
                    notificationData: notificationData
                },
                priority: 'high'
            };
            console.log("............message.............", message);
            fcm.send(message, (err, result) => {
                if (err) {
                    console.log("Something has gone wrong!", err);
                    callback(err);
                } else {
                    console.log("Successfully sent with response: ", result);
                    cb(null, result);
                }
            });
        }
    }, (err, result) => {
        callback(err, result);
    })
};

const sendPushToUserInBatch = (notificationData, callback) => {
    async.auto({
        sendPush: (cb) => {
            const message = {
                registration_ids: notificationData.deviceToken,
                notification: (notificationData.deviceType === Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID) ? null : {
                    sound: 'default',
                    badge: 1,
                    title: notificationData.title || "",
                    body: notificationData.body || "",
                    type: notificationData.type || "",
                    message: notificationData.message
                },
                data: {
                    sound: 'default',
                    badge: 1,
                    title: notificationData.title || "",
                    body: notificationData.body || "",
                    type: notificationData.type || "",
                    message: notificationData.message
                },
                priority: 'high'
            };

            console.log("............message.............", message);
            fcm.send(message, (err, result) => {
                if (err) {
                    console.log("Something has gone wrong!", err);
                    cb(err);
                } else {
                    console.log("Successfully sent with response: ", result);
                    cb(null, result);
                }
            });
        }
    }, (err, result) => {
        callback(err, result);
    })
}


var sendSMSToUser = function (four_digit_verification_code, countryCode, phoneNo, externalCB) {
    // console.log('sendSMSToUser')
    var templateData = Config.APP_CONSTANTS.notificationMessages.verificationCodeMsg;
    var variableDetails = {
        four_digit_verification_code: four_digit_verification_code
    };
    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + phoneNo.toString(),
        Body: null
    };
    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendSMSToUserBookingComplete = function (tip_url, countryCode, phoneNo, externalCB) {
    // console.log('sendSMSToUser')
    var templateData = Config.APP_CONSTANTS.notificationMessages.bookingCompletedMsg;
    var variableDetails = {
        tip_url: tip_url
    };
    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + phoneNo.toString(),
        Body: null
    };
    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};


var userSmsTrigger = function (smsType, variableDetails, phoneNo, externalCB) {
    // console.log('sendSMSToUser')
    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: phoneNo,
        Body: null
    };

    async.series([
        function (internalCallback) {
            switch (smsType) {
                case 'EDIT_BOOKING_SMS' :
                    var templateData = Config.APP_CONSTANTS.notificationMessages.editBookingUserSMS;
                    smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
                    break;
                case 'EXTENSION_SMS' :
                    var templateData = Config.APP_CONSTANTS.notificationMessages.extendBookingUserSMS;
                    smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
                    //console.log('@@@@@@@ Reached at Notificaiton with SMS OPTIONS @@@@@@@@@',smsOptions);
                    break;
                case 'REASSIGNMENT_SMS' :
                    var templateData = Config.APP_CONSTANTS.notificationMessages.reassignmentBookingUserSMS;
                    smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
                    //console.log('@@@@@@@ Reached at Notificaiton with SMS OPTIONS @@@@@@@@@',smsOptions);
                    break;

                case 'SPECIAL_FIRM_REJECTED' :
                    var templateData = Config.APP_CONSTANTS.notificationMessages.specialFirmRejected;
                    //console.log('@@@@@@@@@@@@@@@@@ SPECIAL_FIRM_REJECTED  @@@@@@@@@@@@@@@@@',templateData);
                    smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);

                    break;
                case 'SPECIAL_FLEX_REJECTED' :
                    var templateData = Config.APP_CONSTANTS.notificationMessages.specialFlexRejected;
                    //console.log('@@@@@@@@@@@@@@@@@ SPECIAL_FLEX_REJECTED  @@@@@@@@@@@@@@@@@',templateData);
                    smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);

                    break;
                case 'FIRM_UNANSWERED' :
                    var templateData = Config.APP_CONSTANTS.notificationMessages.specialFirmUnawnswered;
                    smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
                    //console.log('@@@@@@@ Reached at Notificaiton with SMS OPTIONS @@@@@@@@@',smsOptions);
                    break;
                case 'FLEX_UNANSWERED' :
                    var templateData = Config.APP_CONSTANTS.notificationMessages.specialFlexUnawnswered;
                    smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
                    //console.log('@@@@@@@ Reached at Notificaiton with SMS OPTIONS @@@@@@@@@',smsOptions);
                    break;

                case 'ADMIN_SCREEN_DROP_ALTER' :
                    var templateData = Config.APP_CONSTANTS.notificationMessages.adminScreenDropAlertSMS;
                    smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
                    //console.log('@@@@@@@ Reached at Notificaiton with SMS OPTIONS @@@@@@@@@',smsOptions);
                    break;
            }
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                if (err) {
                    //console.log('ERROR IN SMS',err);
                    internalCallback(err);
                } else {
                    //console.log('SMS SUCCESS RESPONSE',res);
                    internalCallback(res);
                }
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendEmailToAdmin = function (emailType, emailVariables, emailId, callback) {
    var mailOptions = {
        from: 'support@massago.ca',
        to: emailId,
        subject: null,
        html: null
    };
    async.series([
        function (cb) {
            switch (emailType) {
                case 'ONFIDO_VERIFICATION_MAIL' :
                    mailOptions.subject = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.onfidoEmail.emailSubject, emailVariables);
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.onfidoEmail.emailMessage, emailVariables);
                    break;
                case 'MATCHING_FAIL' :
                    mailOptions.subject = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.matchingFail.emailSubject, emailVariables);
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.matchingFail.emailMessage, emailVariables);
                    break;
                /*R4.1 J*/
                case 'FIRM_UNANSWERED' :
                    mailOptions.subject = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.firmUnawnsered.emailSubject, emailVariables);
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.firmUnawnsered.emailMessage, emailVariables);
                    break;
                case 'FLEX_UNANSWERED' :
                    mailOptions.subject = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.flexUnawnsered.emailSubject, emailVariables);
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.flexUnawnsered.emailMessage, emailVariables);
                    /*R4.1 J*/
                    break;
                case 'EXTENSION_ADMIN_EMAIL' :
                    mailOptions.subject = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.extensionAdminEmail.emailSubject, emailVariables);
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.extensionAdminEmail.emailMessage, emailVariables);
                    break;
                case 'SCREEN_DROP' :
                    // mailOptions.subject = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.screenDropAdminEmail.emailSubject, emailVariables);
                    mailOptions.subject = 'Customer Screen Drop ' + emailVariables.screen_drop;
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.screenDropAdminEmail.emailMessage, emailVariables);
                    break;
                /*R5.0 K*/
                case 'TIP_PAYMENT_EMAIL' :
                    mailOptions.subject = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.tipAdminEmail.emailSubject, emailVariables);
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.tipAdminEmail.emailMessage, emailVariables);
                    break;
                case 'REFFERAL_CODE' :
                    // mailOptions.subject = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.screenDropAdminEmail.emailSubject, emailVariables);
                    mailOptions.subject = 'Customer used Referral Code of ' + emailVariables.screen_drop;
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.refferalUsedEmail.emailMessage, emailVariables);
                    break;
            }
            cb();
        }, function (cb) {
            transport.sendMail({
                from: mailOptions.from,
                to: emailId,
                subject: mailOptions.subject,
                html: mailOptions.html
            }, function (err, info) {
                ////console.log(err, info);
                cb(null);
            })
        }
    ], function (err, responses) {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });
};


/***** Release 4.0 J ******/
var bulkSmsTrigger = function (smsType, variableDetails, phoneNo, externalCB) {
    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: phoneNo,
        Body: null
    };
    async.series([
        function (internalCallback) {
            switch (smsType) {
                case 'GREETING_SMS' :
                    var templateData = variableDetails.description; //Config.APP_CONSTANTS.notificationMessages.greetingSMS;
                    smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
                    break;
            }
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                if (err) {
                    internalCallback(err);
                } else {
                    internalCallback(res);
                }
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

/***** Release 4.0  J *****/
var sendBulkEmail = function (emailType, emailVariables, emailId, callback) {
    var mailOptions = {
        from: 'support@massago.ca',
        to: emailId,
        subject: emailVariables.subject,
        html: null
    };
    async.series([
        function (cb) {
            switch (emailType) {
                case 'GREETING_MAIL' :
                    // mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.greetingCustomerEmail.emailSubject;
                    // mailOptions.subject = emailVariables.subject;
                    // mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.greetingCustomerEmail.emailMessage, emailVariables);
                    var completeEmailContant = Config.APP_CONSTANTS.STANDARDHEADER;
                    completeEmailContant += emailVariables.description;
                    completeEmailContant += Config.APP_CONSTANTS.STANDARDFOOTER

                    // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',completeEmailContant);

                    mailOptions.html = renderMessageFromTemplateAndVariables(completeEmailContant, emailVariables);

                    break;
                case 'FESTIVAL_MAIL' :
                    mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.forgotPassword.emailSubject;
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.forgotPassword.emailMessage, emailVariables);
                    break;
            }
            cb();
        }, function (cb) {
            transport.sendMail({
                from: mailOptions.from,
                to: emailId,
                subject: mailOptions.subject,
                html: mailOptions.html
            }, function (err, info) {
                cb(null);
            })
        }
    ], function (err, responses) {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });

};

/*** Release 4.0 J ***/
var sendBulkPushToUser = function (NotifData, userId, callback) {
    var deviceToken = NotifData.deviceToken;
    var deviceType = NotifData.deviceType;
    var sendTo = "USER";
    var dataToSend = NotifData.dataToSend;
    if (deviceType == Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID || deviceType == Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS) {
        if (deviceType == Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID) {
            ////console.log('Android Push Notification');
            ////console.log([deviceToken], dataToSend, sendTo);
            sendAndroidPushNotification([deviceToken], dataToSend, sendTo);
            callback('sentPushToUser');
        } else if (deviceType == Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS) {
            ////console.log('IOS Push Notification');
            sendIosPushNotification([deviceToken], dataToSend, sendTo)
            callback('sentPushToUser');
        }
    } else {
        callback(Config.responseMessages.ERROR.IMP_ERROR);
    }

}


var sendEmailToUser = function (emailType, emailVariables, emailId, callback) {
    var mailOptions = {
        from: 'support@massago.ca',
        to: emailId,
        subject: null,
        html: null
    };
    async.series([
        function (cb) {
            switch (emailType) {
                case 'REGISTRATION_MAIL' :
                    mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.registrationEmail.emailSubject;
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.registrationEmail.emailMessage, emailVariables);
                    break;
                case 'FORGOT_PASSWORD' :
                    mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.forgotPassword.emailSubject;
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.forgotPassword.emailMessage, emailVariables);
                    break;
                case 'BOOKING_CONFIRM' :
                    mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.BookingConfrmedForm.emailSubject;
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.BookingConfrmedForm.emailMessage, emailVariables);
                    break;
                case 'BOOKING_NOT_CONFIRM' :
                    mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.bookingNotConfirm.emailSubject;
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.bookingNotConfirm.emailMessage, emailVariables);
                    break;
                case 'BOOKING_COMPLETE' :
                    mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.bookingComplete.emailSubject;
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.bookingComplete.emailMessage, emailVariables);
                    break;
                case 'BOOKING_EDIT_BY_ADMIN' :
                    mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.bookingEditByAdmin.emailSubject;
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.bookingEditByAdmin.emailMessage, emailVariables);
                    break;
            }
            cb();

        }, function (cb) {
            transport.sendMail({
                from: mailOptions.from,
                to: emailId,
                subject: mailOptions.subject,
                html: mailOptions.html
            }, function (err, info) {
                ////console.log(err, info);
                cb(null);
            })
            //sendMailViaTransporter(mailOptions, function (err, res) {
            //    cb(err, res);
            //})
        }
    ], function (err, responses) {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });

};

function renderMessageFromTemplateAndVariables(templateData, variablesData) {
    var Handlebars = require('handlebars');
    return Handlebars.compile(templateData)(variablesData);
}

/*
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 @ sendSMS Function
 @ This function will initiate sending sms as per the smsOptions are set
 @ Requires following parameters in smsOptions
 @ from:  // sender address
 @ to:  // list of receivers
 @ Body:  // SMS text message
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
function sendSMS(smsOptions, cb) {
    /*var p = plivo.RestAPI({
      authId: Config.smsConfig.plivoCredentials.authId,
      authToken: Config.smsConfig.plivoCredentials.authToken
    });

    var params = {
      'src': Config.smsConfig.plivoCredentials.smsFromNumber,
      'dst': smsOptions.To,
      'text': smsOptions.Body
    };

    p.send_message(params, function (status, response) {
       console.log('Status && response : Plivo ', status, response);
      // console.log('API Response:\n', response);
        /!*** SMS LOG TO DB ***!/
          var dataToSet = {
              triggeredFrom : params.src,
              triggeredTo : params.dst,
              message :  params.text,
              response : response,
              created_at: moment(new Date).utcOffset(0).format('YYYY-MM-DD HH:mm:ss'),
              updated_at: moment(new Date).utcOffset(0).format('YYYY-MM-DD HH:mm:ss'),
          };
          Models.MessageLogs.collection.insert(dataToSet,function (err, data) {
          // Service.MessageLogsService.addMessageLogsinsert(dataToSet, function (err, data) {
          });
        /!*** SMS LOG TO DB ***!/
    });*/

    client.messages.create(smsOptions, function (err, message) {
        // console.log('Step 2: @@@@@@@@@ SMS RES @@@@@@@@@', err, message);
        if (err) {
            /*** SMS LOG TO DB ***/
            var dataToSet = {
                triggeredFrom: smsOptions.from,
                triggeredTo: smsOptions.To,
                message: smsOptions.Body,
                response: err,
                created_at: moment(new Date).utcOffset(0).format('YYYY-MM-DD HH:mm:ss'),
                updated_at: moment(new Date).utcOffset(0).format('YYYY-MM-DD HH:mm:ss'),
            };
            Models.MessageLogs.collection.insert(dataToSet, function (err, data) {
                // Service.MessageLogsService.addMessageLogsinsert(dataToSet, function (err, data) {
            });
            /*** SMS LOG TO DB ***/
        } else {
            /*** SMS LOG TO DB ***/
            var dataToSet = {
                triggeredFrom: smsOptions.from,
                triggeredTo: smsOptions.To,
                message: smsOptions.Body,
                response: message.sid,
                created_at: moment(new Date).utcOffset(0).format('YYYY-MM-DD HH:mm:ss'),
                updated_at: moment(new Date).utcOffset(0).format('YYYY-MM-DD HH:mm:ss'),
            };
            Models.MessageLogs.collection.insert(dataToSet, function (err, data) {
                // Service.MessageLogsService.addMessageLogsinsert(dataToSet, function (err, data) {
            });
            /*** SMS LOG TO DB ***/
        }
    });
    cb(null, null); // Callback is outside as sms sending confirmation can get delayed by a lot of time
}

/*
 ==============================================
 Send the notification to the android device
 ==============================================
 */
function sendAndroidPushNotification(deviceTokens, messageData, sendTo) {
    var sender = null;
    var dataToAttach = {
        message: messageData,
        title: 'MASSAGO'
    };

    if (sendTo == 'USER') {
        sender = new gcm.Sender(Config.pushConfig.androidPushSettings.user.gcmSender);
    } else {
        ////console.log("agent notifications");
        sender = new gcm.Sender(Config.pushConfig.androidPushSettings.agent.gcmSender);
    }
    var message = new gcm.Message({
        priority: 'high',
        delayWhileIdle: false,
        timeToLive: 2419200,
        data: dataToAttach
    });
    sender.send(message, deviceTokens, 4, function (err, result) {
        console.log("Device tokens", deviceTokens, message);
        console.log("ANDROID NOTIFICATION RESULT: " + JSON.stringify(result));
        console.log("ANDROID NOTIFICATION ERROR: " + JSON.stringify(err));
    });
}

/*
 ==============================================
 Send the notification to the IOS device
 ==============================================
 */


function sendIosPushNotification(iosDeviceToken, payload, sendTo) {

    var certificate = null;

    if (sendTo == 'USER') {
        console.log("User");
        certificate = Path.resolve(".") + Config.pushConfig.iOSPushSettings.user.iosApnCertificate;

    } else {
        console.log('Agent');
        certificate = Path.resolve(".") + Config.pushConfig.iOSPushSettings.agent.iosApnCertificate;
    }
    var status = 1;
    var snd = 'notification.mp3';
    //console.log('<<<<<<<<<', iosDeviceToken, certificate);
    var content = false;
    if (sendTo == 'USER') {
        var options = {
            cert: certificate,
            certData: null,
            key: certificate,
            keyData: null,
            passphrase: 'click',
            ca: null,
            pfx: null,
            pfxData: null,
            port: 2195,
            rejectUnauthorized: true,
            enhanced: true,
            cacheLength: 100,
            autoAdjustCache: true,
            connectionTimeout: 0,
            ssl: true,   // t
            debug: true,
            production: false   //  LIVE true BETA (or other) false
        };
    } else {
        var options = {
            cert: certificate,
            certData: null,
            key: certificate,
            keyData: null,
            passphrase: 'click',
            ca: null,
            pfx: null,
            pfxData: null,
            port: 2195,
            rejectUnauthorized: true,
            enhanced: true,
            cacheLength: 100,
            autoAdjustCache: true,
            connectionTimeout: 0,
            ssl: true,   // t
            debug: true,
            production: false   //  LIVE true BETA (or other) false
        };
    }

    console.log('@@@@@@@@@@ Push Options For IOS @@@@@@@@@@@@@', options);

    function log(type) {
        return function () {
            console.log("iOS PUSH NOTIFICATION RESULT: " + type);
        }
    }

    if (iosDeviceToken && iosDeviceToken.length > 0) {
        iosDeviceToken.forEach(function (tokenData) {
            try {
                var deviceToken = new apns.Device(tokenData);
                var apnsConnection = new apns.Connection(options);
                var note = new apns.Notification();

                note.expiry = Math.floor(Date.now() / 1000) + 3600;
                note.contentAvailable = content;
                note.sound = snd;
                note.alert = payload.notificationMessage;
                note.newsstandAvailable = status;
                note.payload = {
                    bookingData: payload
                };

                console.log('@@@@@@@@@@@@@ ', note.payload, '@@@@@@@@@@@@@@@');

                apnsConnection.pushNotification(note, deviceToken);

                // Handle these events to confirm that the notification gets
                // transmitted to the APN server or find error if any
                apnsConnection.on('error', log('error'));
                apnsConnection.on('transmitted', log('transmitted'));
                apnsConnection.on('timeout', log('timeout'));
                apnsConnection.on('connected', log('connected'));
                apnsConnection.on('disconnected', log('disconnected'));
                apnsConnection.on('socketError', log('socketError'));
                apnsConnection.on('transmissionError', log('transmissionError'));
                apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));
            } catch (e) {
                console.trace('exception occured', e)

            }

        })
    }
}

var sendPushToAgent = function (NotifData, agentId, callback) {
    ////console.log('sendPushToAgent', NotifData, agentId);

    var deviceToken = NotifData.deviceToken;
    var deviceType = NotifData.deviceType;
    var sendTo = "AGENT";
    var dataToSend = NotifData.dataToSend;
    //  var data = {"notificationMessage":dataToSend.notificationMessage, "notificationType" : dataToSend.notificationType, "userId": agentId, "adminId": adminId};
    if (deviceType == Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID || deviceType == Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS) {
        if (deviceType == Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID) {
            ////console.log('Android Push Notification');
            ////console.log([deviceToken], dataToSend, sendTo);
            sendAndroidPushNotification([deviceToken], dataToSend, sendTo);
            callback('sentPushToAgent');
        } else if (deviceType == Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS) {
            ////console.log('IOS Push Notification');
            sendIosPushNotification([deviceToken], dataToSend, sendTo)
            callback('sentPushToAgent');
        }
    } else {
        callback(Config.responseMessages.ERROR.IMP_ERROR);
    }

}

/*
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 @ sendMailViaTransporter Function
 @ This function will initiate sending email as per the mailOptions are set
 @ Requires following parameters in mailOptions
 @ from:  // sender address
 @ to:  // list of receivers
 @ subject:  // Subject line
 @ html: html body
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
function sendMailViaTransporter(mailOptions, cb) {
    transporter.sendMail(mailOptions, function (error, info) {
        ////console.log('Mail Sent Callback Error:', error);
        ////console.log('Mail Sent Callback Ifo:', info);
    });
    cb(null, null) // Callback is outside as mail sending confirmation can get delayed by a lot of time
}

var sendPushToUser = function (NotifData, userId, callback) {
    ////console.log('sendPushToUser', NotifData, userId);

    var deviceToken = NotifData.deviceToken;
    var deviceType = NotifData.deviceType;
    var sendTo = "USER";
    var dataToSend = NotifData.dataToSend;
    if (deviceType == Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID || deviceType == Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS) {
        if (deviceType == Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID) {
            ////console.log('Android Push Notification');
            ////console.log([deviceToken], dataToSend, sendTo);
            sendAndroidPushNotification([deviceToken], dataToSend, sendTo);
            callback('sentPushToUser');
        } else if (deviceType == Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS) {
            ////console.log('IOS Push Notification');
            sendIosPushNotification([deviceToken], dataToSend, sendTo)
            callback('sentPushToUser');
        }
    } else {
        callback(Config.responseMessages.ERROR.IMP_ERROR);
    }

}

var sendSMSToUserBlocked = function (block, countryCode, phoneNo, externalCB) {
    console.log('sendSMSToUserBlocked');
    if (block) {
        var templateData = Config.APP_CONSTANTS.notificationMessages.blockedMsg;
        var variableDetails = {};

    } else {
        var templateData = Config.APP_CONSTANTS.notificationMessages.unblockedMsg;
        var variableDetails = {};
    }

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + phoneNo.toString(),
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

function SilentsendIosPushNotification(iosDeviceToken, payload, sendTo) {

    var certificate = null;

    if (sendTo == 'USER') {
        certificate = Path.resolve(".") + Config.pushConfig.iOSPushSettings.user.iosApnCertificate;

    } else {
        certificate = Path.resolve(".") + Config.pushConfig.iOSPushSettings.agent.iosApnCertificate;
    }
    var status = 1;
    var snd = '';
    var content = true;
    ////console.log('<<<<<<<<<', iosDeviceToken, certificate);
    if (sendTo == 'USER') {
        var options = {
            cert: certificate,
            certData: null,
            key: certificate,
            keyData: null,
            passphrase: 'click',
            ca: null,
            pfx: null,
            pfxData: null,
            port: 2195,
            rejectUnauthorized: true,
            enhanced: true,
            cacheLength: 100,
            autoAdjustCache: true,
            connectionTimeout: 0,
            ssl: true,
            debug: true,
            production: false
        };
    } else {
        var options = {
            cert: certificate,
            certData: null,
            key: certificate,
            keyData: null,
            passphrase: 'click',
            ca: null,
            pfx: null,
            pfxData: null,
            port: 2195,
            rejectUnauthorized: true,
            enhanced: true,
            cacheLength: 100,
            autoAdjustCache: true,
            connectionTimeout: 0,
            ssl: true,
            debug: true,
            production: true
        };
    }

    function log(type) {
        return function () {
            ////console.log("iOS PUSH NOTIFICATION RESULT: " + type);
        }
    }

    if (iosDeviceToken && iosDeviceToken.length > 0) {
        iosDeviceToken.forEach(function (tokenData) {
            try {
                var deviceToken = new apns.Device(tokenData);
                var apnsConnection = new apns.Connection(options);
                var note = new apns.Notification();

                note.expiry = Math.floor(Date.now() / 1000) + 3600;
                note._contentAvailable = content;
                note.sound = snd;
                note.alert = payload.notificationMessage;
                note.newsstandAvailable = status;
                note.payload = {
                    bookingData: payload
                };
                ////console.log("note*****", note, note._contentAvailable)
                apnsConnection.pushNotification(note, deviceToken);

                // Handle these events to confirm that the notification gets
                // transmitted to the APN server or find error if any
                apnsConnection.on('error', log('error'));
                apnsConnection.on('transmitted', log('transmitted'));
                apnsConnection.on('timeout', log('timeout'));
                apnsConnection.on('connected', log('connected'));
                apnsConnection.on('disconnected', log('disconnected'));
                apnsConnection.on('socketError', log('socketError'));
                apnsConnection.on('transmissionError', log('transmissionError'));
                apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));
            } catch (e) {
                console.trace('exception occured', e)

            }

        })
    }
}

var silentPushTherapist = function (NotifData, agentId, callback) {
    ////console.log('sendPushToAgent', NotifData, agentId);

    var deviceToken = NotifData.deviceToken;
    var deviceType = NotifData.deviceType;
    var sendTo = "AGENT";
    var dataToSend = NotifData.dataToSend;
    if (deviceType == Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS) {
        if (deviceType == Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS) {
            ////console.log('IOS Push Notification');
            SilentsendIosPushNotification([deviceToken], dataToSend, sendTo)
            callback('sentPushToAgent');
        }
    } else {
        callback(Config.responseMessages.ERROR.IMP_ERROR);
    }

}

var sendSMSToSomeOne = function (countryCode, phoneNo, type, userDetails, date, externalCB) {
    console.log('sendSMSToSomeOne');
    var templateData = Config.APP_CONSTANTS.notificationMessages.bookingNotify;

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + phoneNo.toString(),
        Body: null
    };
    var variableDetails = {
        someOneName: type.massageDetails[1].customerName,
        userName: userDetails.name + ' ' + userDetails.lastName,
        date: date

    };
    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendSMSToRefree = function (name, name1, last2, countryCode, phoneNo, type, externalCB) {
    console.log('sendSMSToRefree');
    var templateData = Config.APP_CONSTANTS.notificationMessages.giftCard;

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + phoneNo,
        Body: null
    };
    var variableDetails = {
        amount: type.amount,
        senderName: name1 + ' ' + last2,
        receiverName: name
    };
    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendSMSToAdminRefree = function (name, name1, last2, phoneNo, type, externalCB) {
    console.log('sendSMSToAdminRefree');
    var templateData = Config.APP_CONSTANTS.notificationMessages.giftCardAdmin;

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: '1' + phoneNo,
        Body: null
    };
    var variableDetails = {
        amount: type.amount,
        senderName: name1 + ' ' + last2,
        receiverName: name
    };
    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendSMSToTherapist = function (countryCode, phoneNo, type, externalCB) {
    console.log('sendSMSToTherapist');
    var templateData = Config.APP_CONSTANTS.notificationMessages.registrationMsg;

    if (type == 'BOOKING_CONFIRM') {
        templateData = Config.APP_CONSTANTS.notificationMessages.bookingMessage;

    } else if (type == 'CUSTOMER_CANCEL') {

        templateData = Config.APP_CONSTANTS.notificationMessages.customerCancel;
    } else if (type == 'SECOND_BOOKED') {

        templateData = Config.APP_CONSTANTS.notificationMessages.firstTherpistMessage;
    } else if (type == 'NEW_BOOKING_SPECIAL') {

        templateData = Config.APP_CONSTANTS.notificationMessages.specialbooking;
    } else if (type == 'REGISTER_THERAPIST') {
        templateData = Config.APP_CONSTANTS.notificationMessages.registrationMsg
    } else if (type == 'BOOKING_NOT_CONFIRM') {
        templateData = Config.APP_CONSTANTS.notificationMessages.bookingNotConfirmedMessage
    } else if (type == 'STRIPE_ACCOUNT') {
        templateData = Config.APP_CONSTANTS.notificationMessages.stripeAccount
    } else if (type == 'REMINDER_MESSAGE') {
        templateData = Config.APP_CONSTANTS.notificationMessages.reminderMessageToTherapist
    } else if (type == 'NT_STARTED_REMINDER_MESSAGE') {
        templateData = Config.APP_CONSTANTS.notificationMessages.reminderMessageNotStarted
    }
    if (type == 'TIP_PAYMENT') {
        templateData = Config.APP_CONSTANTS.notificationMessages.tipPaymentMessage;

    }
    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + phoneNo.toString(),
        Body: null
    };
    var variableDetails = {};
    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                // /*** SMS LOG TO DB ***/
                //   var dataToSet = {
                //       triggeredFrom : Config.smsConfig.twilioCredentials.smsFromNumber,
                //       triggeredTo : countryCode + phoneNo.toString(),
                //       message : smsOptions.Body,
                //       messageType : type,
                //       messageFor: 'THERAPIST',
                //       variables : JSON.stringify(variableDetails),
                //       response : res,
                //   };
                //   Models.MessageLogs.collection.insert(dataToSet,function (err, data) {
                //   // Service.MessageLogsService.addMessageLogsinsert(dataToSet, function (err, data) {
                //   });
                // /*** SMS LOG TO DB ***/
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var register = function (code, email, message, callback) {
    transport.sendMail({
        from: 'support@massago.ca',
        to: email,
        subject: 'Welcome to Massago!',
        html: message
    }, function (err, info) {
        callback(err, info);
    });
}

var bookingConfirm = function (code, email, message, callback) {
    transport.sendMail({
        from: 'customercare@massago.ca', // 'receipts@massago.ca',
        to: email,
        subject: 'Your Invoice Summary',
        html: message
    }, function (err, info) {
        callback(err, info);
    });
}
var tipInvoice = function (code, email, message, callback) {
    transport.sendMail({
        from: 'customercare@massago.ca', // 'receipts@massago.ca',
        to: email,
        subject: 'Gratuity Invoice Summary',
        html: message
    }, function (err, info) {
        callback(err, info);
    });
}

var bookingConf = function (code, email, message, callback) {
    transport.sendMail({
        from: 'bookings@massago.ca',
        to: email,
        subject: 'Your Massago Booking',
        html: message
    }, function (err, info) {
        callback(err, info);
    });
}

var bookingEditByAdmin = function (code, email, message, callback) {
    transport.sendMail({
        from: 'bookings@massago.ca',
        to: email,
        subject: 'Your Revised Massago Booking',
        html: message
    }, function (err, info) {
        callback(err, info);
    });
}

var bookingNotConfirm = function (email, message, callback) {
    transport.sendMail({
        from: 'bookings@massago.ca',
        to: email,
        subject: 'We were unable to book your massage',
        html: message
    }, function (err, info) {
        callback(err, info);
    });

}

var completeReminder = function (email, message, callback) {
    transport.sendMail({
        from: 'support@massago.ca',
        to: email,
        subject: 'Please contact your therapist ASAP.',
        html: message
    }, function (err, info) {
        callback(err, info);
    });


}

var twilioMessage = function (email, message, callback) {
    transport.sendMail({
        from: 'support@massago.ca',
        to: email,
        subject: 'Twillio Message!',
        html: message
    }, function (err, info) {
        callback(err, info);
    });
}

var messageForCustomer = function (countryCode, phoneNo, body, callback) {
    ////console.log('phoneNo', phoneNo, body)
    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + phoneNo.toString(),
        Body: body
    };
    sendSMS(smsOptions, function (err, res) {
        callback(err, res);
    });
}


var sendSMSToClient = function (four, mobile, externalCB) {
    console.log('sendSMSToClient');

    if (four.type == 'NOT_STARTED') {
        var templateData = Config.APP_CONSTANTS.notificationMessages.sendMessageForNotStarted;
    } else {
        var templateData = Config.APP_CONSTANTS.notificationMessages.sendMessageToClient;
    }

    var variableDetails = {
        bookingId: four._id,
        therapistName: four.therapistId[0].name,
        therapistNumber: four.therapistId[0].mobileNo,
        userName: four.userId.name,
        sessionType: four.sessionType
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: mobile, //Changes by Rishikesh  earlier was To: '+1' + mobile,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                // /*** SMS LOG TO DB ***/
                //   var dataToSet = {
                //       triggeredFrom : Config.smsConfig.twilioCredentials.smsFromNumber,
                //       triggeredTo : mobile,
                //       message : smsOptions.Body,
                //       messageType : four.type,
                //       messageFor: 'ADMIN',
                //       variables : JSON.stringify(variableDetails),
                //       response : res,
                //   };
                //   Models.MessageLogs.collection.insert(dataToSet,function (err, data) {
                //   // Service.MessageLogsService.addMessageLogsinsert(dataToSet, function (err, data) {
                //   });
                // /*** SMS LOG TO DB ***/
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendSMSToAdmin = function (four, mobile, externalCB) {
    // console.log('sendSMSToAdmin');
    if (four.type == 'NOT_STARTED') {
        var templateData = Config.APP_CONSTANTS.notificationMessages.sendMessageNotStartedToAdmin;
    } else {
        var templateData = Config.APP_CONSTANTS.notificationMessages.sendMessageToAdmin;
    }

    var variableDetails = {
        bookingId: four._id,
        therapistName1: four.therapistId[0].name,
        therapistName2: four.therapistId[1].name,
        therapistNumber1: four.therapistId[0].mobileNo,
        therapistNumber2: four.therapistId[1].mobileNo,
        userName: four.userId.name,
        sessionType: four.sessionType
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: mobile,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                // /*** SMS LOG TO DB ***/
                //   var dataToSet = {
                //       triggeredFrom : Config.smsConfig.twilioCredentials.smsFromNumber,
                //       triggeredTo : mobile,
                //       message : smsOptions.Body,
                //       messageType : four.type,
                //       messageFor: 'ADMIN',
                //       variables : JSON.stringify(variableDetails),
                //       response : res,
                //   };
                //   Models.MessageLogs.collection.insert(dataToSet,function (err, data) {
                //   // Service.MessageLogsService.addMessageLogsinsert(dataToSet, function (err, data) {
                //   });
                // /*** SMS LOG TO DB ***/

                err = null;
                res = null;
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendSMSToSubAdmin = function (password, countryCode, mobile, userName, externalCB) {
    console.log('sendSMSToSubAdmin');

    var templateData = Config.APP_CONSTANTS.notificationMessages.sendSMSToSubAdmin;

    var variableDetails = {
        password: password,
        userName: userName
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + mobile,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);

            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {

                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};


var sendCompleteSMSToCustomer = function (countryCode, phoneNo, type, externalCB) {
    console.log('sendCompleteSMSToCustomer');
    var templateData = Config.APP_CONSTANTS.notificationMessages.bookingCompleteMessage;
    var variableDetails = {
        name: type
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + phoneNo.toString(),
        Body: null
    };
    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendSMSToCustomer = function (countryCode, phoneNo, type, externalCB) {
    console.log('sendSMSToCustomer');
    var templateData = Config.APP_CONSTANTS.notificationMessages.bookingNotConfirmedMessage;
    var variableDetails = {
        name: type
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + phoneNo.toString(),
        Body: null
    };
    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendCustomer = function (countryCode, phoneNo, type, externalCB) {
    console.log('sendCustomer');
    var templateData = Config.APP_CONSTANTS.notificationMessages.bookingGoldenConfirmedMessage;
    var variableDetails = {
        name: type
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + phoneNo.toString(),
        Body: null
    };
    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendPromo = function (email, message, callback) {
    transport.sendMail({
        from: 'bookings@massago.ca',
        to: email,
        subject: 'You have massage credits',
        html: message
    }, function (err, info) {
        callback(err, info);
    });
}

var sendCancelMessage = function (name, code, mobile, externalCB) {
    //////console.log('sendSMSToUser')

    var templateData = Config.APP_CONSTANTS.notificationMessages.cancelMessage;
    var variableDetails = {
        customerName: name
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: mobile + code,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendSMSAdmin = function (mobile, details, type, externalCB) {
    console.log('sendSMSAdmin');

    var templateData = Config.APP_CONSTANTS.notificationMessages.registerNotify;
    var message;
    if (type == 'CUSTOMER') {
        message = 'customer'
    } else {
        message = 'therapist'
    }
    var variableDetails = {
        customerName: details.name,
        email: details.email,
        mobileNo: details.mobileNo,
        type: message
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: mobile,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendToCustomer = function (mobile, externalCB) {
    console.log('sendToCustomer');

    var templateData = Config.APP_CONSTANTS.notificationMessages.highAlert;
    var variableDetails = {};

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: mobile,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendTwilioWebhook = function (userDetails, message, mobile, externalCB) {
    console.log('sendTwilioWebhook');

    var templateData = Config.APP_CONSTANTS.notificationMessages.customerTwilioMessage;
    var variableDetails = {
        userName: userDetails.name + " " + userDetails.lastName,
        email: userDetails.email,
        mobileNo: userDetails.mobileNo,
        message: message
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: mobile,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendTwilio = function (userDetails, message, mobile, externalCB) {
    console.log('sendTwilio');
    var templateData = Config.APP_CONSTANTS.notificationMessages.customerTwilio;
    var variableDetails = {
        userName: userDetails.name + " " + userDetails.lastName,
        mobileNo: userDetails.mobileNo,
        email: userDetails.email,
        message: message
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: mobile,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};


var sendTwilioTherapist = function (userDetails, message, mobile, externalCB) {
    console.log('sendTwilioTherapist');
    var templateData = Config.APP_CONSTANTS.notificationMessages.therapistTwilio;
    var variableDetails = {
        userName: userDetails.name,
        mobileNo: userDetails.mobileNo,
        email: userDetails.email,
        message: message
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: mobile,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};


var jumioText = function (mobile, data, type, externalCB) {
    console.log('jumioText');
    if (type == true) {
        var templateData = Config.APP_CONSTANTS.notificationMessages.jumioTrueTextToClient;
    } else {
        var templateData = Config.APP_CONSTANTS.notificationMessages.jumioFalseTextToClient;
    }

    var variableDetails = {
        name: data.name
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: mobile,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var matchingMessage = function (phoneNo, name, externalCB) {
    console.log('matchingMessage');

    var templateData = Config.APP_CONSTANTS.notificationMessages.matchingMessage;
    var variableDetails = {
        name: name
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: phoneNo,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};


var goldenmessage = function (phoneNo, name, externalCB) {
    console.log('goldenmessage');

    var templateData = Config.APP_CONSTANTS.notificationMessages.specialbooking;
    if (typeof name == 'undefined') {                       ////////(undefined name issue server crash) (J)
        name = "";
    }
    ;
    var variableDetails = {
        name: name
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: phoneNo,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var holdText = function (mobile, data, externalCB) {
    console.log('holdText');

    var templateData = Config.APP_CONSTANTS.notificationMessages.holdCronFail;


    var variableDetails = {
        name: data.name
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: mobile,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var paymentFailSP = function (countryCode, mobile, data, externalCB) {
    console.log('paymentFailSP');

    var templateData = Config.APP_CONSTANTS.notificationMessages.paymentFailSP;


    var variableDetails = {
        name: data.name
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + mobile,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var adminHoldText = function (four, mobile, externalCB) {
    console.log('adminHoldText');
    var templateData = Config.APP_CONSTANTS.notificationMessages.holdAmountAdmin;


    var variableDetails = {
        name: four.name,
        therapistName: four.therapistName
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: mobile,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var adminCancelText = function (four, mobile, externalCB) {
    // console.log('adminCancelText');
    var templateData = Config.APP_CONSTANTS.notificationMessages.cancelTextToAdmin;


    var variableDetails = {
        name: four.customerName,
        sessionName: four.sessionType
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: mobile,
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};


var sendSMSToUserBookingConfirmReassign = function (countryCode, phoneNo, variables, externalCB) {
    console.log('sendSMSToUserBookingConfirm1');
    var templateData = Config.APP_CONSTANTS.notificationMessages.bookingConfirmReassign;

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + phoneNo.toString(),
        Body: null
    };
    var variableDetails = {
        name: variables.name,
        date: variables.date
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);

            console.log(smsOptions.Body);

            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendSMSToUserBookingConfirm1 = function (countryCode, phoneNo, variables, externalCB) {
    console.log('sendSMSToUserBookingConfirm1');
    var templateData = Config.APP_CONSTANTS.notificationMessages.bookingConfirm1;

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + phoneNo.toString(),
        Body: null
    };
    var variableDetails = {
        name: variables.name,
        date: variables.date
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);

            console.log(smsOptions.Body);

            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};

var sendSMSToUserBookingConfirm2 = function (countryCode, phoneNo, variables, externalCB) {
    console.log('sendSMSToUserBookingConfirm2');
    var templateData = Config.APP_CONSTANTS.notificationMessages.bookingConfirm2;

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + phoneNo.toString(),
        Body: null
    };
    var variableDetails = {
        name1: variables.name1,
        name2: variables.name2,
        date: variables.date
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);

            console.log(smsOptions);

            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.responseMessages.SUCCESS.DEFAULT);
        }
    });
};


module.exports = {
    sendPushUser: sendPushUser,
    sendPushToUserInBatch: sendPushToUserInBatch,
    sendBulkPushToUser: sendBulkPushToUser,  // Release 4.0 (J)
    bulkSmsTrigger: bulkSmsTrigger,   // Release 4.0 (J)
    sendBulkEmail: sendBulkEmail,    // Release 4.0 (J)
    sendSMSToUser: sendSMSToUser,
    userSmsTrigger: userSmsTrigger,              // (J)
    sendSMSToTherapist: sendSMSToTherapist,
    sendEmailToAdmin: sendEmailToAdmin,       // (J)
    sendEmailToUser: sendEmailToUser,
    sendPushToAgent: sendPushToAgent,
    sendPushToUser: sendPushToUser,
    sendSMSToUserBlocked: sendSMSToUserBlocked,
    silentPushTherapist: silentPushTherapist,
    sendSMSToRefree: sendSMSToRefree,
    sendSMSToSomeOne: sendSMSToSomeOne,
    register: register,
    bookingConfirm: bookingConfirm,
    bookingNotConfirm: bookingNotConfirm,
    messageForCustomer: messageForCustomer,
    sendSMSToClient: sendSMSToClient,
    sendSMSToAdmin: sendSMSToAdmin,
    completeReminder: completeReminder,
    sendSMSToSubAdmin: sendSMSToSubAdmin,
    sendSMSToCustomer: sendSMSToCustomer,
    sendSMSToUserBookingComplete: sendSMSToUserBookingComplete,
    sendPromo: sendPromo,
    sendCancelMessage: sendCancelMessage,
    bookingConf: bookingConf,
    bookingEditByAdmin: bookingEditByAdmin,
    sendSMSAdmin: sendSMSAdmin,
    sendToCustomer: sendToCustomer,
    sendTwilioWebhook: sendTwilioWebhook,
    sendTwilio: sendTwilio,
    sendTwilioTherapist: sendTwilioTherapist,
    twilioMessage: twilioMessage,
    jumioText: jumioText,
    matchingMessage: matchingMessage,
    holdText: holdText,
    adminHoldText: adminHoldText,
    sendCustomer: sendCustomer,
    adminCancelText: adminCancelText,
    goldenmessage: goldenmessage,
    sendSMSToAdminRefree: sendSMSToAdminRefree,
    paymentFailSP: paymentFailSP,
    sendSMSToUserBookingConfirm1: sendSMSToUserBookingConfirm1,
    sendSMSToUserBookingConfirm2: sendSMSToUserBookingConfirm2,
    sendSMSToUserBookingConfirmReassign: sendSMSToUserBookingConfirmReassign,
    tipInvoice: tipInvoice,                                         // added for 5.0 release(K) for tip invocing
    sendCompleteSMSToCustomer: sendCompleteSMSToCustomer            // added for 5.0 release(K) for tip SMS
};
