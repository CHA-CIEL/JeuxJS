'use strict';

var WebSocket = require('ws');

class CQr {
    constructor() {
        this.question = '?';
        this.bonneReponse = 0;
        this.joueurs = new Array();
    }

    GetRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    NouvelleQuestion() {
        if (Math.random() < 0.5) {
            var x = this.GetRandomInt(11);
            var y = this.GetRandomInt(11);
            this.question = x + '*' + y + ' = ?';
            this.bonneReponse = x * y;
        } else {
            var qb = this.NouvelleQuestionBinaire();
            this.question = qb.question;
            this.bonneReponse = qb.bonneReponse;
        }
        this.EnvoyerResultatDiff();
    }

    NouvelleQuestionBinaire() {
        var n = Math.floor(Math.random() * 256);
        var binaire = '';
        for (var i = 7; i >= 0; i--) {
            var bit = (n >> i) & 1;
            binaire += bit ? '1' : '0';
        }
        return { question: 'Convertir en base 10: ' + binaire, bonneReponse: n };
    }

    TraiterReponse(wsClient, message) {
        var brut = (message !== undefined && message !== null) ? String(message) : '';
        var nom = '';
        var valeur = NaN;
        var repStr = '';
        var aRepValide = false;
        if (brut.length && brut.charAt(0) === '{') {
            try {
                var mess = JSON.parse(brut);
                nom = (mess && mess.nom) ? String(mess.nom) : '';
                repStr = (mess && mess.reponse !== undefined && mess.reponse !== null) ? String(mess.reponse) : '';
                if (repStr.trim() !== '' && !Number.isNaN(parseInt(repStr.trim(), 10))) {
                    valeur = parseInt(repStr.trim(), 10);
                    aRepValide = true;
                }
            } catch (e) {
                valeur = parseInt(brut.trim(), 10);
            }
        } else {
            valeur = parseInt(brut.trim(), 10);
        }
    }

    EnvoyerResultatDiff() {
        var messagePourLesClients = {
            question: this.question
        };
        aWss.broadcast(JSON.stringify(messagePourLesClients));
    }
}

module.exports = CQr;
