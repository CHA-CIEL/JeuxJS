var ipServeur = '172.17.50.131';     // Adresse IP du serveur WebSocket
var ws;                              // Déclaration de la variable pour l'objet WebSocket
var nomJoueur = '';                  // Nom du joueur
var scoreJoueur = 0;                 // Score du joueur

// Cette fonction s'exécute automatiquement au chargement de la page
window.onload = function () {
    // Vérifie si le navigateur supporte les WebSockets
    if (TesterLaCompatibilite()) {
        // Si compatible, établit une connexion WebSocket avec le serveur
        ConnexionAuServeurWebsocket();
    }
    // Configure les contrôles de l'interface utilisateur (IHM)
    ControleIHM();
    // Configure les événements clavier
    ConfigurerEvenements();
}

// Fonction qui teste la compatibilité du navigateur avec les WebSockets
function TesterLaCompatibilite() {
    let estCompatible = true;  // Par défaut, on suppose que le navigateur est compatible

    // Si l'objet WebSocket n'existe pas dans l'objet global `window`
    if (!('WebSocket' in window)) {
        // Affiche une alerte pour prévenir l'utilisateur
        window.alert('WebSocket non supporté par le navigateur');
        estCompatible = false;  // Marque le navigateur comme non compatible
    }

    return estCompatible;  // Retourne le résultat du test
}


// ***************** Connexion au serveur WebSocket ********************
// Fonction pour établir la connexion WebSocket avec le serveur
function ConnexionAuServeurWebsocket() {
    // Met à jour le statut de connexion (si l'élément existe)
    console.log('Connexion WebSocket en cours...');
    
    // Crée une nouvelle instance WebSocket avec l'adresse IP et le chemin /qr
    ws = new WebSocket('ws://' + ipServeur + '/qr');

    // Définition du comportement à la fermeture de la connexion WebSocket
    ws.onclose = function (evt) {
        console.log('WebSocket fermée');
        MettreAJourStatutConnexion('🔴 Connexion fermée', 'disconnected');
        document.getElementById('Valider').disabled = true;
    };

    // Définition du comportement à l'ouverture de la connexion WebSocket
    ws.onopen = function () {
        console.log('WebSocket ouverte');
        document.getElementById('Valider').disabled = false;
    };

    // Définition du comportement à la réception d'un message depuis le serveur
    ws.onmessage = function (evt) {
        var message = evt.data;
        console.log('Message reçu:', message);
        
        // Vérifie si c'est un message de feedback
        if (message === 'Bonne réponse !' || message === 'Mauvaise réponse !') {
            AfficherFeedback(message);
        } else {
            // C'est une question
            document.getElementById('questionTexte').value = message;
            document.getElementById('reponseTexte').value = '';
            document.getElementById('resultatTexte').value = '';
        }
    };

    // Gestion des erreurs de connexion
    ws.onerror = function(error) {
        console.error('Erreur WebSocket:', error);
        MettreAJourStatutConnexion('🔴 Erreur de connexion', 'disconnected');
    };
}


// Fonction pour configurer l'interface utilisateur (IHM)
function ControleIHM() {
    // Associe la fonction BPValider au clic sur le bouton avec l'ID `Valider`
    document.getElementById('Valider').onclick = BPValider;
    
    // Sauvegarde du nom et demande une question quand l'utilisateur quitte le champ
    document.getElementById('nom').onblur = function() {
        nomJoueur = this.value.trim();
        if (nomJoueur && ws && ws.readyState === WebSocket.OPEN) {
            // Demande une nouvelle question quand le nom est entré
            ws.send('REQUEST_QUESTION');
        }
    };
}

// Configure les événements clavier
function ConfigurerEvenements() {
    // Permet de valider avec la touche Entrée
    document.getElementById('reponseTexte').onkeypress = function(e) {
        if (e.key === 'Enter' && !document.getElementById('Valider').disabled) {
            BPValider();
        }
    };
}

// Fonction appelée lors du clic sur le bouton "Valider"
function BPValider() {
    var reponse = document.getElementById('reponseTexte').value.trim();
    if (reponse === '') {
        alert('Veuillez entrer une réponse !');
        return;
    }
    
    // Envoie la réponse au serveur
    ws.send(reponse);
    
    // Désactive temporairement le bouton
    document.getElementById('Valider').disabled = true;
    document.getElementById('Valider').value = '⏳ Envoyé...';
}

// Met à jour le statut de connexion
function MettreAJourStatutConnexion(message, classe) {
    var statusElement = document.getElementById('statusConnection');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'status ' + classe;
    }
}

// Affiche le feedback de réponse
function AfficherFeedback(message) {
    var questionField = document.getElementById('questionTexte');
    var resultatField = document.getElementById('resultatTexte');
    var resultatsDiv = document.getElementById('resultats');
    
    // Affiche le feedback dans le champ question
    questionField.value = message;
    resultatField.value = message;
    
    // Met à jour le score et l'historique
    if (message === 'Bonne réponse !') {
        scoreJoueur++;
        var timestamp = new Date().toLocaleTimeString();
        var playerName = nomJoueur || 'Joueur anonyme';
        var newResult = `[${timestamp}] ${playerName}: ✓ Bonne réponse! (Score: ${scoreJoueur})\n`;
        resultatsDiv.textContent = newResult + resultatsDiv.textContent;
    }
    
    // Réactive le bouton après le feedback
    setTimeout(function() {
        document.getElementById('Valider').disabled = false;
        document.getElementById('Valider').value = '✓ Valider';
    }, 1000);
}