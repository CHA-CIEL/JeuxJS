/* eslint-disable linebreak-style */
'use strict';

console.log('TP CIEL');

// Variables pour le jeu questions/réponses
var question = '?';
var bonneReponse = 0;

// Fonction pour générer une nouvelle question
function NouvelleQuestion() {
    var x = GetRandomInt(11);
    var y = GetRandomInt(11);
    question = x + ' × ' + y + ' = ?';
    bonneReponse = x * y;
    
    var timestamp = new Date().toLocaleTimeString();
    console.log('[%s] 🎯 Nouvelle question: %s (réponse: %s)', timestamp, question, bonneReponse);
    
    // Diffuse la nouvelle question à tous les clients connectés
    if (typeof aWssQr !== 'undefined' && aWssQr.broadcast) {
        aWssQr.broadcast(question);
    }
}

function GetRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

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

        // Ajouter l'adresse IP et port au message à diffuser
        var message = ws._socket._peername.address + ws._socket._peername.port + ' : ' + message;

        // Envoi a tous les clients connectes
        message = ws._socket._peername.address + ws._socket._peername.port + ' : ' + message;
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
// Questions/reponses - Jeu multijoueur en temps réel
app.ws('/qr', function (ws, req) {
    var clientInfo = req.connection.remoteAddress + ':' + req.connection.remotePort;
    console.log('🔗 Nouvelle connexion WebSocket: %s', clientInfo);
    
    // Envoie la question actuelle au nouveau client
    if (question !== '?') {
        ws.send(question);
    } else {
        // Génère la première question si aucune n'existe
        NouvelleQuestion();
    }
    
    ws.on('message', TraiterReponse);
    ws.on('close', function (reasonCode, description) {
        console.log('🔌 Déconnexion WebSocket: %s (Code: %s)', clientInfo, reasonCode);
    });
    
    function TraiterReponse(message) {
        console.log('De %s:%s, message: %s', req.connection.remoteAddress,
            req.connection.remotePort, message);
        
        // Si c'est une demande de question
        if (message === 'REQUEST_QUESTION') {
            ws.send(question);
            return;
        }
        
        // Vérifie si la réponse est correcte
        if (parseInt(message) === bonneReponse) {
            console.log('✓ Bonne réponse de %s:%s', req.connection.remoteAddress, req.connection.remotePort);
            
            // Envoie le feedback positif uniquement à l'expéditeur
            ws.send("Bonne réponse !");
            
            // Attend 3 secondes puis génère une nouvelle question pour tous
            setTimeout(function() {
                NouvelleQuestion();
            }, 3000);
            
        } else {
            console.log('✗ Mauvaise réponse de %s:%s (attendu: %s, reçu: %s)', 
                req.connection.remoteAddress, req.connection.remotePort, bonneReponse, message);
            
            // Envoie le feedback négatif uniquement à l'expéditeur
            ws.send("Mauvaise réponse !");
            
            // Attend 3 secondes puis renvoie la question actuelle à l'expéditeur
            setTimeout(function() {
                ws.send(question);
            }, 3000);
        }
    }
    
    function NouvelleQuestion() {
        var x = GetRandomInt(11);
        var y = GetRandomInt(11);
        question = x + ' × ' + y + ' = ?';
        bonneReponse = x * y;
        
        var timestamp = new Date().toLocaleTimeString();
        console.log('[%s] 🎯 Nouvelle question: %s (réponse: %s)', timestamp, question, bonneReponse);
        
        // Diffuse la nouvelle question à tous les clients connectés
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
    var clientCount = 0;
    console.log("📡 Broadcast QR: %s", data);
    
    aWssQr.clients.forEach(function each(client) {
        if (client.readyState == WebSocket.OPEN) {
            clientCount++;
            client.send(data, function ack(error) {
                if (error) {
                    console.log('⚠️ ERREUR broadcast QR: %s', error.toString());
                } else {
                    console.log("    ✓ Envoyé à: %s:%s", 
                        client._socket.remoteAddress, client._socket.remotePort);
                }
            });
        }
    });
    
    console.log(" Message diffusé à %d client(s) connecté(s)", clientCount);
};

/*  *************** serveur WebSocket express /qr *********************   */
// 
app.ws('/qr', function (ws, req) {
    console.log('Connection WebSocket %s sur le port %s', req.connection.remoteAddress,
        req.connection.remotePort);
    NouvelleQuestion();

    ws.on('message', function(message) {
        TraiterReponse(ws, message);
    });

    ws.on('close', function (reasonCode, description) {
        console.log('Deconnexion WebSocket %s sur le port %s',
            req.connection.remoteAddress, req.connection.remotePort);
    });

});

// Fonction pour traiter les réponses (JSON et texte)
function TraiterReponse(ws, message) {
    var clientInfo = ws._socket.remoteAddress + ':' + ws._socket.remotePort;
    console.log('De %s, message: %s', clientInfo, message);
    
    try {
        // Tentative de parsing JSON
        var mess = JSON.parse(message);
        console.log('Message JSON parsé:', mess);
        
        if (mess.nom && mess.reponse !== undefined) {
            var nom = mess.nom.trim();
            var reponse = parseInt(mess.reponse);
            
            console.log('Joueur: %s, Réponse: %s', nom, reponse);
            
            // Vérifie si la réponse est correcte
            if (reponse === bonneReponse) {
                console.log('✓ Bonne réponse de %s', nom);
                ws.send("Bonne réponse " + nom + " !");
                
                setTimeout(function() {
                    NouvelleQuestion();
                }, 3000);
                
            } else {
                console.log('✗ Mauvaise réponse de %s (attendu: %s, reçu: %s)', 
                    nom, bonneReponse, reponse);
                
                ws.send("Mauvaise réponse " + nom + " !");
                
                setTimeout(function() {
                    ws.send(question);
                }, 3000);
            }
        }
        
    } catch (e) {
        // Si ce n'est pas du JSON, traitement en texte simple
        console.log('Message texte reçu (non-JSON):', message);
        
        // Si c'est une demande de question
        if (message === 'REQUEST_QUESTION') {
            ws.send(question);
            return;
        }
        
        // Traitement de la réponse en texte
        var reponseTexte = parseInt(message);
        if (reponseTexte === bonneReponse) {
            console.log('✓ Bonne réponse de %s', clientInfo);
            ws.send("Bonne réponse !");
            
            setTimeout(function() {
                NouvelleQuestion();
            }, 3000);
            
        } else {
            console.log('✗ Mauvaise réponse de %s (attendu: %s, reçu: %s)', 
                clientInfo, bonneReponse, reponseTexte);
            
            ws.send("Mauvaise réponse !");
            
            setTimeout(function() {
                ws.send(question);
            }, 3000);
        }
    }
} 