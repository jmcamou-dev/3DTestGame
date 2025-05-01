/**
 * Main entry point for game initialization
 */
function init() {
    // Create the game scene and objects
    createScene();
    createPlayer();
    createObstacles();
    createRedBlob();
    
    // Setup controls, joysticks, and networking
    setupControls();
    setupJoysticks(); // Initialize the virtual joysticks
    setupNetworking();
    
    // Start game loop
    animate();
}

/**
 * Main game loop
 */
function animate() {
    requestAnimationFrame(animate);
    
    if (!playerRespawning) {
        // Update player movement - uses the new control system
        updatePlayerMovement();
        
        // Update red blob AI
        updateRedBlob();
        
        // Check for collision with red blob
        checkRedBlobCollision();
        
        // Send position to other players
        sendPositionUpdate();
    } else {
        // Handle respawn countdown
        updateRespawnCountdown();
    }
    
    // Render the scene
    renderer.render(scene, camera);
}

// Start the game when page loads
window.addEventListener('load', init);