'use strict';
exports.ERROR = {

    INVALID_OBJECT_ID: {
        statusCode: 400,
        customMessage: {
            en: 'Invalid Id provided.',
            //  ar : 'قدمت رقم غير صالح.'
        },
        type: 'INVALID_OBJECT_ID'
    },
    INVALID_BOOKING: {
        statusCode: 400,
        customMessage: {
            en: "Please refresh and try again"
        },
        type: 'INVALID_BOOKING'
    },
    INVALID_OPERATION: {
        statusCode: 400,
        customMessage: {
            en: 'Invalid operation.',
        },
        type: 'INVALID_OPERATION'
    },
    DB_ERROR: {
        statusCode: 400,
        customMessage: {
            en: 'DB Error : ',
            // ar : 'DB خطأ:'
        },
        type: 'DB_ERROR'
    },
    APP_ERROR: {
        statusCode: 400,
        customMessage: {
            en: 'Application Error ',
            //   ar : 'خطأ في تطبيق'
        },
        type: 'APP_ERROR'
    },
    DUPLICATE: {
        statusCode: 400,
        customMessage: {
            en: 'Duplicate Entry',
            //  ar : 'إدخال مكرر'
        },
        type: 'DUPLICATE'
    },
    DEFAULT: {
        statusCode: 400,
        //customMessage: {
        customMessage: 'Something went wrong.',
        //   ar : 'هناك خطأ ما.'
        //},
        type: 'DEFAULT'
    },
    UNAUTHORIZED: {
        statusCode: 401,
        // customMessage : {
        customMessage: 'You are not authorized to perform this action',
        // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        //},
        type: 'UNAUTHORIZED'
    },

    INVALID_CREDENTIALS_EMAIL: {
        statusCode: 404,
        customMessage: 'Oops! The Email or Password is incorrect.',
        type: 'INVALID_CREDENTIALS'
    },
    INVALID_OTP: {
        statusCode: 404,
        customMessage: 'Oops! The OTP is incorrect.',
        type: 'INVALID_OTP'
    },
    VERIFICATION_IS_NOT_DONE: {
        statusCode: 402,
        customMessage: 'Oops! First Do The Verification.',
        type: 'VERIFICATION_IS_NOT_DONE'
    },

    INVALID_CREDENTIALS_PHONE_NUMBER: {
        statusCode: 404,
        customMessage: 'Oops! The Phone Number or Password is incorrect.',
        type: 'INVALID_CREDENTIALS'
    },

    WRONG_PASSWORD: {
        statusCode: 400,
        customMessage: {
            en: 'Password is Incorrect.',
            //   ar : 'كلمة المرور غير صحيحة.'
        },
        type: 'WRONG_PASSWORD'
    },
    NO_FILE: {
        statusCode: 400,
        customMessage: {
            en: 'Password is Incorrect.'
        },
        type: 'NO_FILE'
    },
    EMAIL_NOT_FOUND: {
        statusCode: 403,
        customMessage: 'Email not found',
        type: 'EMAIL_NOT_FOUND'
    },
    RESET_TOKEN_EXPIRE: {
        statusCode: 403,
        customMessage: 'Reset Token Expire',
        type: 'RESET_TOKEN_EXPIRE'
    },
    PHONE_NUMBER_NOT_FOUND: {
        statusCode: 403,
        customMessage: 'Phone Number Not Found',
        type: 'PHONE_NUMBER_NOT_FOUND'
    },
    EMAIL_ALREADY_EXIST: {
        statusCode: 400,
        customMessage: 'This email has been already exist',
        type: 'EMAIL_ALREADY_EXIST'
    },
    EMAIL_PHONE_NUMBER_ARE_ASSOCIATED_WITH_DIFFERENT_ACCOUNT: {
        statusCode: 400,
        customMessage: 'Email Phone Number Are Associated With Different Account',
        type: 'EMAIL_PHONE_NUMBER_ARE_ASSOCIATED_WITH_DIFFERENT_ACCOUNT'
    },
    PHONE_ALREADY_EXIST: {
        statusCode: 400,
        customMessage: 'This Phone Number has been already exist',
        // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        type: 'PHONE_ALREADY_EXIST'
    },
    INVALID_DATE: {
        statusCode: 400,
        customMessage: {
            en: 'Date cannot be less than current date',
            // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        },
        type: 'INVALID_DATE'
    },
    DATE_RANGE_ALREADY_EXIST: {
        statusCode: 400,
        customMessage: {
            en: 'Date Range you entered already exists',
            // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        },
        type: 'DATE_RANGE_ALREADY_EXIST'
    },
    ACCOUNT_NOT_VERIFY: {
        statusCode: 400,
        customMessage: {
            en: 'This link has been already expired.',
            // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        },
        type: 'ACCOUNT_NOT_VERIFY'
    },
    AVENUE_ALREADY_EXIST: {
        statusCode: 400,
        customMessage: {
            en: 'This venue has been already exist.',
            // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        },
        type: 'AVENUE_ALREADY_EXIST'
    },
    SERVICE_ALREADY_EXIST: {
        statusCode: 400,
        customMessage: {
            en: 'This Service has been already exist.',
            // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        },
        type: 'SERVICE_ALREADY_EXIST'
    },
    INCORRECT_OLD_PASSWORD: {
        statusCode: 400,
        customMessage: {
            en: 'Your old password is incorrect.',
            // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        },
        type: 'INCORRECT_OLD_PASSWORD'
    },
    INCORRECT_OLD_NEW_PASSWORD: {
        statusCode: 400,
        customMessage: {
            en: 'Old and New password both are same.Please change new password.',
            // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        },
        type: 'INCORRECT_OLD_NEW_PASSWORD'
    },
    INCORRECT_VENUE_ID: {
        statusCode: 400,
        customMessage: {
            en: 'This venue id is invalid.',
            // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        },
        type: 'INCORRECT_VENUE_ID'
    },
    INCORRECT_SERVICE_ID: {
        statusCode: 400,
        customMessage: {
            en: 'This Service id is invalid.',
            // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        },
        type: 'INCORRECT_SERVICE_ID'
    },
    COMPANY_NAME_REQUIRED: {
        statusCode: 400,
        customMessage: {
            en: 'Company name is required.',
            // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        },
        type: 'COMPANY_NAME_REQUIRED'
    },
    SUPPILIER_NOT_FOUND: {
        statusCode: 400,
        customMessage: {
            en: 'This id is not found.',
            // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        },
        type: 'SUPPILIER_NOT_FOUND'
    },
    USER_NOT_FOUND: {
        statusCode: 400,
        customMessage: {
            en: 'User not found.',
            // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        },
        type: 'USER_NOT_FOUND'
    },
    USER_DELETED: {
        statusCode: 410,
        customMessage: {
            en: 'Your account has been deleted by Admin.',
            // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        },
        type: 'USER_DELETED'
    },
    BLOCK_USER: {
        statusCode: 410,
        customMessage: {
            en: 'Your account has been blocked by Admin.',
            // ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
        },
        type: 'BLOCK_USER'
    },
    CUSTOMER_NOT_FOUND: {
        statusCode: 410,
        customMessage: {
            en: 'Customer not found'
        },
        type: 'CUSTOMER_NOT_FOUND'
    },
    NOT_VERIFY: {
        statusCode: 410,
        customMessage: {
            en: 'Your account has not been verify.Please go to you email and verify your account'
        },
        type: 'NOT_VERIFY'
    },
    NOT_UPDATE: {
        statusCode: 400,
        customMessage: {
            en: 'Your data not updated.'
        },
        type: 'NOT_UPDATE'
    },
    OTHER_MEETING_SPACE_INVALID: {
        statusCode: 400,
        customMessage: {
            en: 'Other meeting space is coming wrong.'
        },
        type: 'OTHER_MEETING_SPACE_INVALID'
    },
    VENUE_NOT_FOUND: {
        statusCode: 400,
        customMessage: {
            en: 'Some spaces does not exist in the system or block! Please check again.'
        },
        type: 'VENUE_NOT_FOUND'
    },
    SPACES_COMBO_ALREADY_EXIST: {
        statusCode: 400,
        customMessage: {
            en: 'Spaces combo has already been existing.'
        },
        type: 'SPACES_COMBO_ALREADY_EXIST'
    },
    ALREADY_UNBLOCKED: {
        statusCode: 400,
        customMessage: 'User already unblocked.',
        type: 'ALREADY_UNBLOCKED'
    },
    ALREADY_BLOCKED: {
        statusCode: 400,
        customMessage: 'User already blocked.',
        type: 'ALREADY_BLOCKED'
    },
    INVALID_STRIPE_ID: {
        statusCode: 400,
        customMessage: 'Send valid stripe Id.',
        type: 'INVALID_STRIPE_ID'
    },
};


exports.SUCCESS = {
    DEFAULT: {
        statusCode: 200,
        customMessage: {
            en: 'Success',
            // ar : 'نجاح'
        },
        type: 'DEFAULT'
    },
    ADDED: {
        statusCode: 200,
        customMessage: {
            en: 'Added successfully.',
            // ar : 'اضيف بنجاح.'
        },
        type: 'ADDED'
    },
    FORGOT_PASSWORD: {
        statusCode: 200,
        customMessage: {
            en: "A reset password link is sent to your registered email address."
        },
        type: 'FORGOT_PASSWORD'
    }
};