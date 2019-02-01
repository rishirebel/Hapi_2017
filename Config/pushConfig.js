'use strict';

var androidPushSettings = {
    user: {
        brandName: "Project",
        gcmSender: "xyz"
    },
    agent: {
        brandName: "Project",
        gcmSender: "xyz"
    }
};

var iOSPushSettings = {
    user: {

        iosApnCertificate: "/Certs/xyz.pem",
        gateway: "gateway.push.apple.com"
    },
    agent: {
        iosApnCertificate: "/Certs/xyz.pem",
        gateway: "gateway.push.apple.com"
    }

};
module.exports = {
    androidPushSettings: androidPushSettings,
    iOSPushSettings: iOSPushSettings
};
