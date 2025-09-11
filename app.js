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

        // Prefixe avec IP et port du client pour diffusion
        try {
            var ip = (ws._socket && ws._socket._peername && ws._socket._peername.address) || req.connection.remoteAddress;
            var prt = (ws._socket && ws._socket._peername && ws._socket._peername.port) || req.connection.remotePort;
        } catch (e) {
            // si indisponible, garder le message tel quel
        }

        // Envoi a tous les clients connectes
        aWss.broadcast(message);
    });

    ws.on('close', function (reasonCode, description) {
        console.log('Deconnexion WebSocket %s sur le port %s',
            req.connection.remoteAddress, req.connection.remotePort);
    });
});

// Variables pour le jeu questions/réponses
var question = '?';
var bonneReponse = 0;

// Connexion des clients a la WebSocket /qr et evenements associés
// Questions/reponses
app.ws('/qr', function (ws, req) {
    console.log('Connection WebSocket %s sur le port %s',
        req.connection.remoteAddress, req.connection.remotePort);
    NouvelleQuestion();
    ws.on('message', TraiterReponse);
    ws.on('close', function (reasonCode, description) {
        console.log('Deconnexion WebSocket %s sur le port %s',
            req.connection.remoteAddress, req.connection.remotePort);
    });
    
    function TraiterReponse(message) {
        console.log('De %s %s, message :%s', req.connection.remoteAddress,
            req.connection.remotePort, message);
        if (message == bonneReponse) {
            console.log('Bonne réponse de %s:%s', req.connection.remoteAddress, req.connection.remotePort);
            NouvelleQuestion();
        }
    }
    
    function NouvelleQuestion() {
        var x = GetRandomInt(11);
        var y = GetRandomInt(11);
        question = x + '*' + y + ' = ?';
        bonneReponse = x * y;
        console.log('Nouvelle question: %s (réponse: %s)', question, bonneReponse);
        aWssQr.broadcast(question);
    }
    
    function GetRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
});

/*  ****** Serveur web et WebSocket en ecoute sur le port 80  ********   */
//  
app.listen(portServ, function () {
    console.log('Serveur en ecoute' + portServ);
}); 

/*  ****************** Broadcast clients WebSocket  **************   */
var aWss = expressWs.getWss('/echo'); 
var aWssQr = expressWs.getWss('/qr');
var WebSocket = require('ws');

aWss.broadcast = function broadcast(data) {
    console.log("Broadcast aux clients navigateur : %s", data);
    aWss.clients.forEach(function each(client) {
        if (client.readyState == WebSocket.OPEN) {
            client.send(data, function ack(error) {
                console.log("    -  %s-%s", client._socket.remoteAddress,
                    client._socket.remotePort);
                if (error) {
                    console.log('ERREUR websocket broadcast : %s', error.toString());
                }
            });
        }
    });
};

aWssQr.broadcast = function broadcast(data) {
    console.log("Broadcast QR aux clients navigateur : %s", data);
    aWssQr.clients.forEach(function each(client) {
        if (client.readyState == WebSocket.OPEN) {
            client.send(data, function ack(error) {
                console.log("    -  %s-%s", client._socket.remoteAddress,
                    client._socket.remotePort);
                if (error) {
                    console.log('ERREUR websocket broadcast QR : %s', error.toString());
                }
            });
        }
    });
};
