'use strict';
let SERVER = {
    APP_NAME: 'Sanctuary Upgradation Code',
    SECRET: "#DubaIIeOkCfGdHahSHHSh",
    SALT: 11,
    JWT_SECRET_KEY_Supplier: "#GD%$HFD&&$DFDKI12~#^%&*+_->?L%QF",
    JWT_SECRET_KEY_ADMIN: "#GD%$HFD&&$DFDKI12~#^%&*+_->?L%QF",
    JWT_SECRET_KEY_USER: "#GD%$HFD&&$DFDKI12~#^%&*+_->?L%QF",
    THUMB_WIDTH: 200,
    THUMB_HEIGHT: 200,
    FILE_PART_SIZE: 5242880
};

let swaggerDefaultResponseMessages = [
    {code: 200, message: 'OK'},
    {code: 400, message: 'Bad Request'},
    {code: 401, message: 'Unauthorized'},
    {code: 404, message: 'Data Not Found'},
    {code: 500, message: 'Internal Server Error'}
];

let SCOPE = {
    ADMIN: 'ADMIN',
    SUPPLIER: 'SUPPLIER',
    USER: 'USER',

};

var DATABASE = {
    SENDER_TYPE: {
        USER: 1,
        THERAPIST: 2,
        ADMIN: 3
    },
    MESSAGE_TYPE: {
        TEXT: 1,
        IMAGE: 2,
        VIDEO: 3,
        DOCUMENT: 4
    },
    CARD_TYPE: {
        VISA: 'Visa',
        JCB: 'JCB',
        MasterCard: 'MasterCard',
        AmericanExpress: 'American Express'
    },
    BOOKING_STATUS: {
        NOT_ACCEPTED: 'NOT_ACCEPTED',
        NOT_STARTED: 'NOT_STARTED',
        WAITING: 'WAITING',
        BOOKED: 'BOOKED',
        ONGOING: 'ONGOING',
        STARTED: 'STARTED',
        COMPLETED: 'COMPLETED',
        CANCELLED: 'CANCELLED',
        DECLINED: 'DECLINED',
        EXPIRED: 'EXPIRED',
        DROPPED: 'DROPPED',
        REACHED: 'REACHED',
        PENDING: 'PENDING',
        REQ_REINITIATION: 'REQ_REINITIATION',
    },
    PREVIOUS_THERAPIST_RESPONSE: {
        /*** R 4.1 ****/
        SPECIAL_PENDING: 'SPECIAL_PENDING',
        SPECIAL_REJECTED: 'SPECIAL_REJECTED',
        SPECIAL_VIEWED: 'SPECIAL_VIEWED',
        NO_SPECIAL: 'NO_SPECIAL',
        SPECIAL_UNANSWERED: 'SPECIAL_UNANSWERED',
        SPECIAL_IGNORE: 'SPECIAL_IGNORE',
        SPECIAL_ACCEPTED: 'SPECIAL_ACCEPTED'      //*** In R 5.0 (K) ***/
    },
    ADMIN_TYPE: {
        SUPER_ADMIN: 'SUPER_ADMIN',
        FINANCE_ADMIN: "FINANCE_ADMIN",
        SUB_ADMIN: 'SUB_ADMIN',
        STAFF_ADMIN: 'STAFF_ADMIN'
    },
    PAYMENT_STATUS: {
        WAITING: 'WAITING',
        COMPLETED: 'COMPLETED',
        DECLINED: 'DECLINED',
        HOLD: 'HOLD',
        REFUND: 'REFUND',
        PAID: 'PAID',
        UNPAID: 'UNPAID'
    },
    TIP_STATUS: {
        WAITING: 'WAITING',
        COMPLETED: 'COMPLETED',
        DECLINED: 'DECLINED',
        HOLD: 'HOLD',
        REFUND: 'REFUND',
        PAID: 'PAID',
        UNPAID: 'UNPAID'
    },
    GENDER: {
        MALE: 'MALE',
        FEMALE: 'FEMALE',
        EITHER: 'EITHER'
    },
    MASSAGE_TYPE: {
        SWEDISH: 'SWEDISH',
        DEEPTISSUE: 'DEEPTISSUE',
        PRENATAL: 'PRENATAL',
        SPORTMESSAGE: 'SPORTMESSAGE'
    },
    PROFILE_PIC_PREFIX: {
        ORIGINAL: 'profilePic_',
        THUMB: 'profileThumb_'
    },
    LOGO_PREFIX: {
        ORIGINAL: 'logo_',
        THUMB: 'logoThumb_'
    },
    DOCUMENT_PREFIX: 'document_',
    USER_ROLES: {
        ADMIN: 'ADMIN',
        CUSTOMER: 'CUSTOMER',
        THERAPIST: 'THERAPIST'
    },
    FILE_TYPES: {
        LOGO: 'LOGO',
        DOCUMENT: 'DOCUMENT',
        OTHERS: 'OTHERS'
    },
    VEHICLE_TYPE: {
        BICYCLE: 'BICYCLE',
        SCOOTER: 'SCOOTER',
        CAR: 'CAR'
    },
    DEVICE_TYPES: {
        IOS: 'IOS',
        ANDROID: 'ANDROID',
        WEB: 'WEB'
    },
    LANGUAGE: {
        EN: 'EN',
        ES_MX: 'ES_MX'
    },
    PAYMENT_OPTIONS: {
        CREDIT_DEBIT_CARD: 'CREDIT_DEBIT_CARD',
        PAYPAL: 'PAYPAL',
        BITCOIN: 'BITCOIN',
        GOOGLE_WALLET: 'GOOGLE_WALLET',
        APPLE_PAY: 'APPLE_PAY',
        EIYA_CASH: 'EIYA_CASH'
    }
};


let DATABASE_CONSTANT = {

    DEFAULT_IMAGE: {
        original: "https://www.femina.in/images/default-user.png",
        thumbnail: "https://www.femina.in/images/default-user.png",
    },

    CONTACT_TYPE: {
        EMAIL: 'EMAIL',
        PHONE_NUMBER: 'PHONE_NUMBER'
    },

    FILE_TYPES: {
        LOGO: 'LOGO',
        DOCUMENT: 'DOCUMENT',
        OTHERS: 'OTHERS',
        IMAGE: 'IMAGE',
        VIDEO: 'VIDEO',
        OTHER_FILE: 'OTHER_FILE'
    },

    ATTRACTION_BOOKING_TYPE: {
        INSTANT_BOOKING: "",
    },

    PRODUCT_TYPE: {
        PRODUCT: "Product",
        CATEGORY: "Category"
    },
    AGENT_TYPE: {
        SUPPLIER: "Supplier",
        AFFILIATE: "Affiliate",
        VENDOR: "Vendor",
        VENUE: "Venue"
    },
    USER_TYPE: {
        RO: "RO",
        ROC: "ROC",
        ROF: "ROF",
        ROCM: "ROCM",
        ROFM: "ROFM",
        ROB: "ROB"
    },
    MESSAGE_TYPE: {
        TEXT: 'TEXT',
        IMAGE: 'IMAGE',
        VIDEO: 'VIDEO'
    },
    GENDER: {
        MALE: "Male",
        FEMALE: "Female"
    },
    STATUS: {
        ACTIVE: "Active",
        INACTIVE: "Inactive",
        DELETED: "Deleted",
        BLOCKED: "Blocked"
    },
    REGISTRATION_TYPE: {
        ADMIN: "Admin",
        AFFILIATE: "Affiliate",
        APP: "App",
        VENUE: "Venue"
    },
    BOOKED_BY: {
        ADMIN: "Admin",
        AFFILIATE: "Affiliate",
        APP: "App",
        VENUE: "Venue"
    },
    BOOKED_STATUS: {
        PENDING: "Pending",
        CONFIRMED: "Confirmed",
        REJECTED: "REJECTED"
    },
    DROP_DOWN: {
        ALL_DATA: "ALL_DATA",
        TITLE: "TITLE"

    },
    COMMON_SERVICE_TYPE: {
        SERVICE: 'Service',
        VENUE: 'Venue',
        FACILITY: 'Facility',
        SPACE_PREFRENCE: "Space_Prefrence",
        SERVICE_FACILITY: "Service_Facility",
        ACCOMODATION: 'Accomodation',
        TYPE_OF_ACCOMODATION: 'Type_Of_Accomodation',
        DYANMIC_KEYS: 'Dyanmic_Keys'
    },
    CURRENCY: {
        AED: "AED"
    },

    DEVICE_TYPES: {
        "IOS": "IOS",
        "ANDROID": "ANDROID",
        "WEB": "WEB"
    },
    SOCIAL: {
        FACEBOOK: "Facebook",
        GOOGLE: "Google"
    },

    PRODUCT_TYPE_NAME: {
        ATTRACTION: "Attractions",
        INFORMATION: "Information",
        DINING: "Dining",
        VENUE: "Venue",
        SHOPPING: "Shopping"
    },

    CLASS_TYPE: {
        FEATURED: "Featured",
        TRENDING: "Trending",
        RECOMMENDED: "Recommended",
        NONE: "None"
    },
    ADMIN_LEVEL: {
        SUB_ADMIN: 1,
        ADMINISTRATION_ADMIN: 2
    },
    AREA_TYPE: {
        SQUARE_FEET: "sq.ft",
        FEET: "ft."
    },
    ACTION: {
        "APPROVE": "Approve",
        "DISAPPROVE": "Disapprove",
        "PENDING": "Pending"
    },
    FLIGHT_TYPE: {
        ONE_WAY: "ONE_WAY",
        TWO_WAY: "TWO_WAY"
    }
};


let APP_CONSTANTS = {
    SERVER: SERVER,
    swaggerDefaultResponseMessages: swaggerDefaultResponseMessages,
    SCOPE: SCOPE,
    DATABASE_CONSTANT: DATABASE_CONSTANT,
    DATABASE: DATABASE,
    notificationMessages: notificationMessages,
    STANDARDHEADER: STANDARDHEADER,
    STANDARDFOOTER: STANDARDFOOTER
};

module.exports = APP_CONSTANTS;
