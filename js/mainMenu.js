/**
 * Main Menu System for 3D Sphere Game
 */

/**
 * Initializes the main menu
 */
function initMainMenu() {
    // Create main menu overlay
    const menuOverlay = document.createElement('div');
    menuOverlay.id = 'main-menu-overlay';
    menuOverlay.style.position = 'fixed';
    menuOverlay.style.top = '0';
    menuOverlay.style.left = '0';
    menuOverlay.style.width = '100%';
    menuOverlay.style.height = '100%';
    menuOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    menuOverlay.style.display = 'flex';
    menuOverlay.style.flexDirection = 'column';
    menuOverlay.style.justifyContent = 'center';
    menuOverlay.style.alignItems = 'center';
    menuOverlay.style.zIndex = '3000';
    
    // Game title
    const title = document.createElement('h1');
    title.textContent = '3D Sphere Game';
    title.style.color = '#ffffff';
    title.style.fontFamily = 'Arial, sans-serif';
    title.style.fontSize = '48px';
    title.style.marginBottom = '30px';
    title.style.textShadow = '0 0 10px #00a2ff';
    
    // Create menu container
    const menuContainer = document.createElement('div');
    menuContainer.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
    menuContainer.style.padding = '30px';
    menuContainer.style.borderRadius = '10px';
    menuContainer.style.width = '400px';
    menuContainer.style.maxWidth = '90%';
    
    // Player name input
    const nameLabel = document.createElement('div');
    nameLabel.textContent = 'Your Name:';
    nameLabel.style.color = 'white';
    nameLabel.style.fontFamily = 'Arial, sans-serif';
    nameLabel.style.marginBottom = '10px';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'player-name-input';
    nameInput.placeholder = 'Enter your name';
    nameInput.value = 'Player';
    nameInput.style.width = '100%';
    nameInput.style.padding = '10px';
    nameInput.style.marginBottom = '20px';
    nameInput.style.borderRadius = '5px';
    nameInput.style.border = 'none';
    nameInput.style.fontSize = '16px';
    
    // Host Game button
    const hostButton = document.createElement('button');
    hostButton.textContent = 'Host Game';
    hostButton.style.width = '100%';
    hostButton.style.padding = '15px';
    hostButton.style.marginBottom = '10px';
    hostButton.style.backgroundColor = '#4CAF50';
    hostButton.style.color = 'white';
    hostButton.style.border = 'none';
    hostButton.style.borderRadius = '5px';
    hostButton.style.fontSize = '16px';
    hostButton.style.cursor = 'pointer';
    
    // Join Game button that opens code input
    const joinButton = document.createElement('button');
    joinButton.textContent = 'Join Game';
    joinButton.style.width = '100%';
    joinButton.style.padding = '15px';
    joinButton.style.marginBottom = '20px';
    joinButton.style.backgroundColor = '#2196F3';
    joinButton.style.color = 'white';
    joinButton.style.border = 'none';
    joinButton.style.borderRadius = '5px';
    joinButton.style.fontSize = '16px';
    joinButton.style.cursor = 'pointer';
    
    // Join code input (hidden initially)
    const codeContainer = document.createElement('div');
    codeContainer.id = 'join-code-container';
    codeContainer.style.display = 'none';
    codeContainer.style.marginBottom = '20px';
    
    const codeLabel = document.createElement('div');
    codeLabel.textContent = 'Enter Game Code:';
    codeLabel.style.color = 'white';
    codeLabel.style.fontFamily = 'Arial, sans-serif';
    codeLabel.style.marginBottom = '10px';
    
    const codeInput = document.createElement('input');
    codeInput.type = 'text';
    codeInput.id = 'game-code-input';
    codeInput.placeholder = 'e.g. 123';
    codeInput.style.width = '100%';
    codeInput.style.padding = '10px';
    codeInput.style.marginBottom = '10px';
    codeInput.style.borderRadius = '5px';
    codeInput.style.border = 'none';
    codeInput.style.fontSize = '16px';
    
    const joinConfirmButton = document.createElement('button');
    joinConfirmButton.textContent = 'Connect';
    joinConfirmButton.style.width = '100%';
    joinConfirmButton.style.padding = '10px';
    joinConfirmButton.style.backgroundColor = '#FFC107';
    joinConfirmButton.style.color = 'black';
    joinConfirmButton.style.border = 'none';
    joinConfirmButton.style.borderRadius = '5px';
    joinConfirmButton.style.fontSize = '16px';
    joinConfirmButton.style.cursor = 'pointer';
    
    const cancelJoinButton = document.createElement('button');
    cancelJoinButton.textContent = 'Cancel';
    cancelJoinButton.style.width = '100%';
    cancelJoinButton.style.padding = '10px';
    cancelJoinButton.style.marginTop = '10px';
    cancelJoinButton.style.backgroundColor = '#f44336';
    cancelJoinButton.style.color = 'white';
    cancelJoinButton.style.border = 'none';
    cancelJoinButton.style.borderRadius = '5px';
    cancelJoinButton.style.fontSize = '16px';
    cancelJoinButton.style.cursor = 'pointer';
    
    // High scores button
    const highScoresButton = document.createElement('button');
    highScoresButton.textContent = 'High Scores';
    highScoresButton.style.width = '100%';
    highScoresButton.style.padding = '15px';
    highScoresButton.style.marginBottom = '10px';
    highScoresButton.style.backgroundColor = '#9C27B0';
    highScoresButton.style.color = 'white';
    highScoresButton.style.border = 'none';
    highScoresButton.style.borderRadius = '5px';
    highScoresButton.style.fontSize = '16px';
    highScoresButton.style.cursor = 'pointer';
    
    // Help button
    const helpButton = document.createElement('button');
    helpButton.textContent = 'Help';
    helpButton.style.width = '100%';
    helpButton.style.padding = '15px';
    helpButton.style.backgroundColor = '#FF9800';
    helpButton.style.color = 'white';
    helpButton.style.border = 'none';
    helpButton.style.borderRadius = '5px';
    helpButton.style.fontSize = '16px';
    helpButton.style.cursor = 'pointer';
    
    // Assemble join code container
    codeContainer.appendChild(codeLabel);
    codeContainer.appendChild(codeInput);
    codeContainer.appendChild(joinConfirmButton);
    codeContainer.appendChild(cancelJoinButton);
    
    // Assemble menu
    menuContainer.appendChild(nameLabel);
    menuContainer.appendChild(nameInput);
    menuContainer.appendChild(hostButton);
    menuContainer.appendChild(joinButton);
    menuContainer.appendChild(codeContainer);
    menuContainer.appendChild(highScoresButton);
    menuContainer.appendChild(helpButton);
    
    menuOverlay.appendChild(title);
    menuOverlay.appendChild(menuContainer);
    
    document.body.appendChild(menuOverlay);
    
    // Focus the name input
    nameInput.focus();
    
    // Add event listeners
    hostButton.addEventListener('click', () => {
        playerName = nameInput.value.trim() || "Player";
        startHostGame();
        document.body.removeChild(menuOverlay);
    });
    
    joinButton.addEventListener('click', () => {
        codeContainer.style.display = 'block';
        joinButton.style.display = 'none';
        hostButton.style.display = 'none';
        highScoresButton.style.display = 'none';
        helpButton.style.display = 'none';
    });
    
    joinConfirmButton.addEventListener('click', () => {
        const code = codeInput.value.trim();
        if (code) {
            playerName = nameInput.value.trim() || "Player";
            startJoinGame(code);
            document.body.removeChild(menuOverlay);
        } else {
            alert('Please enter a valid game code');
        }
    });
    
    cancelJoinButton.addEventListener('click', () => {
        codeContainer.style.display = 'none';
        joinButton.style.display = 'block';
        hostButton.style.display = 'block';
        highScoresButton.style.display = 'block';
        helpButton.style.display = 'block';
    });
    
    highScoresButton.addEventListener('click', () => {
        playerName = nameInput.value.trim() || "Player";
        showHighScores();
    });
    
    helpButton.addEventListener('click', () => {
        showHelp();
    });
}

/**
 * Starts the game as a host
 */
function startHostGame() {
    // Initialize networking with hosting enabled
    gameMode = 'host';
    setupNetworking();
    
    // Show waiting room instead of starting game immediately
    createWaitingRoomUI();
}


/**
 * Starts the game joining another player
 * @param {string} code - Game code to join
 */
function startJoinGame(code) {
    // Set the code to join
    gameCodeToJoin = code;
    
    // Initialize game in join mode
    gameMode = 'join';
    setupNetworking();
    
    // Show waiting room UI (without start button)
    createWaitingRoomUI();
}