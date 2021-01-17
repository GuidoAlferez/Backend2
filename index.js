const fetch = require ('node-fetch')
const mongoose = require('mongoose');
const RequestLog = require('./Models/RequestLog');
const express = require('express');

const app = express ();
app.use(express.json())

let ip="";
let textoDeBusqueda="";

app.get('/search/shows/:textoDeBusqueda',(req,res)=>{
    textoDeBusqueda= req.params.textoDeBusqueda;

    //Cuando recibamos un nuevo request desde el frontend, revisar primero si podemosresponder desde nuestro Mongo.
    // Si tenemos una respuesta posible, enviar eseobjeto al frontend. Si no la tenemos, realizar el request a TVMaze.
    
    fetch(`http://api.tvmaze.com/singlesearch/shows?q=${textoDeBusqueda}`) //realizo peticion a tvmaze
    .then(res => res.json())
    .then(resultado => {
        res.status(200).send({resultado});
        console.log("La busqueda es: ");
        console.log(resultado);
    })
    .catch( error => {
        res.status(404).send({message:"La serie no fue encontrada"});
        console.log(`No se encontro la serie: ${req.params.textoDeBusqueda}`);
        console.log("ERROR: ", error);
    })
})

app.post('/search/shows/ip',(req,res)=>{ //recibo la ip
    ip= req.body.ip;
    console.log("la IP recibida desde el FrontEnd:", ip)
    res.status(200).send({ip});
    //armo el objeto para luego guardarlo en la base de datos

//En la colección "requestLogs", agregar un atributo al objeto "responseFrom" condos opciones "CACHE|API", completar segun corresponda.

    let log = new RequestLog({
        fecha: new Date(),
        textoDeBusqueda:textoDeBusqueda,
        ip:ip,
        responseFrom:"CACHE|API"
    })
    
    log.save().then(function(logCreated){
        console.log("Fue guardada en la Base de Datos:")
        console.log(logCreated);
    })
})

mongoose.connect(
    'mongodb+srv://alferezguido:1546@cluster0.fwzhw.mongodb.net/code_challenge?retryWrites=true&w=majority', function(err){
    if(err){
        console.log("ERROR EN LA CONEXION");
    }else{            
        app.listen('3200',(err)=>{
            console.log("Server Up & Running")
        })
        console.log("Conexion exitosa a la base de datos");
    }
});