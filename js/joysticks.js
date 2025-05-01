/**
 * Virtual joystick module for player movement and camera rotation
 */

// Joystick variables
let moveJoystick, rotateJoystick;
let joysticksVisible = true;

/**
 * Creates and initializes the virtual joysticks
 */
function setupJoysticks() {
    // Create container for joysticks
    const joysticksContainer = document.createElement('div');
    joysticksContainer.id = 'joysticks-container';
    document.body.appendChild(joysticksContainer);
    
    // Create movement joystick (left side)
    const moveJoystickContainer = document.createElement('div');
    moveJoystickContainer.id = 'move-joystick';
    joysticksContainer.appendChild(moveJoystickContainer);
    
    // Create rotation joystick (right side)
    const rotateJoystickContainer = document.createElement('div');
    rotateJoystickContainer.id = 'rotate-joystick';
    joysticksContainer.appendChild(rotateJoystickContainer);
    
    // Create toggle button
    createJoystickToggleButton();
    
    // Initialize the joysticks
    initializeJoysticks();
}

/**
 * Initialize the joysticks with nipplejs
 */
function initializeJoysticks() {
    // Options for movement joystick
    const moveJoystickOptions = {
        zone: document.getElementById('move-joystick'),
        mode: 'static',
        position: { left: '100px', bottom: '120px' },
        color: 'blue',
        size: 120,
        lockX: false,
        lockY: false,
        restOpacity: 0.6,
        fadeTime: 100
    };
    
    // Options for rotation joystick
    const rotateJoystickOptions = {
        zone: document.getElementById('rotate-joystick'),
        mode: 'static',
        position: { right: '100px', bottom: '120px' },
        color: 'green',
        size: 120,
        lockX: true,
        lockY: false,
        restOpacity: 0.6,
        fadeTime: 100
    };
    
    // Create the joysticks
    moveJoystick = nipplejs.create(moveJoystickOptions);
    rotateJoystick = nipplejs.create(rotateJoystickOptions);
    
    // Setup event handlers for movement joystick
    setupMoveJoystickEvents();
    
    // Setup event handlers for rotation joystick
    setupRotateJoystickEvents();
}

/**
 * Setup event handlers for movement joystick
 */
function setupMoveJoystickEvents() {
    // Reset movement on joystick release
    moveJoystick.on('end', () => {
        moveForward = false;
        moveBackward = false;
        moveLeft = false;
        moveRight = false;
    });
    
    // Handle joystick movement
    moveJoystick.on('move', (event, data) => {
        const angle = data.angle.radian;
        const force = Math.min(data.force, 1);
        
        // Calculate direction based on angle
        // Forward (up)
        if (angle > 5.5 || angle < 0.8) {
            moveLeft = false;
            moveRight = true;
        } 
        // Backward (down)
        else if (angle > 2.35 && angle < 3.9) {
            moveRight = false;
            moveLeft = true;
        } else {
            moveLeft = false;
            moveRight = false;
        }
        
        // Left - fixed to be actually left
        if (angle > 3.9 && angle < 5.5) {
            moveForward = false;
            moveBackward = true;
        } 
        // Right - fixed to be actually right
        else if (angle > 0.8 && angle < 2.35) {
            moveBackward = false;
            moveForward = true;
        } else {
            moveForward = false;
            moveBackward = false;
        }
    });
}

/**
 * Setup event handlers for rotation joystick
 */
function setupRotateJoystickEvents() {
    // Reset rotation on joystick release
    rotateJoystick.on('end', () => {
        rotateLeft = false;
        rotateRight = false;
    });
    
    // Handle joystick movement
    rotateJoystick.on('move', (event, data) => {
        const angle = data.angle.radian;
        
        // Right rotation (anything on the left half) - fixed direction
        if (angle > 1.57 && angle < 4.71) {
            rotateRight = false;
            rotateLeft = true;
        } 
        // Left rotation (anything on the right half) - fixed direction
        else {
            rotateLeft = false;
            rotateRight = true;
        }
    });
}

/**
 * Creates the toggle button for joysticks
 */
function createJoystickToggleButton() {
    const toggleBtn = document.createElement('div');
    toggleBtn.id = 'joystick-toggle';
    toggleBtn.textContent = 'Hide Joysticks';
    toggleBtn.addEventListener('click', toggleJoysticks);
    document.body.appendChild(toggleBtn);
}

/**
 * Toggles the visibility of joysticks
 */
function toggleJoysticks() {
    joysticksVisible = !joysticksVisible;
    
    const container = document.getElementById('joysticks-container');
    container.style.display = joysticksVisible ? 'block' : 'none';
    
    const toggleBtn = document.getElementById('joystick-toggle');
    toggleBtn.textContent = joysticksVisible ? 'Hide Joysticks' : 'Show Joysticks';
}

/**
 * Updates joystick positions on window resize
 */
function updateJoystickPositions() {
    if (moveJoystick && rotateJoystick) {
        moveJoystick.destroy();
        rotateJoystick.destroy();
        initializeJoysticks();
    }
}