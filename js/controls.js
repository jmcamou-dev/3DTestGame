/**
 * Controls module - Handles player movement and camera following player orientation
 */

// Player movement variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let rotateLeft = false;
let rotateRight = false;

// Movement constants
const MOVEMENT_SPEED = 0.1;
const ROTATION_SPEED = 0.03;

/**
 * Sets up all control systems
 */
function setupControls() {
    // Setup keyboard controls for desktop
    setupKeyboardControls();
    
    // Setup window resize handler
    setupWindowResize();
}

/**
 * Sets up keyboard controls for desktop
 */
function setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
                moveForward = true;
                break;
            case 'ArrowDown':
            case 's':
                moveBackward = true;
                break;
            case 'ArrowLeft':
            case 'a':
                moveLeft = true;
                break;
            case 'ArrowRight':
            case 'd':
                moveRight = true;
                break;
            case 'q':
                rotateLeft = true;
                break;
            case 'e':
                rotateRight = true;
                break;
        }
    });
    
    window.addEventListener('keyup', (e) => {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
                moveForward = false;
                break;
            case 'ArrowDown':
            case 's':
                moveBackward = false;
                break;
            case 'ArrowLeft':
            case 'a':
                moveLeft = false;
                break;
            case 'ArrowRight':
            case 'd':
                moveRight = false;
                break;
            case 'q':
                rotateLeft = false;
                break;
            case 'e':
                rotateRight = false;
                break;
        }
    });
}

/**
 * Updates player position and rotation based on controls
 */
function updatePlayerMovement() {
    // Handle rotation
    if (rotateLeft) {
        playerSphere.rotation.y += ROTATION_SPEED;
    }
    if (rotateRight) {
        playerSphere.rotation.y -= ROTATION_SPEED;
    }
    
    // Get current player direction based on its rotation
    const playerDirection = new THREE.Vector3(0, 0, -1);
    playerDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerSphere.rotation.y);
    
    // Get right vector (perpendicular to forward direction)
    const rightVector = new THREE.Vector3(1, 0, 0);
    rightVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerSphere.rotation.y);
    
    // Create movement vector
    const moveVector = new THREE.Vector3(0, 0, 0);
    
    // Add movement components
    if (moveForward) {
        moveVector.add(playerDirection.clone().multiplyScalar(MOVEMENT_SPEED));
    }
    if (moveBackward) {
        moveVector.add(playerDirection.clone().multiplyScalar(-MOVEMENT_SPEED));
    }
    if (moveRight) {
        moveVector.add(rightVector.clone().multiplyScalar(MOVEMENT_SPEED));
    }
    if (moveLeft) {
        moveVector.add(rightVector.clone().multiplyScalar(-MOVEMENT_SPEED));
    }
    
    // Normalize movement if moving diagonally
    if (moveVector.length() > MOVEMENT_SPEED) {
        moveVector.normalize().multiplyScalar(MOVEMENT_SPEED);
    }
    
    // Apply movement in steps to prevent wall clipping
    const steps = 3;
    for (let i = 0; i < steps; i++) {
        playerSphere.position.x += moveVector.x / steps;
        playerSphere.position.z += moveVector.z / steps;
        checkCollisions();
    }
    
    // Keep player within bounds
    playerSphere.position.x = Math.max(-50, Math.min(50, playerSphere.position.x));
    playerSphere.position.z = Math.max(-50, Math.min(50, playerSphere.position.z));
    
    // Update stored position for networking
    playerPosition.x = playerSphere.position.x;
    playerPosition.y = playerSphere.position.y;
    playerPosition.z = playerSphere.position.z;
    
    // Update camera to follow player
    updateCameraToFollowPlayer();
}

/**
 * Updates camera position to follow behind player and look in player's direction
 */
function updateCameraToFollowPlayer() {
    // Distance behind player
    const cameraOffset = 7;
    
    // Camera height (higher to see more of the scene)
    const cameraHeight = 5;
    
    // Calculate position behind player
    const offsetDirection = new THREE.Vector3(0, 0, 1); // Behind player
    offsetDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerSphere.rotation.y);
    
    // Position camera behind player
    camera.position.x = playerSphere.position.x + offsetDirection.x * cameraOffset;
    camera.position.y = playerSphere.position.y + cameraHeight;
    camera.position.z = playerSphere.position.z + offsetDirection.z * cameraOffset;
    
    // Look exactly at the player
    camera.lookAt(
        playerSphere.position.x,
        playerSphere.position.y + 0.5, // Slightly above player's center
        playerSphere.position.z
    );
}

/**
 * Handles window resize events
 */
function setupWindowResize() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update joystick positions on resize
        if (typeof updateJoystickPositions === 'function') {
            updateJoystickPositions();
        }
    }, false);
}