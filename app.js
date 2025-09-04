'use strict';

console.log('TP CIEL');

/* *********************** Serveur Web ************************ */
var portServ = 80;
var express = require('express');
var app = express(); 

app.use(express.static(__dirname + '/www'));

// Route principale
app.get('/', function (req, res) {
    console.log('Réponse à un client');
    res.sendFile(__dirname + '/www/index.html');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Erreur serveur express');
});

/*  *************** serveur WebSocket express *********************   */
// 
var expressWs = require('express-ws')(app);

// Connexion des clients à la WebSocket /echo et evenements associés 
app.ws('/echo', function (ws, req) {

    console.log('Connection WebSocket %s sur le port %s',
        req.connection.remoteAddress, req.connection.remotePort);

    ws.on('message', function (message) {
        console.log('De %s %s, message :%s', req.connection.remoteAddress,
            req.connection.remotePort, message);
        ws.send(message);
    });

    ws.on('close', function (reasonCode, description) {
        console.log('Deconnexion WebSocket %s sur le port %s',
            req.connection.remoteAddress, req.connection.remotePort);
    });

}); 

/*  ****** Serveur web et WebSocket en ecoute sur le port 80  ********   */
//  
app.listen(portServ, function () {
    console.log('Serveur en ecoute' + portServ);
}); 