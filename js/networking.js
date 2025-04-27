/**
 * Sets up multiplayer networking with PeerJS
 */
function setupNetworking() {
    // Generate random game code
    gameCode = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById('code').textContent = gameCode;
    
    // Initialize PeerJS
    peer = new Peer(gameCode);
    
    // Handle connections from other players
    setupConnectionHandling();
    
    // Create join game button
    createJoinButton();
}

/**
 * Sets up handlers for incoming connections
 */
function setupConnectionHandling() {
    peer.on('connection', (conn) => {
        connections.push(conn);
        
        conn.on('data', (data) => {
            handleIncomingData(conn, data);
        });
        
        conn.on('close', () => {
            handleDisconnection(conn);
        });
    });
}

/**
 * Handles incoming data from other players
 * @param {PeerJS.DataConnection} conn - The connection
 * @param {Object} data - The data received
 */
function handleIncomingData(conn, data) {
    if (data.type === 'position') {
        updateOtherPlayerPosition(conn, data);
    }
}

/**
 * Updates another player's position
 * @param {PeerJS.DataConnection} conn - The connection
 * @param {Object} data - Position data
 */
function updateOtherPlayerPosition(conn, data) {
    // Create new player if it doesn't exist
    if (!otherPlayers[conn.peer]) {
        createOtherPlayer(conn, data.color);
    }
    
    // Update position
    otherPlayers[conn.peer].position.x = data.x;
    otherPlayers[conn.peer].position.y = data.y;
    otherPlayers[conn.peer].position.z = data.z;
}

/**
 * Creates a visual representation of another player
 * @param {PeerJS.DataConnection} conn - The connection
 * @param {string} color - The player's color
 */
function createOtherPlayer(conn, color) {
    const otherPlayerSphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.4,
            metalness: 0.3
        })
    );
    otherPlayerSphere.castShadow = true;
    scene.add(otherPlayerSphere);
    
    otherPlayers[conn.peer] = otherPlayerSphere;
}

/**
 * Handles a player disconnecting
 * @param {PeerJS.DataConnection} conn - The connection
 */
function handleDisconnection(conn) {
    // Remove player from scene
    if (otherPlayers[conn.peer]) {
        scene.remove(otherPlayers[conn.peer]);
        delete otherPlayers[conn.peer];
    }
    
    // Remove connection
    const index = connections.indexOf(conn);
    if (index > -1) {
        connections.splice(index, 1);
    }
}

/**
 * Creates a button to join another game
 */
function createJoinButton() {
    // Double-click on game code to join
    document.getElementById('gameCode').addEventListener('dblclick', promptForGameCode);
    
    // Create join button for mobile
    const joinBtn = document.createElement('div');
    joinBtn.textContent = 'Join Game';
    joinBtn.style.position = 'absolute';
    joinBtn.style.top = '50px';
    joinBtn.style.right = '10px';
    joinBtn.style.background = 'rgba(0,0,0,0.5)';
    joinBtn.style.color = 'white';
    joinBtn.style.padding = '10px';
    joinBtn.style.borderRadius = '5px';
    joinBtn.style.fontFamily = 'Arial, sans-serif';
    joinBtn.style.cursor = 'pointer';
    
    joinBtn.addEventListener('click', promptForGameCode);
    document.body.appendChild(joinBtn);
}

/**
 * Prompts user for a game code and joins that game
 */
function promptForGameCode() {
    const joinCode = prompt("Enter game code to join:");
    if (joinCode) {
        joinGame(joinCode);
    }
}

/**
 * Joins a game with the specified code
 * @param {string} joinCode - The game code to join
 */
function joinGame(joinCode) {
    const conn = peer.connect(joinCode);
    
    conn.on('open', () => {
        connections.push(conn);
        
        conn.on('data', (data) => {
            handleIncomingData(conn, data);
        });
    });
}

/**
 * Sends this player's position to all connected players
 */
function sendPositionUpdate() {
    if (connections.length === 0) return;
    
    connections.forEach(conn => {
        conn.send({
            type: 'position',
            x: playerSphere.position.x,
            y: playerSphere.position.y,
            z: playerSphere.position.z,
            color: playerColor
        });
    });
}