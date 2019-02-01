'use strict';
let s3BucketCredentials = {
    "bucket": "xyz bucket",
    "accessKeyId": "xyz key",
    "secretAccessKey": "xyz secret access",
    "s3URL": "https://s3-us-west-2.amazonaws.com",
    "folder": {
        "profilePicture": "profilePicture",
        "thumb": "thumb"
    },
    "region": "us-west-2"
};

module.exports = {
    s3BucketCredentials: s3BucketCredentials
};
