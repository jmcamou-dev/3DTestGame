/**
 * Main entry point for game initialization
 */
function init() {
    // Create the game scene and objects
    createScene();
    createPlayer();
    createObstacles();
    createRedBlob();
    
    // Setup controls and networking
    setupControls();
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
        // Update game state
        updatePlayerPosition();
        updateRedBlob();
        checkRedBlobCollision();
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