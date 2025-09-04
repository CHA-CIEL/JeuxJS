'use strict';

console.log('TP CIEL');

/* *********************** Serveur Web ************************ */

var port = 80;
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

app.listen(port, function () {
    console.log('Serveur en écoute sur le port ' + port);
});
