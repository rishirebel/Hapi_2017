'use strict';

if (process.env.NODE_ENV === 'dev') {
    exports.config = {
        PORT: 8003,
        dbURI: ""
    }
} else if (process.env.NODE_ENV === 'test') {
    exports.config = {
        PORT: 8002,
        dbURI: ''
    }
} else if (process.env.NODE_ENV === 'live') {
    exports.config = {
        PORT: 8001,
        dbURI: 'mongodb://usename:password@localhost/collection_name'
    }
} else if (process.env.NODE_ENV === 'local') {
    exports.config = {
        PORT: 8004,
        dbURI: 'mongodb://usename:password@localhost/collection_name'
    }
} else {
    exports.config = {
        PORT: 8000,
        dbURI: 'mongodb://usename:password@localhost/collection_name'
    };
}
