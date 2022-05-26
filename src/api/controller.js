let db = require("../../public/database")
let phones = [];

const main = (req, res) => {
    res.send("<h1>API page</h1>")
}

const getService = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({"service": db.services[req.params.id]}));
}

const getServices = (req, res) => {
    return res.json(db.services)
}

const getServiceCount = (req, res) => {
    return res.json({num: Object.keys(db.services).length})
}

const postCall = (req, res) => {
    let phone = {};
    phone["name"] = req.body.name;
    phone["number"] = req.body.phone;
    phones.push(phone);
    console.log(phone);
}

module.exports = {main, getService, getServices, getServiceCount, postCall};