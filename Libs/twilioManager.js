let client = require('twilio')("ACf152e66a582a912afb9e6b37c90ec842", "ba3e1cb17c6ebb11179a20ec4f438c49");


let sendMessage = async (data, body) => {
    console.log("body===sendMessage===body===body====body==", body);
    client.messages.create({
        to: data.key,
        from: "+14242567521",
        body: body,
    }, function (err, message) {
        console.log("====err, message================", err, message);
        return null;
    });
};


module.exports = {
    sendMessage: sendMessage
};



