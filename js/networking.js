

/**
 * Sets up multiplayer networking with PeerJS
 */
function setupNetworking() {
    if (gameMode === 'host') {
        // Generate random game code as host
        gameCode = Math.floor(100 + Math.random() * 900).toString();
        document.getElementById('code').textContent = gameCode;
        
        // Initialize PeerJS as host
        peer = new Peer(gameCode);
    } else {
        // Join existing game
        // Use a random ID for this peer
        const randomId = 'player_' + Math.floor(100000 + Math.random() * 900000).toString();
        peer = new Peer(randomId);
        
        // Display the code we're connecting to
        document.getElementById('code').textContent = gameCodeToJoin + ' (Joining)';
    }
    
    // Handle connections from other players
    setupConnectionHandling();
    
    // Join game if in join mode
    if (gameMode === 'join' && gameCodeToJoin) {
        // Wait for PeerJS to be ready
        peer.on('open', (id) => {
            joinGame(gameCodeToJoin);
            console.log('Joining game with code:', gameCodeToJoin);
        });
    }
}
// Add function to start the game for all players:
function startGameForAll() {
    if (gameMode === 'host') {
        gameStarted = true;
        
        // Send start game signal to all connections
        connections.forEach(conn => {
            conn.send({
                type: 'game_start'
            });
        });
        
        // Start the actual game for host
        startActualGame();
        
        // Hide waiting room UI
        hideWaitingRoom();
    }
}
/**
 * Sets up handlers for incoming connections
 */
function setupConnectionHandling() {
    // Handle errors
    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
    });
    
    // Handle connections
    peer.on('connection', (conn) => {
        if (gameStarted) {
            // Game already started, reject connection
            conn.close();
            return;
        }
        
        connections.push(conn);
        
        conn.on('data', (data) => {
            handleIncomingData(conn, data);
        });
        
        conn.on('close', () => {
            handleDisconnection(conn);
        });
    });
}
// Create waiting room UI for host:
function createWaitingRoomUI() {
    const waitingRoom = document.createElement('div');
    waitingRoom.id = 'waiting-room';
    waitingRoom.style.position = 'fixed';
    waitingRoom.style.top = '0';
    waitingRoom.style.left = '0';
    waitingRoom.style.width = '100%';
    waitingRoom.style.height = '100%';
    waitingRoom.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    waitingRoom.style.display = 'flex';
    waitingRoom.style.flexDirection = 'column';
    waitingRoom.style.justifyContent = 'center';
    waitingRoom.style.alignItems = 'center';
    waitingRoom.style.zIndex = '3000';
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Waiting for Players';
    title.style.color = 'white';
    title.style.marginBottom = '20px';
    
    // Add game code info
    const codeInfo = document.createElement('div');
    codeInfo.innerHTML = `Game Code: <span style="font-weight: bold; color: #4CAF50;">${gameCode}</span>`;
    codeInfo.style.color = 'white';
    codeInfo.style.marginBottom = '30px';
    codeInfo.style.fontSize = '18px';
    
    // Add player list container
    const playerListContainer = document.createElement('div');
    playerListContainer.id = 'player-list-container';
    playerListContainer.style.width = '300px';
    playerListContainer.style.maxHeight = '300px';
    playerListContainer.style.overflowY = 'auto';
    playerListContainer.style.backgroundColor = 'rgba(50, 50, 50, 0.7)';
    playerListContainer.style.borderRadius = '5px';
    playerListContainer.style.padding = '10px';
    playerListContainer.style.marginBottom = '30px';
    
    // Add host to player list
    const hostEntry = document.createElement('div');
    hostEntry.innerHTML = `<span style="color: ${playerColor};">● </span>${playerName} (Host)`;
    hostEntry.style.color = 'white';
    hostEntry.style.marginBottom = '5px';
    hostEntry.style.padding = '5px';
    hostEntry.style.borderRadius = '3px';
    hostEntry.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    
    playerListContainer.appendChild(hostEntry);
    
    // Add start game button (host only)
    const startButton = document.createElement('button');
    startButton.textContent = 'Begin Game for All';
    startButton.style.padding = '15px 30px';
    startButton.style.backgroundColor = '#4CAF50';
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '5px';
    startButton.style.fontSize = '18px';
    startButton.style.cursor = 'pointer';
    
    startButton.addEventListener('click', startGameForAll);
    
    // Assemble waiting room
    waitingRoom.appendChild(title);
    waitingRoom.appendChild(codeInfo);
    waitingRoom.appendChild(playerListContainer);
    
    // Only host gets the start button
    if (gameMode === 'host') {
        waitingRoom.appendChild(startButton);
    } else {
        const waitingText = document.createElement('div');
        waitingText.textContent = 'Waiting for host to start the game...';
        waitingText.style.color = 'white';
        waitingText.style.marginTop = '20px';
        waitingRoom.appendChild(waitingText);
    }
    
    document.body.appendChild(waitingRoom);
}
/**
 * Shows a message when a player joins
 * @param {string} playerName - The name of the player who joined
 */
function showPlayerJoinedMessage(playerName) {
    const message = document.createElement('div');
    message.textContent = `${playerName} joined the game!`;
    message.style.position = 'absolute';
    message.style.top = '80px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.backgroundColor = 'rgba(0, 100, 200, 0.8)';
    message.style.color = 'white';
    message.style.padding = '10px 20px';
    message.style.borderRadius = '5px';
    message.style.fontFamily = 'Arial, sans-serif';
    message.style.fontSize = '16px';
    message.style.zIndex = '2000';
    
    document.body.appendChild(message);
    
    // Remove after 3 seconds
    setTimeout(() => {
        document.body.removeChild(message);
    }, 3000);
}

/**
 * Handles incoming data from other players
 * @param {PeerJS.DataConnection} conn - The connection
 * @param {Object} data - The data received
 */
function handleIncomingData(conn, data) {
    if (data.type === 'position') {
        updateOtherPlayerPosition(conn, data);
    } else if (data.type === 'player_info') {
        // Store player info and update waiting room
        addPlayerToWaitingRoom(conn, data.name, data.color);
    } else if (data.type === 'game_start') {
        // Game start signal received from host
        startActualGame();
        hideWaitingRoom();
    }
}
// Hide waiting room UI
function hideWaitingRoom() {
    const waitingRoom = document.getElementById('waiting-room');
    if (waitingRoom) {
        document.body.removeChild(waitingRoom);
    }
}
// Start the actual game (separate from initialization)
function startActualGame() {
    // Initialize the game objects and start the game loop
    init();
}
// Function to add player to waiting room:
function addPlayerToWaitingRoom(conn, name, color) {
    if (!connectedPlayers.some(p => p.id === conn.peer)) {
        connectedPlayers.push({
            id: conn.peer,
            name: name,
            color: color
        });
        
        // Update the waiting room UI
        updateWaitingRoomUI();
    }
}

// Update the waiting room UI with connected players
function updateWaitingRoomUI() {
    const playerListContainer = document.getElementById('player-list-container');
    if (!playerListContainer) return;
    
    // Clear existing player list (except host)
    while (playerListContainer.childNodes.length > 1) {
        playerListContainer.removeChild(playerListContainer.lastChild);
    }
    
    // Add each connected player
    connectedPlayers.forEach(player => {
        const playerEntry = document.createElement('div');
        playerEntry.innerHTML = `<span style="color: ${player.color};">● </span>${player.name}`;
        playerEntry.style.color = 'white';
        playerEntry.style.marginBottom = '5px';
        playerEntry.style.padding = '5px';
        playerEntry.style.borderRadius = '3px';
        playerEntry.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        
        playerListContainer.appendChild(playerEntry);
    });
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
 * Shows a connection success message
 * @param {string} code - The game code connected to
 */
function showConnectionSuccessMessage(code) {
    const message = document.createElement('div');
    message.textContent = `Connected to game ${code}!`;
    message.style.position = 'absolute';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.backgroundColor = 'rgba(0, 200, 0, 0.8)';
    message.style.color = 'white';
    message.style.padding = '15px 30px';
    message.style.borderRadius = '5px';
    message.style.fontFamily = 'Arial, sans-serif';
    message.style.fontSize = '20px';
    message.style.zIndex = '2000';
    
    document.body.appendChild(message);
    
    // Remove after 3 seconds
    setTimeout(() => {
        document.body.removeChild(message);
    }, 3000);
}

/**
 * Shows a connection error message
 */
function showConnectionErrorMessage() {
    const message = document.createElement('div');
    message.textContent = 'Failed to connect! Check the game code and try again.';
    message.style.position = 'absolute';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.backgroundColor = 'rgba(200, 0, 0, 0.8)';
    message.style.color = 'white';
    message.style.padding = '15px 30px';
    message.style.borderRadius = '5px';
    message.style.fontFamily = 'Arial, sans-serif';
    message.style.fontSize = '20px';
    message.style.zIndex = '2000';
    
    document.body.appendChild(message);
    
    // Remove after 3 seconds
    setTimeout(() => {
        document.body.removeChild(message);
    }, 3000);
}

/**
 * Joins a game with the specified code
 * @param {string} joinCode - The game code to join
 */
function joinGame(joinCode) {
    // Ensure PeerJS is ready before attempting to connect
    if (!peer || !peer.id) {
        console.error('PeerJS not ready yet. Try again in a moment.');
        setTimeout(() => joinGame(joinCode), 500);
        return;
    }
    
    try {
        // Connect to the other peer
        const conn = peer.connect(joinCode);
        
        // Wait for the connection to open
        conn.on('open', () => {
            console.log('Connected to peer:', joinCode);
            connections.push(conn);
            
            // Send initial player information with name
            conn.send({
                type: 'player_info',
                name: playerName,
                color: playerColor
            });
            
            // Set up data handler
            conn.on('data', (data) => {
                handleIncomingData(conn, data);
            });
            
            // Set up close handler
            conn.on('close', () => {
                handleDisconnection(conn);
            });
            
            // Show success message
            showConnectionSuccessMessage(joinCode);
        });
        
        // Handle connection errors
        conn.on('error', (err) => {
            console.error('Connection error:', err);
            showConnectionErrorMessage();
        });
    } catch (err) {
        console.error('Failed to join game:', err);
        showConnectionErrorMessage();
    }
}

/**
 * Sends this player's position to all connected players
 */
function sendPositionUpdate() {
    if (connections.length === 0) return;
    
    connections.forEach(conn => {
        try {
            conn.send({
                type: 'position',
                x: playerSphere.position.x,
                y: playerSphere.position.y,
                z: playerSphere.position.z,
                rotation: playerSphere.rotation.y,
                color: playerColor,
                name: playerName
            });
        } catch (err) {
            console.error('Failed to send position update:', err);
        }
    });
}