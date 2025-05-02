/**
 * Enhanced main.js with all new features integrated
 * Replace the original main.js with this file
 */

// Game pause state
let gamePaused = false;

/**
 * Main entry point for game initialization
 */
function init() {
    // Create the game scene and objects
    createScene();
    createPlayer();
    createObstacles();
    createRedBlob();
    
    // Setup visual effects
    setupPostProcessing();
    initVisualEffects();
    
    // Initialize mini-map
    initMinimap();
    
    // Start power-up system
    startPowerUpSpawning();
    
    // Initialize high score system
    initHighScores();
    
    // Setup controls, joysticks, and networking
    setupControls();
    setupJoysticks(); // Initialize the virtual joysticks
    setupNetworking();
    
    // Create pause button
    createPauseButton();
    
    // Create help button
    createHelpButton();
    
    // Start game loop
    animate();
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
        
        // Update minimap
        updateMinimap();
        
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
 * Shows the pause screen
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
        resumeButton.style.marginBottom = '15px';
        
        resumeButton.addEventListener('click', togglePause);
        
        // Add high scores button
        const highScoresButton = document.createElement('button');
        highScoresButton.textContent = 'High Scores';
        highScoresButton.style.padding = '10px 20px';
        highScoresButton.style.fontSize = '16px';
        highScoresButton.style.backgroundColor = '#2196F3';
        highScoresButton.style.color = 'white';
        highScoresButton.style.border = 'none';
        highScoresButton.style.borderRadius = '5px';
        highScoresButton.style.cursor = 'pointer';
        highScoresButton.style.marginBottom = '15px';
        
        highScoresButton.addEventListener('click', showHighScores);
        
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
        
        // Add all elements to the overlay
        pauseOverlay.appendChild(pauseText);
        pauseOverlay.appendChild(resumeButton);
        pauseOverlay.appendChild(highScoresButton);
        pauseOverlay.appendChild(helpButton);
        
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
    // Check for high score
    if (isHighScore()) {
        promptForHighScore();
    }
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

// Start the game when page loads
window.addEventListener('load', init);