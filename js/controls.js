/**
 * Sets up player controls for mobile and desktop
 */
function setupControls() {
    setupTouchControls();
    setupKeyboardControls();
    setupWindowResize();
}

/**
 * Sets up touch controls for mobile devices
 */
function setupTouchControls() {
    // Movement controls
    document.getElementById('forward').addEventListener('touchstart', () => { playerVelocity.z = -0.1; });
    document.getElementById('forward').addEventListener('touchend', () => { playerVelocity.z = 0; });
    
    document.getElementById('backward').addEventListener('touchstart', () => { playerVelocity.z = 0.1; });
    document.getElementById('backward').addEventListener('touchend', () => { playerVelocity.z = 0; });
    
    document.getElementById('left').addEventListener('touchstart', () => { playerVelocity.x = -0.1; });
    document.getElementById('left').addEventListener('touchend', () => { playerVelocity.x = 0; });
    
    document.getElementById('right').addEventListener('touchstart', () => { playerVelocity.x = 0.1; });
    document.getElementById('right').addEventListener('touchend', () => { playerVelocity.x = 0; });
    
    // Camera rotation
    document.getElementById('camera-left').addEventListener('touchstart', () => { rotateCameraLeft(); });
    document.getElementById('camera-right').addEventListener('touchstart', () => { rotateCameraRight(); });
}

/**
 * Sets up keyboard controls for desktop
 */
function setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
                playerVelocity.z = -0.1;
                break;
            case 'ArrowDown':
            case 's':
                playerVelocity.z = 0.1;
                break;
            case 'ArrowLeft':
            case 'a':
                playerVelocity.x = -0.1;
                break;
            case 'ArrowRight':
            case 'd':
                playerVelocity.x = 0.1;
                break;
            case 'q':
                rotateCameraLeft();
                break;
            case 'e':
                rotateCameraRight();
                break;
        }
    });
    
    window.addEventListener('keyup', (e) => {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'ArrowDown':
            case 's':
                playerVelocity.z = 0;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'ArrowRight':
            case 'd':
                playerVelocity.x = 0;
                break;
        }
    });
}

/**
 * Rotates the camera left by 30 degrees
 */
function rotateCameraLeft() {
    cameraRotation -= Math.PI / 6; // 30 degrees left
    updatePlayerRotation();
}

/**
 * Rotates the camera right by 30 degrees
 */
function rotateCameraRight() {
    cameraRotation += Math.PI / 6; // 30 degrees right
    updatePlayerRotation();
}

/**
 * Updates player rotation to match camera rotation
 */
function updatePlayerRotation() {
    // Only update visual rotation of player model
    // Don't update the actual movement reference frame
    if (playerSphere.children && playerSphere.children.length > 0) {
        // Just rotate the front marker (child objects)
        playerSphere.children.forEach(child => {
            child.rotation.y = -cameraRotation;
        });
    }
}

/**
 * Updates player position based on velocity and camera rotation
 */
function updatePlayerPosition() {
    // Calculate movement direction based on camera rotation
    const movementDirection = {
        x: playerVelocity.x * Math.cos(cameraRotation) - playerVelocity.z * Math.sin(cameraRotation),
        z: playerVelocity.x * Math.sin(cameraRotation) + playerVelocity.z * Math.cos(cameraRotation)
    };
    
    // Normalize movement if moving diagonally
    const moveMagnitude = Math.sqrt(movementDirection.x * movementDirection.x + movementDirection.z * movementDirection.z);
    
    if (moveMagnitude > 0.1) {
        movementDirection.x = (movementDirection.x / moveMagnitude) * 0.1;
        movementDirection.z = (movementDirection.z / moveMagnitude) * 0.1;
    }
    
    // Only rotate the visual representation, not the movement reference
    if (moveMagnitude > 0.001) {
        // Calculate angle to face movement direction
        const movementAngle = Math.atan2(movementDirection.x, movementDirection.z);
        
        // Apply the rotation to child objects instead of entire player
        if (playerSphere.children && playerSphere.children.length > 0) {
            playerSphere.children.forEach(child => {
                // Adjust for camera rotation to maintain visual orientation
                child.rotation.y = movementAngle - cameraRotation;
            });
        }
    }
    
    // Apply movement in small steps to prevent tunneling through walls
    const steps = 3;
    const stepX = movementDirection.x / steps;
    const stepZ = movementDirection.z / steps;
    
    for (let i = 0; i < steps; i++) {
        // Move player
        playerSphere.position.x += stepX;
        playerSphere.position.z += stepZ;
        
        // Check for collisions
        checkCollisions();
    }
    
    // Keep player within bounds
    playerSphere.position.x = Math.max(-50, Math.min(50, playerSphere.position.x));
    playerSphere.position.z = Math.max(-50, Math.min(50, playerSphere.position.z));
    
    // Store position for networking
    playerPosition.x = playerSphere.position.x;
    playerPosition.y = playerSphere.position.y;
    playerPosition.z = playerSphere.position.z;
    
    // Update camera position to follow player
    updateCameraPosition();
}

/**
 * Updates camera position based on player position and rotation
 */
function updateCameraPosition() {
    camera.position.x = playerSphere.position.x + Math.sin(cameraRotation) * cameraDistance;
    camera.position.y = cameraHeight;
    camera.position.z = playerSphere.position.z + Math.cos(cameraRotation) * cameraDistance;
    camera.lookAt(playerSphere.position);
}

/**
 * Handles window resize events
 */
function setupWindowResize() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);
}