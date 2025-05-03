/**
 * Enhanced main.js with all new features integrated
 * Replace the original main.js with this file
 */

/**
 * Main entry point for game initialization
 */
function init() {
    // Create the game scene and objects
    createScene();
    createPlayer();
    createObstacles();
    createRedBlob();
    
    // Initialize sound system - add this line
    initSoundSystem();
    
    // Setup visual effects
    setupPostProcessing();
    initVisualEffects();
    
    // Initialize mini-map (initially hidden)
    initMinimap();
    
    // Start power-up system
    startPowerUpSpawning();
    
    // Setup controls, joysticks (initially hidden), and networking
    setupControls();
    setupJoysticks();
    setupNetworking();
    
    // Hide joysticks initially but create the toggle
    toggleJoysticks();
    
    // Add in-game menu
    createInGameMenu();
    
    // Start background music - add this line
    //playBackgroundMusic();
    
    // Start game loop
    animate();
    
    // Game is now started
    gameStarted = true;
}
/**
 * Main game loop
 */
function animate() {
    requestAnimationFrame(animate);
    
    // Skip updates if game is paused
    if (gamePaused) {
        // Still render the scene
        renderer.render(scene, camera);
        return;
    }
    
    if (!playerRespawning) {
        // Update player movement - uses the new control system
        updatePlayerMovement();
        
        // Update red blob AI
        updateRedBlob();
        
        // Update power-ups
        updatePowerUps();
        
        // Update visual effects
        updateVisualEffects();
        
        // Only update minimap if visible
        if (minimapVisible) {
            updateMinimap();
        }
        
        // Play footstep sounds - add this line
        playFootstepSounds();
        
        // Update spatial sounds - add this line
        updateSpatialSounds();
        
        // Check for collision with red blob (only if not invincible)
        if (!playerIsInvincible) {
            checkRedBlobCollision();
        }
        
        // Send position to other players
        sendPositionUpdate();
    } else {
        // Handle respawn countdown
        updateRespawnCountdown();
    }
    
    // Render the scene
    renderer.render(scene, camera);
}

/**
 * Toggles the in-game menu
 */
function toggleGameMenu() {
    // Check if menu already exists
    let gameMenu = document.getElementById('game-menu');
    
    if (gameMenu) {
        // Remove menu if it exists
        document.body.removeChild(gameMenu);
    } else {
        // Create menu
        gameMenu = document.createElement('div');
        gameMenu.id = 'game-menu';
        gameMenu.style.position = 'absolute';
        gameMenu.style.top = '50px';
        gameMenu.style.left = '10px';
        gameMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gameMenu.style.padding = '10px';
        gameMenu.style.borderRadius = '5px';
        gameMenu.style.zIndex = '1500';
        gameMenu.style.display = 'flex';
        gameMenu.style.flexDirection = 'column';
        gameMenu.style.gap = '5px';
        
        // Pause button
        const pauseButton = document.createElement('button');
        pauseButton.textContent = 'Pause Game';
        pauseButton.style.padding = '8px 15px';
        pauseButton.style.margin = '2px 0';
        pauseButton.style.borderRadius = '3px';
        pauseButton.style.border = 'none';
        pauseButton.style.cursor = 'pointer';
        pauseButton.style.backgroundColor = '#4CAF50';
        pauseButton.style.color = 'white';
        
        pauseButton.addEventListener('click', () => {
            togglePause();
            document.body.removeChild(gameMenu);
        });
        
        // High scores button
        // const highScoresButton = document.createElement('button');
        // highScoresButton.textContent = 'High Scores';
        // highScoresButton.style.padding = '8px 15px';
        // highScoresButton.style.margin = '2px 0';
        // highScoresButton.style.borderRadius = '3px';
        // highScoresButton.style.border = 'none';
        // highScoresButton.style.cursor = 'pointer';
        // highScoresButton.style.backgroundColor = '#9C27B0';
        // highScoresButton.style.color = 'white';
        
        // highScoresButton.addEventListener('click', () => {
        //     showHighScores();
        //     document.body.removeChild(gameMenu);
        // });
        
        // Show/hide joysticks button
        const joysticksButton = document.createElement('button');
        joysticksButton.textContent = joysticksVisible ? 'Hide Joysticks' : 'Show Joysticks';
        joysticksButton.style.padding = '8px 15px';
        joysticksButton.style.margin = '2px 0';
        joysticksButton.style.borderRadius = '3px';
        joysticksButton.style.border = 'none';
        joysticksButton.style.cursor = 'pointer';
        joysticksButton.style.backgroundColor = '#2196F3';
        joysticksButton.style.color = 'white';
        
        joysticksButton.addEventListener('click', () => {
            toggleJoysticks();
            document.body.removeChild(gameMenu);
        });
        
        // Help button
        const helpButton = document.createElement('button');
        helpButton.textContent = 'Help';
        helpButton.style.padding = '8px 15px';
        helpButton.style.margin = '2px 0';
        helpButton.style.borderRadius = '3px';
        helpButton.style.border = 'none';
        helpButton.style.cursor = 'pointer';
        helpButton.style.backgroundColor = '#FF9800';
        helpButton.style.color = 'white';
        
        helpButton.addEventListener('click', () => {
            showHelp();
            document.body.removeChild(gameMenu);
        });
        
        // Show/hide minimap button
        const minimapButton = document.createElement('button');
        minimapButton.textContent = minimapVisible ? 'Hide Map' : 'Show Map';
        minimapButton.style.padding = '8px 15px';
        minimapButton.style.margin = '2px 0';
        minimapButton.style.borderRadius = '3px';
        minimapButton.style.border = 'none';
        minimapButton.style.cursor = 'pointer';
        minimapButton.style.backgroundColor = '#607D8B';
        minimapButton.style.color = 'white';
        
        minimapButton.addEventListener('click', () => {
            minimapVisible = !minimapVisible;
            minimapCanvas.style.display = minimapVisible ? 'block' : 'none';
            document.getElementById('minimap-toggle').textContent = minimapVisible ? 'Hide Map' : 'Show Map';
            document.body.removeChild(gameMenu);
        });
        
        // Exit game button
        const exitButton = document.createElement('button');
        exitButton.textContent = 'Exit Game';
        exitButton.style.padding = '8px 15px';
        exitButton.style.margin = '2px 0';
        exitButton.style.borderRadius = '3px';
        exitButton.style.border = 'none';
        exitButton.style.cursor = 'pointer';
        exitButton.style.backgroundColor = '#f44336';
        exitButton.style.color = 'white';
        
        exitButton.addEventListener('click', () => {
            confirmExitGame();
            document.body.removeChild(gameMenu);
        });
        
        // Add buttons to menu
        gameMenu.appendChild(pauseButton);
        // gameMenu.appendChild(highScoresButton);
        gameMenu.appendChild(joysticksButton);
        gameMenu.appendChild(minimapButton);
        gameMenu.appendChild(helpButton);
        gameMenu.appendChild(exitButton);
        
        // Add menu to document
        document.body.appendChild(gameMenu);
    }
}
/**
 * Confirms if the player wants to exit the game
 */
function confirmExitGame() {
    // Create confirmation dialog
    const dialog = document.createElement('div');
    dialog.style.position = 'fixed';
    dialog.style.top = '0';
    dialog.style.left = '0';
    dialog.style.width = '100%';
    dialog.style.height = '100%';
    dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    dialog.style.display = 'flex';
    dialog.style.justifyContent = 'center';
    dialog.style.alignItems = 'center';
    dialog.style.zIndex = '3000';
    
    // Create dialog content
    const content = document.createElement('div');
    content.style.backgroundColor = '#333';
    content.style.padding = '20px';
    content.style.borderRadius = '10px';
    content.style.maxWidth = '400px';
    content.style.textAlign = 'center';
    
    // Add message
    const message = document.createElement('p');
    message.textContent = 'Are you sure you want to exit the game?';
    message.style.color = 'white';
    message.style.fontFamily = 'Arial, sans-serif';
    message.style.fontSize = '18px';
    message.style.marginBottom = '20px';
    
    // Add score info
    const scoreInfo = document.createElement('p');
    scoreInfo.textContent = `Your current score: ${score}`;
    scoreInfo.style.color = '#4CAF50';
    scoreInfo.style.fontFamily = 'Arial, sans-serif';
    scoreInfo.style.fontSize = '16px';
    scoreInfo.style.marginBottom = '30px';
    
    // Create buttons container
    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.justifyContent = 'space-around';
    
    // Yes button
    const yesButton = document.createElement('button');
    yesButton.textContent = 'Yes, Exit';
    yesButton.style.padding = '10px 20px';
    yesButton.style.backgroundColor = '#f44336';
    yesButton.style.color = 'white';
    yesButton.style.border = 'none';
    yesButton.style.borderRadius = '5px';
    yesButton.style.cursor = 'pointer';
    
    yesButton.addEventListener('click', () => {
        // // Check for high score before exiting
        // if (isHighScore()) {
        //     document.body.removeChild(dialog);
        //     promptForHighScore();
        //     setTimeout(() => {
        //         // Return to main menu
        //         location.reload();
        //     }, 3000);
        // } else {
            // Just exit to main menu
            location.reload();
        // }
    });
    
    // No button
    const noButton = document.createElement('button');
    noButton.textContent = 'No, Continue';
    noButton.style.padding = '10px 20px';
    noButton.style.backgroundColor = '#4CAF50';
    noButton.style.color = 'white';
    noButton.style.border = 'none';
    noButton.style.borderRadius = '5px';
    noButton.style.cursor = 'pointer';
    
    noButton.addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
    
    // Assemble dialog
    buttons.appendChild(noButton);
    buttons.appendChild(yesButton);
    
    content.appendChild(message);
    content.appendChild(scoreInfo);
    content.appendChild(buttons);
    
    dialog.appendChild(content);
    document.body.appendChild(dialog);
}

/**
 * Creates an in-game menu that includes buttons for high scores and joystick toggle
 */
function createInGameMenu() {
    // Create menu button
    const menuButton = document.createElement('div');
    menuButton.id = 'menu-button';
    menuButton.textContent = 'Menu';
    menuButton.style.position = 'absolute';
    menuButton.style.top = '10px';
    menuButton.style.left = '100px';
    menuButton.style.background = 'rgba(0,0,0,0.5)';
    menuButton.style.color = 'white';
    menuButton.style.padding = '10px';
    menuButton.style.borderRadius = '5px';
    menuButton.style.fontFamily = 'Arial, sans-serif';
    menuButton.style.cursor = 'pointer';
    menuButton.style.zIndex = '1000';
    
    // Add event listener
    menuButton.addEventListener('click', toggleGameMenu);
    
    document.body.appendChild(menuButton);
}

/**
 * Pauses or unpauses the game
 */
function togglePause() {
    gamePaused = !gamePaused;
    
    // Update pause button text
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.textContent = gamePaused ? 'Resume Game' : 'Pause Game';
    }
    
    // Show pause screen
    if (gamePaused) {
        showPauseScreen();
    } else {
        hidePauseScreen();
    }
}

/**
 * Creates a pause button
 */
function createPauseButton() {
    const pauseButton = document.createElement('div');
    pauseButton.id = 'pause-button';
    pauseButton.textContent = 'Pause Game';
    pauseButton.style.position = 'absolute';
    pauseButton.style.top = '50px';
    pauseButton.style.left = '10px';
    pauseButton.style.background = 'rgba(0,0,0,0.5)';
    pauseButton.style.color = 'white';
    pauseButton.style.padding = '10px';
    pauseButton.style.borderRadius = '5px';
    pauseButton.style.fontFamily = 'Arial, sans-serif';
    pauseButton.style.cursor = 'pointer';
    pauseButton.style.zIndex = '1000';
    
    pauseButton.addEventListener('click', togglePause);
    document.body.appendChild(pauseButton);
    
    // Also trigger pause on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            togglePause();
        }
    });
}
/**
 * Shows the pause screen with menu options
 */
function showPauseScreen() {
    // Create pause overlay if it doesn't exist
    let pauseOverlay = document.getElementById('pause-overlay');
    
    if (!pauseOverlay) {
        pauseOverlay = document.createElement('div');
        pauseOverlay.id = 'pause-overlay';
        pauseOverlay.style.position = 'absolute';
        pauseOverlay.style.top = '0';
        pauseOverlay.style.left = '0';
        pauseOverlay.style.width = '100%';
        pauseOverlay.style.height = '100%';
        pauseOverlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
        pauseOverlay.style.display = 'flex';
        pauseOverlay.style.flexDirection = 'column';
        pauseOverlay.style.justifyContent = 'center';
        pauseOverlay.style.alignItems = 'center';
        pauseOverlay.style.zIndex = '1500';
        
        // Add pause text
        const pauseText = document.createElement('h1');
        pauseText.textContent = 'GAME PAUSED';
        pauseText.style.color = 'white';
        pauseText.style.fontFamily = 'Arial, sans-serif';
        pauseText.style.marginBottom = '20px';
        
        // Create button container for better layout
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexDirection = 'column';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.minWidth = '200px';
        
        // Add resume button
        const resumeButton = document.createElement('button');
        resumeButton.textContent = 'Resume Game';
        resumeButton.style.padding = '15px 30px';
        resumeButton.style.fontSize = '18px';
        resumeButton.style.backgroundColor = '#4CAF50';
        resumeButton.style.color = 'white';
        resumeButton.style.border = 'none';
        resumeButton.style.borderRadius = '5px';
        resumeButton.style.cursor = 'pointer';
        
        resumeButton.addEventListener('click', togglePause);
        
        // // Add high scores button
        // const highScoresButton = document.createElement('button');
        // highScoresButton.textContent = 'High Scores';
        // highScoresButton.style.padding = '10px 20px';
        // highScoresButton.style.fontSize = '16px';
        // highScoresButton.style.backgroundColor = '#9C27B0';
        // highScoresButton.style.color = 'white';
        // highScoresButton.style.border = 'none';
        // highScoresButton.style.borderRadius = '5px';
        // highScoresButton.style.cursor = 'pointer';
        
        // highScoresButton.addEventListener('click', showHighScores);
        
        // Add toggle joysticks button
        const joysticksButton = document.createElement('button');
        joysticksButton.textContent = joysticksVisible ? 'Hide Joysticks' : 'Show Joysticks';
        joysticksButton.style.padding = '10px 20px';
        joysticksButton.style.fontSize = '16px';
        joysticksButton.style.backgroundColor = '#2196F3';
        joysticksButton.style.color = 'white';
        joysticksButton.style.border = 'none';
        joysticksButton.style.borderRadius = '5px';
        joysticksButton.style.cursor = 'pointer';
        
        joysticksButton.addEventListener('click', () => {
            toggleJoysticks();
            joysticksButton.textContent = joysticksVisible ? 'Hide Joysticks' : 'Show Joysticks';
        });
        
        // Add toggle minimap button
        const minimapButton = document.createElement('button');
        minimapButton.textContent = minimapVisible ? 'Hide Map' : 'Show Map';
        minimapButton.style.padding = '10px 20px';
        minimapButton.style.fontSize = '16px';
        minimapButton.style.backgroundColor = '#607D8B';
        minimapButton.style.color = 'white';
        minimapButton.style.border = 'none';
        minimapButton.style.borderRadius = '5px';
        minimapButton.style.cursor = 'pointer';
        
        minimapButton.addEventListener('click', () => {
            minimapVisible = !minimapVisible;
            minimapCanvas.style.display = minimapVisible ? 'block' : 'none';
            document.getElementById('minimap-toggle').textContent = minimapVisible ? 'Hide Map' : 'Show Map';
            minimapButton.textContent = minimapVisible ? 'Hide Map' : 'Show Map';
        });
        
        // Add help button
        const helpButton = document.createElement('button');
        helpButton.textContent = 'Help';
        helpButton.style.padding = '10px 20px';
        helpButton.style.fontSize = '16px';
        helpButton.style.backgroundColor = '#FFC107';
        helpButton.style.color = 'white';
        helpButton.style.border = 'none';
        helpButton.style.borderRadius = '5px';
        helpButton.style.cursor = 'pointer';
        
        helpButton.addEventListener('click', showHelp);
        
        // Add exit button
        const exitButton = document.createElement('button');
        exitButton.textContent = 'Exit Game';
        exitButton.style.padding = '10px 20px';
        exitButton.style.fontSize = '16px';
        exitButton.style.backgroundColor = '#f44336';
        exitButton.style.color = 'white';
        exitButton.style.border = 'none';
        exitButton.style.borderRadius = '5px';
        exitButton.style.cursor = 'pointer';
        
        exitButton.addEventListener('click', () => {
            togglePause(); // Unpause first
            confirmExitGame();
        });
        
        // Add all buttons to container
        buttonContainer.appendChild(resumeButton);
        // buttonContainer.appendChild(highScoresButton);
        buttonContainer.appendChild(joysticksButton);
        buttonContainer.appendChild(minimapButton);
        buttonContainer.appendChild(helpButton);
        buttonContainer.appendChild(exitButton);
        
        // Add elements to overlay
        pauseOverlay.appendChild(pauseText);
        pauseOverlay.appendChild(buttonContainer);
        
        // Add to document
        document.body.appendChild(pauseOverlay);
    } else {
        pauseOverlay.style.display = 'flex';
    }
}

/**
 * Hides the pause screen
 */
function hidePauseScreen() {
    const pauseOverlay = document.getElementById('pause-overlay');
    if (pauseOverlay) {
        pauseOverlay.style.display = 'none';
    }
}

/**
 * Creates a help button
 */
function createHelpButton() {
    const helpButton = document.createElement('div');
    helpButton.id = 'help-button';
    helpButton.textContent = 'Help';
    helpButton.style.position = 'absolute';
    helpButton.style.top = '90px';
    helpButton.style.left = '10px';
    helpButton.style.background = 'rgba(0,0,0,0.5)';
    helpButton.style.color = 'white';
    helpButton.style.padding = '10px';
    helpButton.style.borderRadius = '5px';
    helpButton.style.fontFamily = 'Arial, sans-serif';
    helpButton.style.cursor = 'pointer';
    helpButton.style.zIndex = '1000';
    
    helpButton.addEventListener('click', showHelp);
    document.body.appendChild(helpButton);
}

/**
 * Shows the help screen
 */
function showHelp() {
    // Create help overlay
    const helpOverlay = document.createElement('div');
    helpOverlay.id = 'help-overlay';
    helpOverlay.style.position = 'absolute';
    helpOverlay.style.top = '0';
    helpOverlay.style.left = '0';
    helpOverlay.style.width = '100%';
    helpOverlay.style.height = '100%';
    helpOverlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
    helpOverlay.style.display = 'flex';
    helpOverlay.style.justifyContent = 'center';
    helpOverlay.style.alignItems = 'center';
    helpOverlay.style.zIndex = '2000';
    
    // Create help panel
    const helpPanel = document.createElement('div');
    helpPanel.style.width = '500px';
    helpPanel.style.maxWidth = '90%';
    helpPanel.style.backgroundColor = '#333';
    helpPanel.style.padding = '20px';
    helpPanel.style.borderRadius = '10px';
    helpPanel.style.color = 'white';
    helpPanel.style.fontFamily = 'Arial, sans-serif';
    
    // Create help content
    const helpContent = document.createElement('div');
    helpContent.innerHTML = `
        <h2 style="color: #FFC107; text-align: center;">Game Help</h2>
        
        <h3 style="color: #4CAF50;">Controls:</h3>
        <p>- <strong>WASD or Arrow Keys</strong>: Move player</p>
        <p>- <strong>Q/E</strong>: Rotate left/right</p>
        <p>- <strong>Escape</strong>: Pause game</p>
        <p>- <strong>Mobile</strong>: Use on-screen joysticks</p>
        
        <h3 style="color: #4CAF50;">Objectives:</h3>
        <p>- Collect yellow spheres for 10 points each</p>
        <p>- Collect power-ups for special abilities and 25 points</p>
        <p>- Avoid the red blob enemy</p>
        
        <h3 style="color: #4CAF50;">Power-Ups:</h3>
        <p>- <span style="color: cyan;">SPEED</span>: Move faster</p>
        <p>- <span style="color: magenta;">INVINCIBLE</span>: Immunity to red blob</p>
        <p>- <span style="color: #aaa;">GHOST</span>: Pass through walls</p>
        
        <h3 style="color: #4CAF50;">Multiplayer:</h3>
        <p>- See your Game Code in the top-right corner</p>
        <p>- Click "Join Game" to enter another player's code</p>
    `;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.display = 'block';
    closeButton.style.margin = '20px auto 0';
    closeButton.style.padding = '10px 20px';
    closeButton.style.backgroundColor = '#4CAF50';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    
    closeButton.addEventListener('click', () => {
        document.body.removeChild(helpOverlay);
    });
    
    // Add elements to panel
    helpPanel.appendChild(helpContent);
    helpPanel.appendChild(closeButton);
    helpOverlay.appendChild(helpPanel);
    
    // Add to document
    document.body.appendChild(helpOverlay);
}

/**
 * Called when player dies (caught by red blob) to check high score
 */
function handlePlayerDeath() {
    // // Check for high score
    // if (isHighScore()) {
    //     promptForHighScore();
    // }
}

// Override respawn function to check for high score
const originalRespawnPlayer = respawnPlayer;
respawnPlayer = function() {
    // Check high score before respawning
    handlePlayerDeath();
    
    // Call original function
    originalRespawnPlayer();
};

// Make sure Ghost power-up is handled in collision detection
const originalCheckWallCollision = checkWallCollision;
checkWallCollision = function(wall, wallCollisions) {
    // Skip collision if player has Ghost power-up
    if (playerIsGhost) {
        return;
    }
    
    // Call original function
    originalCheckWallCollision(wall, wallCollisions);
};

// Override collectible collection to add particles
const originalCheckCollectibleCollision = checkCollectibleCollision;
checkCollectibleCollision = function(collectible, index) {
    const wasCollected = originalCheckCollectibleCollision(collectible, index);
    
    if (wasCollected) {
        // Create particle effect at collection point
        createCollectionParticles(collectible.position.clone(), 0xffff00);
    }
    
    return wasCollected;
};

// Initialize the main menu when page loads
window.addEventListener('load', initMainMenu);

// Game starts from menu, not automatically
// The original init call has been moved to the main menu options