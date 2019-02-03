'use strict';


const Hapi = require('hapi'),
    Config = require('./Config'),
    Plugins = require('./Plugins'),
    mongoose = require('mongoose'),
    socketManager = require('./Libs/socketManager'),
     HapiSwagger = require('hapi-swagger'),
    fs = require('fs');


global.ObjectId = mongoose.Types.ObjectId;
global.winston = require('winston');


var Http2 = require('http2');


let listener = Http2.createServer({
    // key: fs.readFileSync('./server.key'),
    // cert: fs.readFileSync('./server.crt')
})

// if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'testing' && process.env.NODE_ENV !== 'client' && process.env.NODE_ENV !== 'production') {
//     console.log(
//         `Please specify one of the following environments to run your server
//             - development
//             - production
//          Example :NODE_ENV=development pm2 start server.js --log-date-format 'DD-MM HH:mm:ss.SSS' --name="dev"`
//     );
//
// } else {
    process.env.NODE_ENV = 'local';
// }


const Routes = require('./Routes');
const bootstrap = require('./Utils/bootstrap');

process.env.NODE_CONFIG_DIR = __dirname + '/Config/';


// Create Server
let server = new Hapi.Server({
    // listener: listener,
    app: {
        name: Config.APP_CONSTANTS.SERVER.APP_NAME
    },
    port: Config[process.env.NODE_ENV].port,
    routes: {
        cors: true
    }
});
console.log("dskbckhadbjkfbadkjb",Config[process.env.NODE_ENV].port);


(async initServer => {

    // Register All Plugins
    await server.register(Plugins);

    // API Routes
    await server.route(Routes);

    server.events.on('response', request => {
        winston.log('info', `[${request.method.toUpperCase()} ${request.url.path} ](${request.response.statusCode}) : ${request.info.responded - request.info.received} ms`);
    });

    // Default Routes
    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'WELCOME PEOPLE';
        },
        config: {
            auth: false
        }
    });

    // hapi swagger workaround(but a ugly hack for version 9.0.1)
    server.ext('onRequest', async (request, h) => {
        request.headers['x-forwarded-host'] = (request.headers['x-forwarded-host'] || request.info.host);
        return h.continue;
    });


    server.ext('onPreAuth', (request, h) => {
        winston.log("info", `onPreAuth`);
        return h.continue;
    })
    server.ext('onCredentials', (request, h) => {
        winston.log("info", `onCredentials`);
        return h.continue;
    })
    server.ext('onPostAuth', (request, h) => {
        winston.log("info", `onPostAuth`);
        return h.continue;
    })
    // Start Server
    try {
        await server.start();
        winston.log("info", `Server running at ${server.info.uri}`);
    } catch (error) {
        winston.log("info", error);
    }
})();
