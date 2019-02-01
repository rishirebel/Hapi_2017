let io;
const async = require('async');
let redis,
    UniversalFunctions = require('../Utils/UniversalFunctions'),
    DAO = require('../DAOManager').queries,
    Models = require('../Models/');


exports.connectSocket = (server, redisClient) => {
    try {
        redis = redisClient;
        io = require('socket.io').listen(server.listener);
        io.on('connection', async (socket) => {

            console.log("===socket.handshake.id================", socket.id, socket.handshake.query.id);

            if (socket.handshake.query.id)
                await redisClient.set(socket.handshake.query.id, socket.id);

            socket.on('sendMessage', async (data, ack) => {
                try {
                    console.log("==myscoketId===========", socket.id);
                    //  a.split("_");
                    let dataToSave = {
                        receiverId: data.receiverId.split("_")[1],
                        senderId: data.senderId.split("_")[1],
                        receiverType: data.receiverId.split("_")[0],
                        senderType: data.senderId.split("_")[0],
                        conversationId: data.receiverId > data.senderId ? (data.receiverId + data.senderId) : (data.senderId + data.receiverId),
                        text: data.text,
                        type: data.type
                    };

                    if (data.image) {
                        dataToSave.image = data.image;
                    }

                    let step1 = {}, step2 = await DAO.saveData(Models.Chat, dataToSave);
                    let getSocketId = await redisClient.get((data.receiverId));


                    step1.receiverId = step2.receiverId;
                    step1.receiverType = step2.receiverType;
                    step1.senderId = step2.senderId;
                    step1.senderType = step2.senderType;
                    step1.conversationId = step2.conversationId;
                    step1.text = step2.text;
                    step1.type = step2.type;
                    step1.isDeleted = step2.isDeleted;
                    step1.isRead = step2.isRead;
                    step1.image = step2.image;
                    step1.createdAt = step2.createdAt;
                    step1.uid = data.uid;
                    step1.loading = false;


                    console.log("=====getSocketId=======================", getSocketId);
                    io.to(getSocketId).emit("messageFromServer", step2);
                    //  socket.emit("messageFromServer", step1);
                    ack(step1);
                } catch (er) {
                    console.log("====er=======================", er);
                }


            });


            socket.on('disconnect', function () {
                console.log('disconnected');
                // console.log(socket.id,'socket id');
            });

        });


    } catch (err) {
        console.log(err);
        // console.log(err.code);
    }
};


