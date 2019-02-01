
'use strict';
var nodeMailer = {
    "Mandrill": {
        host: "smtp.mandrillapp.com", // hostname
        //secureConnection: true, // use SSL
        port: 587, // port for secure SMTP
        auth: {
            user: "username",
            pass: "pass"

        }
    }
};

module.exports = {
    nodeMailer: nodeMailer
};
