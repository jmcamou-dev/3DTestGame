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
        position: { left: '120px', bottom: '120px' },
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
        position: { right: '120px', bottom: '120px' },
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
            moveForward = true;
            moveBackward = false;
        } 
        // Backward (down)
        else if (angle > 2.35 && angle < 3.9) {
            moveBackward = true;
            moveForward = false;
        } else {
            moveForward = false;
            moveBackward = false;
        }
        
        // Left
        if (angle > 0.8 && angle < 2.35) {
            moveLeft = true;
            moveRight = false;
        } 
        // Right
        else if (angle > 3.9 && angle < 5.5) {
            moveRight = true;
            moveLeft = false;
        } else {
            moveLeft = false;
            moveRight = false;
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
        
        // Left rotation (anything on the left half)
        if (angle > 1.57 && angle < 4.71) {
            rotateLeft = true;
            rotateRight = false;
        } 
        // Right rotation (anything on the right half)
        else {
            rotateRight = true;
            rotateLeft = false;
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