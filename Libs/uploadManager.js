/**
 * Created cbl on 21/7/17.
 */
'use strict';
const Config = require('../Config'),
    UniversalFunctions = require('../Utils/UniversalFunctions'),
    async = require('async'),
    Path = require('path'),
    fsExtra = require('fs-extra'),
    csvtojson = require('csvtojson'),
    csv = require('csvtojson'),
    moment = require('moment'),
    fs = require('fs'),
    Thumbler = require('thumbler'),
    AWS = require('aws-sdk'),
    mime = require('mime-types');


AWS.config.update({
    accessKeyId: Config.awsS3Config.s3BucketCredentials.accessKeyId,
    secretAccessKey: Config.awsS3Config.s3BucketCredentials.secretAccessKey
});


const s3 = new AWS.S3();

/*
 Save File on the disk
 */


function saveFile(fileData, path, callback) {
    fsExtra.copy(fileData, path, callback);
}

function saveFileWithStream(fileData, path, callback) {
    try {

        console.log("===fileData, path=====$$$$$$$$$$$$$$$$$$$$$$$$========", fileData, path);
        let file = fs.createWriteStream(path);

        file.on('error', function (err) {
            return callback(err);
        });

        fileData.pipe(file);

        fileData.on('end', function (err) {
            if (err) return callback(err);
            else callback(null);
        });

    } catch (e) {
        return callback(e);
    }
}

function deleteFile(path) {
    fsExtra.remove(path, function (err) {
        console.log('error deleting file>>', err)
    });
}

/*
 Create thumbnail image using graphics magick
 */

function createThumbnailImage(originalPath, thumbnailPath, callback) {
    let gm = require('gm').subClass({imageMagick: true});
    gm(originalPath)
        .resize(Config.APP_CONSTANTS.SERVER.THUMB_WIDTH, Config.APP_CONSTANTS.SERVER.THUMB_HEIGHT, "!")
        .autoOrient()
        .write(thumbnailPath, function (err, data) {
            callback(null)
        })

}


// Create video thumbnail

function createVideoThumb(originalPath, thumbnailPath, callback) {
    Thumbler({
        type: 'video',
        input: originalPath,
        output: thumbnailPath,
        time: '00:00:03',
        size: '300x200' // this optional if null will use the desimention of the video
    }, function (err) {
        callback(err)
    });

}


//    ***********************************************  NEW  FILE UPLOAD CODE WITH STREAM ***************************************************


function uploadMultipartToS3Bucket(fileInfo, uploadCb) {

    let options = {
        Bucket: Config.awsS3Config.s3BucketCredentials.bucket,
        Key: fileInfo.folder + '/' + fileInfo.fileName,
        ACL: 'public-read',
        ContentType: fileInfo.mimeType,
        ServerSideEncryption: 'AES256'
    };

    console.log("=============options==============", options);

    s3.createMultipartUpload(options, (mpErr, multipart) => {
        if (!mpErr) {
            //console.log("multipart created", multipart.UploadId);
            fs.readFile(fileInfo.path + fileInfo.fileName, (err, fileData) => {

                let partSize = Config.APP_CONSTANTS.SERVER.FILE_PART_SIZE;
                let parts = Math.ceil(fileData.length / partSize);

                async.times(parts, (partNum, next) => {

                    let rangeStart = partNum * partSize;
                    let end = Math.min(rangeStart + partSize, fileData.length);
                    //
                    // console.log("uploading ",partNum,parts, fileInfo.fileName, " % ", (partNum/parts).toFixed(2));

                    partNum++;
                    async.retry((retryCb) => {
                        s3.uploadPart({
                            Body: fileData.slice(rangeStart, end),
                            Bucket: Config.awsS3Config.s3BucketCredentials.bucket,
                            Key: fileInfo.folder + '/' + fileInfo.fileName,
                            PartNumber: partNum,
                            UploadId: multipart.UploadId
                        }, (err, mData) => {
                            retryCb(err, mData);
                        });
                    }, (err, data) => {
                        console.log(data);
                        next(err, {ETag: data.ETag, PartNumber: partNum});
                    });

                }, (err, dataPacks) => {

                    console.log("===dataPacks=====dataPacksdataPacks=================", dataPacks);

                    s3.completeMultipartUpload({
                        Bucket: Config.awsS3Config.s3BucketCredentials.bucket,
                        Key: fileInfo.folder + '/' + fileInfo.fileName,
                        MultipartUpload: {
                            Parts: dataPacks
                        },
                        UploadId: multipart.UploadId
                    }, uploadCb);


                });


            });
        } else {
            uploadCb(mpErr);
        }
    });
}

function checkForMulitPartUpload(fileObj, isThumb, uploadCb) {


    let fileInfo = {
        fileName: isThumb ? fileObj.thumbName : fileObj.name,
        path: isThumb ? fileObj.path + 'thumb/' : fileObj.path,
        folder: isThumb ? fileObj.s3FolderThumb : fileObj.s3Folder,
        mimeType: isThumb ? fileObj.thumbMimeType : fileObj.mimeType
    };

    console.log("==========fileInfo===============", fileInfo);

    // { fileName: 'Thumb_Profile_152448625062713991.jpg',
    //   path: '/home/cbl1001/Music/capCorp/uploads/User/profilePicture/thumb/',
    //   folder: 'User/profilePicture/thumb',
    //   mimeType: 'image/jpeg' }


    let stats = fs.statSync(fileInfo.path + fileInfo.fileName);

    let fileSizeInBytes = stats["size"];
    if (fileSizeInBytes < Config.APP_CONSTANTS.SERVER.FILE_PART_SIZE) {
        async.retry((retryCb) => {
            fs.readFile(fileInfo.path + fileInfo.fileName, (err, fileData) => {
                s3.putObject({
                    Bucket: Config.awsS3Config.s3BucketCredentials.bucket,
                    Key: fileInfo.folder + '/' + fileInfo.fileName,
                    Body: fileData,
                    ContentType: fileInfo.mimeType
                }, retryCb);
            });
        }, uploadCb);
    } else {
        uploadMultipartToS3Bucket(fileInfo, uploadCb)
    }
}

function settingParrallelUpload(fileObj, withThumb, callbackParent) {

    // { path: '/home/cbl1001/Videos/request_online/uploads/User/profilePicture/',
    //     name: 'Profile_154340229564118141.jpeg',
    //     thumbName: 'Thumb_Profile_154340229564118141.jpeg',
    //     mimeType: 'image/jpeg',
    //     thumbMimeType: 'image/jpeg',
    //     s3Folder: 'User/profilePicture',
    //     s3FolderThumb: 'User/profilePicture/thumb' } true

    async.parallel([
        (callback) => {
            checkForMulitPartUpload(fileObj, false, function (err) {
                callback(err);
                console.log(fileObj.s3Folder + '/' + fileObj.name)
                deleteFile(Path.resolve('.') + '/uploads/' + fileObj.s3Folder + '/' + fileObj.name)
            });
        },
        (callback) => {
            if (withThumb) checkForMulitPartUpload(fileObj, true, function (err) {
                callback(err);
                deleteFile(Path.resolve('.') + '/uploads/' + fileObj.s3FolderThumb + '/' + fileObj.thumbName)
            });
            else callback(null);
        }
    ], (error) => {
        if (error) return callbackParent(error);
        else return callbackParent(null);
    })

}

function checkForThumbnail(otherConstants, fileDetails, firstPart, callbackParent) {

    let filename = fileDetails.name,
        TEMP_FOLDER = otherConstants.TEMP_FOLDER,
        s3Folder = otherConstants.s3Folder,
        file = fileDetails.file,
        mimeType = file.hapi.headers['content-type'],
        imageFile = false,
        thumbFileName = fileDetails.thumbFileName,
        videoFile = false;

    if (firstPart === 'video')
        videoFile = true;
    if (firstPart === 'image')
        imageFile = true;

    console.log("====imageFile============================", imageFile);
    async.waterfall([
        (callback) => {
            saveFileWithStream(file, TEMP_FOLDER + filename, callback);
        },
        (callback) => {
            if (videoFile) {
                const getVideoInfo = require('get-video-info');
                getVideoInfo(TEMP_FOLDER + filename).then(info => {
                    if (info.format.duration < 6) {
                        callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.VIDEO_DURATION_ERROR)
                    } else {
                        callback()
                    }
                })
            } else {
                callback()
            }
        },
        (callback) => {
            if (imageFile) createThumbnailImage(TEMP_FOLDER + filename, TEMP_FOLDER + 'thumb/' + "Thumb_" + thumbFileName, callback);
            else if (videoFile) {
                createVideoThumb(TEMP_FOLDER + filename, TEMP_FOLDER + 'thumb/' + "Thumb_" + thumbFileName, callback);
            } else callback(null);
        },
        (callback) => {

            let fileObj = {
                path: TEMP_FOLDER,
                name: filename,
                thumbName: "Thumb_" + thumbFileName,
                mimeType: mimeType,
                thumbMimeType: firstPart === 'video' ? 'image/jpeg' : file.hapi.headers['content-type'],
                s3Folder: s3Folder
            };


            // { path: '/home/cbl1001/Music/capCorp/uploads/User/profilePicture/',
            //     name: 'Profile_15244867657567381.jpg',
            //     thumbName: 'Thumb_Profile_15244867657567381.jpg',
            //     mimeType: 'image/jpeg',
            //     thumbMimeType: 'image/jpeg',
            //     s3Folder: 'User/profilePicture' }


            if (videoFile || imageFile) fileObj.s3FolderThumb = otherConstants.s3FolderThumb;
            settingParrallelUpload(fileObj, (videoFile || imageFile), callback);
        }
    ], (error) => {
        if (error) callbackParent(error);
        else callbackParent(null);
    })
}

function uploadToS3Bucket(profilePicture, folder) {

    return new Promise((resolve, reject) => {
        console.log("----filename in the function----", profilePicture.hapi.filename);
        let createThumb = false,
            firstPart = profilePicture.hapi.headers['content-type'].split("/")[0],          // image
            baseFolder = folder + '/',                                                      //  User/
            baseURL = Config.awsS3Config.s3BucketCredentials.s3URL + '/' + baseFolder,  //   https://s3-us-west-2.amazonaws.com/lukiwave/User/
            urls = {};


        console.log("===firstPart========firstPart======", firstPart);
        async.waterfall([
            (callback) => {

                let profileFolder = Config.awsS3Config.s3BucketCredentials.folder.profilePicture,
                    profilePictureName = UniversalFunctions.generateFilenameWithExtension(profilePicture.hapi.filename, "Profile_"),
                    s3Folder = baseFolder + profileFolder,                                                                  //   User/profilePicture
                    s3FolderThumb = baseFolder + profileFolder + '/' + Config.awsS3Config.s3BucketCredentials.folder.thumb,     //    User/profilePicture/thumb
                    profileFolderUploadPath = folder + "/profilePicture",                                                                //     User/profilePicture
                    path = Path.resolve("") + "/uploads/" + profileFolderUploadPath + "/";                           //     home/cbl1001/Music/capCorp/uploads/User/profilePicture/


                let fileDetails = {
                    file: profilePicture,
                    name: profilePictureName,
                    thumbFileName: profilePictureName
                };

                let otherConstants = {
                    TEMP_FOLDER: path,
                    s3Folder: s3Folder,
                    s3FolderThumb: s3FolderThumb
                };


                if (firstPart === 'video')
                    fileDetails.thumbFileName = fileDetails.thumbFileName.substr(0, fileDetails.thumbFileName.lastIndexOf('.')) + '.jpg';

                urls.original = baseURL + profileFolder + '/' + fileDetails.name;
                urls.thumbnail = "";

                if (firstPart === 'image' || firstPart === 'video')
                    urls.thumbnail = baseURL + profileFolder + '/thumb/Thumb_' + fileDetails.thumbFileName;


                console.log("=======urls==============", urls);
                //  ===================  urls   =======================
                //   { original: 'https://s3-us-west-2.amazonaws.com/lukiwave/User/profilePicture/Profile_152448542313716711.jpg',
                //    thumbnail: 'https://s3-us-west-2.amazonaws.com/lukiwave/User/profilePicture/thumb/Thumb_Profile_152448542313716711.jpg' }

                checkForThumbnail(otherConstants, fileDetails, firstPart, callback);

            }
        ], (error) => {
            console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%', error);
            if (error) return reject(error);
            urls.type = firstPart === 'image' ? Config.APP_CONSTANTS.DATABASE_CONSTANT.FILE_TYPES.IMAGE : (firstPart === 'video' ? Config.APP_CONSTANTS.DATABASE_CONSTANT.FILE_TYPES.VIDEO : Config.APP_CONSTANTS.DATABASE_CONSTANT.FILE_TYPES.OTHER_FILE)
            return resolve(urls);
        })
    });

}


function awsUploadExcelFile(fileName, callback) {

    AWS.config.update({
        accessKeyId: 'AKIAIDFANPJUTJA6J3NA',
        secretAccessKey: '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',
        //  region:' '
    });
    var s3 = new AWS.S3();
    var data = './uploads/' + fileName;
    fsExtra.readFile(data, function (err, reply) {
        if (err) {
            callback(err);
        } else {
            /* "bucket": "bespokebucket",
                 "accessKeyId": "AKIAJ57BXGAPWFSBMZQA",
                 "secretAccessKey": "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",
                 "s3URL": "https://s3-us-west-2.amazonaws.com/bespokebucket/",
                 "folder": {
                 "profilePicture": "profilePicture",
                     "thumb": "thumb"
             }*/
            var params = {
                Bucket: 'firefighterbucket',
                Key: fileName,
                Body: reply,
                ACL: 'public-read',
                ContentType: 'text/x-csv',
            };
            s3.putObject(params, function (perr, pres) {
                console.log("s88888888888888888888888888", perr, pres)
                if (perr) {
                    console.log("Error uploading data: ", perr);
                } else {
                    var urlParams =
                        {
                            Bucket: 'firefighterbucket', Key: fileName
                        };
                    s3.getSignedUrl('getObject', urlParams, function (err, data) {
                        callback(null, data)
                    });
                    fsExtra.remove(data, function (err) {
                    });

                }
            });

        }
    })
}


module.exports = {
    uploadToS3Bucket: uploadToS3Bucket,
    awsUploadExcelFile: awsUploadExcelFile
};
