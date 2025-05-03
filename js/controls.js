/**
 * Controls module - Handles player movement and camera following player orientation
 */


function setupMouseControls() {
    // Track if the mouse button is pressed
    let isMouseDown = false;
    
    // Last mouse position
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    // Mouse sensitivity
    const MOUSE_SENSITIVITY = 0.003;
    
    // Mouse down event
    document.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Left mouse button
            isMouseDown = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }
    });
    
    // Mouse up event
    document.addEventListener('mouseup', (e) => {
        if (e.button === 0) { // Left mouse button
            isMouseDown = false;
        }
    });
    
    // Mouse move event
    document.addEventListener('mousemove', (e) => {
        if (isMouseDown && mouseControlEnabled) {
            // Calculate mouse movement
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            
            // Update camera rotation
            cameraYaw -= deltaX * MOUSE_SENSITIVITY;
            cameraPitch -= deltaY * MOUSE_SENSITIVITY;
            
            // Clamp pitch to prevent flipping
            cameraPitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, cameraPitch));
            
            // Update last position
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }
    });
    
    // Add key to toggle mouse control
    window.addEventListener('keydown', (e) => {
        if (e.key === 'm' || e.key === 'M') {
            mouseControlEnabled = !mouseControlEnabled;
            // Show toggle notification
            showNotification(`Mouse control ${mouseControlEnabled ? 'enabled' : 'disabled'}`);
        }
    });
    
    // Lock pointer for better mouse control
    const canvas = renderer.domElement;
    canvas.addEventListener('click', () => {
        if (mouseControlEnabled && document.pointerLockElement !== canvas) {
            canvas.requestPointerLock();
        }
    });
    
    // Handle pointer lock change
    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            // Pointer is locked, set up mousemove differently
            document.addEventListener('mousemove', handleMouseMoveLocked);
            document.removeEventListener('mousemove', handleMouseMoveUnlocked);
        } else {
            // Pointer is unlocked
            document.removeEventListener('mousemove', handleMouseMoveLocked);
            document.addEventListener('mousemove', handleMouseMoveUnlocked);
        }
    });
    
    // Handle mouse movement when pointer is locked
    function handleMouseMoveLocked(e) {
        if (mouseControlEnabled) {
            // Use movement directly since pointer is locked
            cameraYaw -= e.movementX * MOUSE_SENSITIVITY;
            cameraPitch -= e.movementY * MOUSE_SENSITIVITY;
            
            // Clamp pitch to prevent flipping
            cameraPitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, cameraPitch));
        }
    }
    
    // Handle mouse movement when pointer is not locked
    function handleMouseMoveUnlocked(e) {
        if (isMouseDown && mouseControlEnabled) {
            // Calculate mouse movement
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            
            // Update camera rotation
            cameraYaw -= deltaX * MOUSE_SENSITIVITY;
            cameraPitch -= deltaY * MOUSE_SENSITIVITY;
            
            // Clamp pitch to prevent flipping
            cameraPitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, cameraPitch));
            
            // Update last position
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }
    }
}
/**
 * Sets up all control systems
 */
function setupControls() {
    // Setup keyboard controls for desktop
    setupKeyboardControls();
    
    // Setup mouse controls
    setupMouseControls();

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
            case 'Control':
                if (!minimapVisible){
                    minimapVisible = !minimapVisible;
                    minimapCanvas.style.display = minimapVisible ? 'block' : 'none';
                }
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
            case 'Control':
                if (minimapVisible){
                    minimapVisible = !minimapVisible;
                    minimapCanvas.style.display = minimapVisible ? 'block' : 'none';
                }
                break;
        }
    });
}

/**
 * Updates player position and rotation based on controls
 */
function updatePlayerMovement() {
    // For rotation control, we still use the original rotation controls
    if (rotateLeft) {
        playerSphere.rotation.y += ROTATION_SPEED;
    }
    if (rotateRight) {
        playerSphere.rotation.y -= ROTATION_SPEED;
    }
    
    // Get camera direction (ignoring pitch)
    const cameraDirection = new THREE.Vector3(0, 0, -1);
    cameraDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
    cameraDirection.y = 0; // Ignore vertical component
    cameraDirection.normalize();
    
    // Get right vector (perpendicular to camera direction)
    const rightVector = new THREE.Vector3(1, 0, 0);
    rightVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
    
    // Create movement vector
    const moveVector = new THREE.Vector3(0, 0, 0);
    
    // Add movement components based on camera direction
    if (moveForward) {
        moveVector.add(cameraDirection.clone().multiplyScalar(-MOVEMENT_SPEED));
    }
    if (moveBackward) {
        moveVector.add(cameraDirection.clone().multiplyScalar(MOVEMENT_SPEED));
    }
    if (moveRight) {
        moveVector.add(rightVector.clone().multiplyScalar(-MOVEMENT_SPEED));
    }
    if (moveLeft) {
        moveVector.add(rightVector.clone().multiplyScalar(MOVEMENT_SPEED));
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
    
    // Make player face the movement direction if moving
    if (moveVector.length() > 0) {
        const targetRotation = Math.atan2(moveVector.x, moveVector.z);
        // Smoothly interpolate to target rotation
        const rotationDiff = targetRotation - playerSphere.rotation.y;
        
        // Handle angle wrapping
        let shortestRotation = ((rotationDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
        
        // Apply rotation gradually
        playerSphere.rotation.y += shortestRotation * 0.1;
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
    
    // Use the camera's yaw (horizontal rotation) instead of player rotation
    const offsetDirection = new THREE.Vector3(0, 0, 1); // Behind player
    offsetDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
    
    // Position camera behind player
    camera.position.x = playerSphere.position.x - offsetDirection.x * cameraOffset;
    camera.position.z = playerSphere.position.z - offsetDirection.z * cameraOffset;
    
    // Apply pitch (vertical rotation)
    camera.position.y = playerSphere.position.y + cameraHeight - offsetDirection.y * cameraOffset;
    
    // Look at player with pitch
    const lookAtPoint = new THREE.Vector3(
        playerSphere.position.x,
        playerSphere.position.y + 0.5 + cameraPitch * 3, // Apply pitch to look point
        playerSphere.position.z
    );
    camera.lookAt(lookAtPoint);
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

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'absolute';
    notification.style.bottom = '100px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.fontFamily = 'Arial, sans-serif';
    notification.style.zIndex = '1000';
    
    document.body.appendChild(notification);
    
    // Remove after 2 seconds
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 2000);
}