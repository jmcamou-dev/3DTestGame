/**
 * Power-up system for the 3D Sphere Game
 */

// Power-up types and their effects
const POWER_UP_TYPES = {
    SPEED: {
        color: 0x00ffff, // Cyan
        duration: 10000, // 10 seconds
        effect: 'Increases player movement speed',
        multiplier: 2.0
    },
    INVINCIBLE: {
        color: 0xff00ff, // Magenta
        duration: 5000, // 5 seconds
        effect: 'Makes player immune to Red Blob',
        multiplier: 1.0
    },
    GHOST: {
        color: 0xaaaaaa, // Light gray
        duration: 8000, // 8 seconds
        effect: 'Player can pass through walls',
        multiplier: 1.0
    }
};

// Track active power-ups
let activePowerUps = [];
let powerUpObjects = [];

// Current power-up state
let playerSpeedMultiplier = 1.0;
let playerIsInvincible = false;
let playerIsGhost = false;

/**
 * Creates a power-up at a random position
 * @returns {THREE.Mesh} The power-up object
 */
function createPowerUp() {
    // Select random power-up type
    const powerUpKeys = Object.keys(POWER_UP_TYPES);
    const randomType = powerUpKeys[Math.floor(Math.random() * powerUpKeys.length)];
    const powerUpConfig = POWER_UP_TYPES[randomType];
    
    // Create star-shaped geometry for power-up
    const powerUp = createStarShape(powerUpConfig.color);
    
    // Set random position
    powerUp.position.x = (Math.random() - 0.5) * 40;
    powerUp.position.y = 1.5; // Slightly above ground
    powerUp.position.z = (Math.random() - 0.5) * 40;
    
    // Store power-up type
    powerUp.userData.powerUpType = randomType;
    powerUp.userData.isPowerUp = true;
    
    // Add to scene and tracking array
    scene.add(powerUp);
    powerUpObjects.push(powerUp);
    
    // Add floating animation
    animatePowerUp(powerUp);
    
    return powerUp;
}

/**
 * Creates a 3D star shape for power-ups
 * @param {number} color - Hex color value
 * @returns {THREE.Mesh} Star-shaped mesh
 */
function createStarShape(color) {
    const spikesGeometry = new THREE.Group();
    
    // Create 6 spikes arranged in 3D
    for (let i = 0; i < 6; i++) {
        const spike = new THREE.Mesh(
            new THREE.ConeGeometry(0.2, 0.8, 4),
            new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.3,
                metalness: 0.8,
                emissive: color,
                emissiveIntensity: 0.4
            })
        );
        
        // Position spikes in different directions
        if (i < 2) {
            // Up and down
            spike.rotation.x = (i === 0) ? 0 : Math.PI;
            spike.position.y = (i === 0) ? 0.4 : -0.4;
        } else if (i < 4) {
            // Left and right
            spike.rotation.z = (i === 2) ? Math.PI/2 : -Math.PI/2;
            spike.position.x = (i === 2) ? 0.4 : -0.4;
        } else {
            // Forward and backward
            spike.rotation.x = (i === 4) ? Math.PI/2 : -Math.PI/2;
            spike.position.z = (i === 4) ? 0.4 : -0.4;
        }
        
        spikesGeometry.add(spike);
    }
    
    // Add small sphere in center
    const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16),
        new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.8,
            emissive: color,
            emissiveIntensity: 0.4
        })
    );
    spikesGeometry.add(core);
    
    return spikesGeometry;
}

/**
 * Animates a power-up with rotation and bobbing
 * @param {THREE.Object3D} powerUp - The power-up to animate
 */
function animatePowerUp(powerUp) {
    const initialY = powerUp.position.y;
    const startTime = Date.now();
    
    function animate() {
        // Only continue animation if power-up still exists
        if (!powerUp.parent) return;
        
        const time = Date.now() - startTime;
        
        // Rotate continuously
        powerUp.rotation.y += 0.02;
        powerUp.rotation.x += 0.01;
        
        // Bob up and down
        powerUp.position.y = initialY + Math.sin(time * 0.002) * 0.2;
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

/**
 * Checks for collision with power-ups
 */
function checkPowerUpCollisions() {
    for (let i = powerUpObjects.length - 1; i >= 0; i--) {
        const powerUp = powerUpObjects[i];
        const distance = playerSphere.position.distanceTo(powerUp.position);
        
        if (distance < 2) {
            // Get power-up type and position before removing it
            const powerUpType = powerUp.userData.powerUpType;
            const powerUpPosition = powerUp.position.clone();
            
            // Get power-up color from config instead of from material
            const powerUpColor = POWER_UP_TYPES[powerUpType].color;
            
            // Activate power-up
            activatePowerUp(powerUpType);
            
            // Remove power-up
            scene.remove(powerUp);
            powerUpObjects.splice(i, 1);
            
            // Create UI notification
            showPowerUpNotification(powerUpType);
            
            // Create particle effect using position and color from config
            createPowerUpCollectEffect(powerUpPosition, powerUpColor);
        }
    }
}

/**
 * Activates a power-up effect
 * @param {string} type - Power-up type from POWER_UP_TYPES
 */
function activatePowerUp(type) {
    const config = POWER_UP_TYPES[type];
    const powerUpId = Date.now(); // Unique ID for this power-up instance
    
    // Apply effect based on type
    switch(type) {
        case 'SPEED':
            playerSpeedMultiplier = config.multiplier;
            break;
        case 'INVINCIBLE':
            playerIsInvincible = true;
            // Add visual effect to player
            playerSphere.children[0].material.emissive.set(new THREE.Color(0xff00ff));
            playerSphere.children[0].material.emissiveIntensity = 0.3;
            break;
        case 'GHOST':
            playerIsGhost = true;
            // Make player semi-transparent
            playerSphere.children.forEach(child => {
                if (child.material) {
                    child.material.transparent = true;
                    child.material.opacity = 0.5;
                }
            });
            break;
    }
    
    // Add to active power-ups
    activePowerUps.push({
        type: type,
        endTime: Date.now() + config.duration,
        id: powerUpId
    });
    
    // Set timeout to end effect
    setTimeout(() => {
        deactivatePowerUp(type, powerUpId);
    }, config.duration);
    
    // Award bonus points
    score += 25;
    document.getElementById('score').textContent = score;
    
    // Play power-up sound - add this line
    playPowerUpSound(playerSphere.position, type);
}
/**
 * Deactivates a power-up effect
 * @param {string} type - Power-up type from POWER_UP_TYPES
 * @param {number} id - Unique ID of the power-up instance
 */
function deactivatePowerUp(type, id) {
    // Remove from active power-ups
    activePowerUps = activePowerUps.filter(p => p.id !== id);
    
    // Check if any other power-ups of same type are still active
    const stillActive = activePowerUps.some(p => p.type === type);
    
    if (!stillActive) {
        // Reset effect based on type
        switch(type) {
            case 'SPEED':
                playerSpeedMultiplier = 1.0;
                break;
            case 'INVINCIBLE':
                playerIsInvincible = false;
                // Remove visual effect from player
                playerSphere.children[0].material.emissive.set(new THREE.Color(0x000000));
                playerSphere.children[0].material.emissiveIntensity = 0;
                break;
            case 'GHOST':
                playerIsGhost = false;
                // Restore player opacity
                playerSphere.children.forEach(child => {
                    if (child.material) {
                        child.material.transparent = false;
                        child.material.opacity = 1.0;
                    }
                });
                break;
        }
        
        // Create UI notification for power-up end
        showPowerUpEndNotification(type);
    }
}

/**
 * Creates particle effect when collecting a power-up
 * @param {THREE.Vector3} position - Position to create effect
 * @param {THREE.Color} color - Color of the particles
 */
function createPowerUpCollectEffect(position, color) {
    const particleCount = 20;
    const particles = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshBasicMaterial({
                color: color,
                transparent: true
            })
        );
        
        // Random position near collection point
        particle.position.copy(position);
        
        // Random velocity
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            Math.random() * 0.2,
            (Math.random() - 0.5) * 0.2
        );
        
        particle.userData.velocity = velocity;
        particles.add(particle);
    }
    
    scene.add(particles);
    
    // Animate particles
    const startTime = Date.now();
    function animateParticles() {
        const elapsed = Date.now() - startTime;
        
        // Remove after 1 second
        if (elapsed > 1000) {
            scene.remove(particles);
            return;
        }
        
        // Update each particle
        particles.children.forEach(particle => {
            // Move according to velocity
            particle.position.add(particle.userData.velocity);
            
            // Add gravity
            particle.userData.velocity.y -= 0.01;
            
            // Fade out
            particle.material.opacity = 1 - (elapsed / 1000);
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}

/**
 * Shows a notification when power-up is collected
 * @param {string} type - Power-up type
 */
function showPowerUpNotification(type) {
    const config = POWER_UP_TYPES[type];
    
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = `${type} ACTIVATED: ${config.effect}`;
    notification.style.position = 'absolute';
    notification.style.bottom = '100px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = `#${config.color.toString(16).padStart(6, '0')}`;
    notification.style.color = 'black';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.fontFamily = 'Arial, sans-serif';
    notification.style.fontWeight = 'bold';
    notification.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    notification.style.zIndex = '1000';
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}

/**
 * Shows a notification when power-up ends
 * @param {string} type - Power-up type
 */
function showPowerUpEndNotification(type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = `${type} POWER-UP ENDED`;
    notification.style.position = 'absolute';
    notification.style.bottom = '100px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#aaaaaa';
    notification.style.color = 'black';
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

/**
 * Spawns power-ups at intervals
 */
function startPowerUpSpawning() {
    // Create initial power-ups
    createPowerUp();
    
    // Spawn new power-ups periodically
    setInterval(() => {
        if (powerUpObjects.length < 3) {
            createPowerUp();
        }
    }, 30000); // New power-up every 30 seconds if less than 3 exist
}

/**
 * Updates all power-up related logic (call in animation loop)
 */
function updatePowerUps() {
    checkPowerUpCollisions();
    
    // Show active power-ups UI
    updatePowerUpUI();
}

/**
 * Creates and updates power-up status UI
 */
function updatePowerUpUI() {
    // Create container if it doesn't exist
    let container = document.getElementById('power-up-status');
    if (!container) {
        container = document.createElement('div');
        container.id = 'power-up-status';
        container.style.position = 'absolute';
        container.style.top = '10px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.display = 'flex';
        container.style.gap = '10px';
        document.body.appendChild(container);
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add active power-ups
    activePowerUps.forEach(powerUp => {
        const config = POWER_UP_TYPES[powerUp.type];
        const timeLeft = Math.max(0, Math.floor((powerUp.endTime - Date.now()) / 1000));
        
        const powerUpElement = document.createElement('div');
        powerUpElement.textContent = `${powerUp.type}: ${timeLeft}s`;
        powerUpElement.style.backgroundColor = `#${config.color.toString(16).padStart(6, '0')}`;
        powerUpElement.style.color = 'black';
        powerUpElement.style.padding = '5px 10px';
        powerUpElement.style.borderRadius = '3px';
        powerUpElement.style.fontFamily = 'Arial, sans-serif';
        powerUpElement.style.fontWeight = 'bold';
        
        container.appendChild(powerUpElement);
    });
}