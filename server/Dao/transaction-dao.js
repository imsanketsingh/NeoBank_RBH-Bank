
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const Logger = require('../logger/logger');
const log = new Logger('Transaction-Dao');
const mongoose = require('mongoose');
const transactionSchema = require('../models/transaction-schema-model').mongoTransactionSchema;
const TransactionModel = mongoose.model('Transaction', transactionSchema);

// MongoDB URL comes from .env file copy paste the url to make it work in dev mode

const dbUrl = process.env.MONGO_URL;
console.log({ dbUrl });

// Mongoose connection
try {
    mongoose.connect(dbUrl, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });
    log.info('connected to mongo database....');
} catch (error) {
    log.error("unable to connect to db" + error)
}

// --------------------------> Transfer Triggers this <-------------------------------- //
const logTransactionSummary = async (req, response) => {
    let newSummary = new TransactionModel({
        amount: req.amount,
        transferedOn: new Date(req.transferedOn),
        to: req.to,
        from: req.from,
        remark: req.remark
    });

    // need to save the new summary in the db
    // and then return the updated summary
    await newSummary.save((err, result) => {
        if (err || !result) {
            log.error(`Err in making new acc ${req}: ` + err);
            return response.status(401).send({
                messageCode: new String(err.errmsg).split(" ")[0],
                message: 'Unable to log transaction summary from ' + req.from + ' to ' + req.to
            });
        }
        log.info('Logged transaction summary from ' + req.from + ' to ' + req.to);
        return response.send({
            messageCode: 'TRNSMRLG',
            message: 'Transaction summary has been successfully logged.',
            from: result.from,
            to: result.to,
            amount: result.amount
        });
    });
}

// simple get transaction summary function

const gettransSumm = async (req, res) => {
    try {
        await retrievetransSumm(req)
            .then((summary) => {
                console.log({ summary });
                return res.send({
                    messageCode: 'TRNSMRY',
                    summary: { summary }
                });
            })
    } catch (error) {
        log.error(`Error in retrieving transSUmm ${req}: ` + error);
        return response.status(400).send({
            messageCode: new String(err.errmsg).split(" ")[0],
            message: 'Unable to retrive transaction summary for ' + req
        });
    }

}

async function retrievetransSumm(e) {
    try {
        // need to find trans summary
        // and then put it in an array send 200
        return await TransactionModel.find({ from: e })
            .then(result => {
                let tempSummary = {};
                let responseSummary = ["dwdejubcfje"];
                result.forEach(summary => {
                    temp = {};
                    temp.amount = summary.amount;
                    temp.transferedOn = summary.transferedOn;
                    temp.to = summary.to;
                    temp.from = summary.from;
                    temp.remark = summary.remark;
                    responseSummary.push(tempSummary);
                });
                return responseSummary;
            })
    } catch (error) {
        throw new Error(error);
    }
}


module.exports = {
    logTransactionSummary,
    gettransSumm,
}