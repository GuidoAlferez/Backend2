const mongoose = require ("mongoose");

const requestLogSchema = new mongoose.Schema({
    fecha:String,
    textoDeBusqueda:String,
    ip:String,
    responseFrom:String
});
module.exports = mongoose.model('RequestLog',requestLogSchema); 