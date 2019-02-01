'use strict';

function saveData(model, data) {
    return new Promise((resolve, reject) => {
        try {
            let saveData = new model(data).save();
            return resolve(saveData);
        } catch (err) {
            return reject(err);
        }
    });
}

function getData(model, query, projection, options) {
    return new Promise((resolve, reject) => {
        try {
            let findData = model.find(query, projection, options);
            return resolve(findData);
        } catch (err) {
            return reject(err);
        }
    });
}

function getDataOne(model, query, projection, options) {
    return new Promise((resolve, reject) => {
        try {
            let findData = model.findOne(query, projection, options);
            return resolve(findData);
        } catch (err) {
            return reject(err);
        }
    });
}

function getUniqueData(model, query, projection, options, keyName) {
    return new Promise((resolve, reject) => {
        try {
            let getUniqueData = model.find(query, projection, options).distinct(keyName);
            return resolve(getUniqueData);
        } catch (err) {
            return reject(err);
        }
    });
}

function findAndUpdate(model, conditions, update, options) {
    return new Promise((resolve, reject) => {
        try {
            let data = model.findOneAndUpdate(conditions, update, options);
            return resolve(data);
        } catch (err) {
            return reject(err);
        }
    });
}

function update(model, conditions, update, options) {
    return new Promise((resolve, reject) => {
        try {
            let data = model.update(conditions, update, options);
            return resolve(data);
        } catch (err) {
            return reject(err);
        }
    });
}

function remove(model, condition) {
    return new Promise((resolve, reject) => {
        try {
            let data = model.remove(condition);
            return resolve(data);
        } catch (err) {
            return reject(err);
        }
    });
}

function populateData(model, query, projection, options, collectionOptions) {
    return new Promise((resolve, reject) => {
        try {
            let data = model.find(query, projection, options).populate(collectionOptions).exec();
            return resolve(data);
        } catch (err) {
            return reject(err);
        }
    });
}

async function deepPopulateData(model, query, projection, options, collectionOptions, populateOptions) {

    try {
        let data = await model.find(query, projection, options).populate(collectionOptions).exec();
        console.log("=======data===========", data[0].favourites)
        let populateData = await model.populate(data, populateOptions);
        return (populateData);
    } catch (err) {
        return err;
    }
}

function countData(model, condition) {
    return new Promise((resolve, reject) => {
        try {
            let data = model.count(condition);
            return resolve(data);
        } catch (err) {
            return reject(err);
        }
    });
}

function aggregateData(model, group) {
    return new Promise((resolve, reject) => {
        try {
            let data = model.aggregate(group);
            console.log("data *********", model.aggregate(group), data.length)
            return resolve(data);
        } catch (err) {
            return reject(err);
        }
    });
}

function insert(model, data, options) {
    console.log("=== data, options========================", data, options);
    return new Promise((resolve, reject) => {
        try {
            let data = model.collection.insert(data, options);
            return resolve(data);
        } catch (err) {
            return reject(err);
        }
    });
}

function insertMany(model, insert, options) {
    return new Promise((resolve, reject) => {
        try {
            let data = model.collection.insertMany(insert, options);
            return resolve(data);
        } catch (err) {
            return reject(err);
        }
    });
}

let bulkFindAndUpdate = (bulk, query, update, options) => {
    bulk.find(query).upsert().update(update, options);
};

let bulkFindAndUpdateOne = (bulk, query, update, options) => {
    bulk.find(query).upsert().updateOne(update, options);
};

async function aggregateDataWithPopulate(model, group, populateOptions) {
    try {
        let aggregateData = await model.aggregate(group);
        let populateData = await model.populate(aggregateData, populateOptions);

        return populateData;
    } catch (err) {
        return err;
    }
}

module.exports = {
    saveData: saveData,
    getData: getData,
    getDataOne: getDataOne,
    update: update,
    remove: remove,
    insert: insert,
    insertMany: insertMany,
    getUniqueData: getUniqueData,
    countData: countData,
    findAndUpdate: findAndUpdate,
    populateData: populateData,
    aggregateData: aggregateData,
    aggregateDataWithPopulate: aggregateDataWithPopulate,
    bulkFindAndUpdate: bulkFindAndUpdate,
    deepPopulateData: deepPopulateData,
    bulkFindAndUpdateOne: bulkFindAndUpdateOne
};