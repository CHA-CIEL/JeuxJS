var ipServeur = '172.17.50.131';     // Adresse IP du serveur WebSocket
var ws;                              // Déclaration de la variable pour l'objet WebSocket

// Cette fonction s'exécute automatiquement au chargement de la page
window.onload = function () {
    // Vérifie si le navigateur supporte les WebSockets
    if (TesterLaCompatibilite()) {
        // Si compatible, établit une connexion WebSocket avec le serveur
        ConnexionAuServeurWebsocket();
    }
    // Configure les contrôles de l'interface utilisateur (IHM)
    ControleIHM();
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
    // Crée une nouvelle instance WebSocket avec l'adresse IP et le chemin /echo
    ws = new WebSocket('ws://' + ipServeur + '/qr');

    // Définition du comportement à la fermeture de la connexion WebSocket
    ws.onclose = function (evt) {
        window.alert('WebSocket close');  // Affiche une alerte lors de la fermeture
    };

    // Définition du comportement à l'ouverture de la connexion WebSocket
    ws.onopen = function () {
        console.log('WebSocket open');  // Affiche un message dans la console
    };

    // Définition du comportement à la réception d'un message depuis le serveur
    ws.onmessage = function (evt) {
        // Affiche la question reçue dans le champ texte avec l'ID `questionRecue`
        document.getElementById('questionRecue').value = evt.data;
    };
}


// Fonction pour configurer l'interface utilisateur (IHM)
function ControleIHM() {
    // Associe la fonction BPValider au clic sur le bouton avec l'ID `Valider`
    document.getElementById('Valider').onclick = BPValider;
}


// Fonction appelée lors du clic sur le bouton "Valider"
function BPValider() {
    // Envoie au serveur le contenu du champ texte avec l'ID `reponseEnvoi`
    ws.send(document.getElementById('reponseEnvoi').value);
}