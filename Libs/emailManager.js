'use strict';

const aws = require('aws-sdk'),
    Config = require('../Config');

aws.config.update({
    /*accessKeyId     : Config.emailConfig.emailAwsCredentials.accessKeyId,
    secretAccessKey : Config.emailConfig.emailAwsCredentials.secretAccessKey,
    region          : Config.emailConfig.emailAwsCredentials.region*/
});

const ses = new aws.SES({apiVersion: "2010-12-01"});


let sendEmail = async (data, html) => {

    let params = {
        Destination: {
            ToAddresses: [data.key] // Email address/addresses that you want to send your email
            // BccAddresses: [],
            // CcAddresses: [],
        },
        Message: {
            Body: {
                Html: {
                    // HTML Format of the email
                    Charset: "UTF-8",
                    Data: html
                },
                // Text: {
                //     Charset: "UTF-8",
                //     Data: "Hello Charith Sample description time 1517831318946"
                // }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "WELCOME REQUEST_ONLINE EMAIL"
            }
        },
        Source: "rbanome@rapidresponseco.com"
    };
    return ses.sendEmail(params).promise();
};

module.exports = {
    sendEmail: sendEmail
};
