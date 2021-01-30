const URL_DB = require("./Models/config")
const PORT = "3200";
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch')

//-------------------------------------------------------------------------------->
const RequestLog = require('./Models/RequestLog')
const SerieBuscada = require('./Models/SerieBuscada')
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.get('/', (req, res) => {
    res.status(200).send({ mensaje: "Bienvenido" })
})
app.set('true proxy', true)

//GET Serie
app.get('/:serie', (req, res) => {
    SerieBuscada.findOne({name : req.params.serie})
    .then((SerieX)=>{
        if(SerieX){
            res.status(200).send(SerieX)
            const newRequest = new RequestLog({
            date: new Date(),
            search: req.params.serie,
            ip: req.header('x-forwarded-for') || req.connection.remoteAddress,
            responseFrom: "CACHE"
            })
        }else{
            fetch(`${URL_DB}${req.params.serie}`)
            .then((res)=>{return res.json()})
            .then((json)=>{
                if(!json){return res.status(404).send({"Not Founded":"404 Serie Not Founded"})}
                else{
                    res.status(200).send(json)
                    const newSerie = new SerieBuscada({
                        name:json.name,
                        image:{medium:json.image.medium},
                        summary:json.summary,
                        officialSite:json.officialSite
                    })
                    newSerie.save().then((serieSaved)=>{
                        return console.log(serieSaved)
                    }).catch(err=>{ return console.log({"Error guardando serie":err})})
                    const newRequest = new RequestLog({
                        date: new Date(),
                        search: req.params.serie,
                        ip: req.header('x-forwarded-for') || req.connection.remoteAddress,
                        responseFrom:"API"
                    })
                    newRequest.save().then((requestSaved) => {
                        console.log(requestSaved)
                    }).catch(err => { return console.log({ "Error": err }) })
                }
            })
        }
    })
})

mongoose.connect(connectionString, ((err) => {
    if (err) {
        console.log(err)
    } else {
        console.log("Database conected")
        app.listen(PORT, (() => {
            console.log("Server Express Listening")
        }))
    }
}))