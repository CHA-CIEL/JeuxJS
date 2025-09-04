var ipServeur = '172.17.50.131';     // Adresse IP du serveur WebSocket
var ws;                              // D�claration de la variable pour l'objet WebSocket

// Cette fonction s'ex�cute automatiquement au chargement de la page
window.onload = function () {
    // V�rifie si le navigateur supporte les WebSockets
    if (TesterLaCompatibilite()) {
        // Si compatible, �tablit une connexion WebSocket avec le serveur
        ConnexionAuServeurWebsocket();
    }
    // Configure les contr�les de l'interface utilisateur (IHM)
    ControleIHM();
}

// Fonction qui teste la compatibilit� du navigateur avec les WebSockets
function TesterLaCompatibilite() {
    let estCompatible = true;  // Par d�faut, on suppose que le navigateur est compatible

    // Si l'objet WebSocket n'existe pas dans l'objet global `window`
    if (!('WebSocket' in window)) {
        // Affiche une alerte pour pr�venir l'utilisateur
        window.alert('WebSocket non support� par le navigateur');
        estCompatible = false;  // Marque le navigateur comme non compatible
    }

    return estCompatible;  // Retourne le r�sultat du test
}


// ***************** Connexion au serveur WebSocket ********************
// Fonction pour �tablir la connexion WebSocket avec le serveur
function ConnexionAuServeurWebsocket() {
    // Cr�e une nouvelle instance WebSocket avec l'adresse IP et le chemin /echo
    ws = new WebSocket('ws://' + ipServeur + '/echo');

    // D�finition du comportement � la fermeture de la connexion WebSocket
    ws.onclose = function (evt) {
        window.alert('WebSocket close');  // Affiche une alerte lors de la fermeture
    };

    // D�finition du comportement � l'ouverture de la connexion WebSocket
    ws.onopen = function () {
        console.log('WebSocket open');  // Affiche un message dans la console
    };

    // D�finition du comportement � la r�ception d�un message depuis le serveur
    ws.onmessage = function (evt) {
        // Affiche le message re�u dans un champ texte avec l'ID `messageRecu`
        document.getElementById('messageRecu').value = evt.data;
    };
}


// Fonction pour configurer l'interface utilisateur (IHM)
function ControleIHM() {
    // Associe la fonction BPEnvoyer au clic sur le bouton avec l'ID `Envoyer`
    document.getElementById('Envoyer').onclick = BPEnvoyer;
}


// Fonction appel�e lors du clic sur le bouton "Envoyer"
function BPEnvoyer() {
    // Envoie au serveur le contenu du champ texte avec l'ID `messageEnvoi`
    ws.send(document.getElementById('messageEnvoi').value);
}
