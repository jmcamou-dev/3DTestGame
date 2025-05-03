/**
 * Minimap system for 3D Sphere Game
 */

// Minimap variables
let minimapCanvas, minimapContext;


/**
 * Initializes the minimap
 */
function initMinimap() {
    // Create canvas
    minimapCanvas = document.createElement('canvas');
    minimapCanvas.width = MINIMAP_SIZE;
    minimapCanvas.height = MINIMAP_SIZE;
    minimapCanvas.id = 'minimap';
    minimapCanvas.style.position = 'absolute';
    minimapCanvas.style.top = '50%';
    minimapCanvas.style.left = '50%';
    minimapCanvas.style.transform = 'translate(-50%, -50%)';
    minimapCanvas.style.borderRadius = '50%';
    minimapCanvas.style.border = '3px solid rgba(255, 255, 255, 0.5)';
    minimapCanvas.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    minimapCanvas.style.zIndex = '1000';
    minimapCanvas.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    minimapCanvas.style.display = 'none'; // Hidden initially
    
    // Get context
    minimapContext = minimapCanvas.getContext('2d');
    
    // Add to document
    document.body.appendChild(minimapCanvas);
    
    // Create toggle button
    createMinimapToggle();
}

/**
 * Creates a button to toggle the minimap visibility
 */
function createMinimapToggle() {
    const toggleBtn = document.createElement('div');
    toggleBtn.id = 'minimap-toggle';
    toggleBtn.textContent = 'Show Map';
    toggleBtn.style.position = 'absolute';
    toggleBtn.style.bottom = '20px';
    toggleBtn.style.right = `${MINIMAP_SIZE + 30}px`;
    toggleBtn.style.background = 'rgba(0,0,0,0.5)';
    toggleBtn.style.color = 'white';
    toggleBtn.style.padding = '5px 10px';
    toggleBtn.style.borderRadius = '5px';
    toggleBtn.style.fontFamily = 'Arial, sans-serif';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.fontSize = '12px';
    toggleBtn.style.zIndex = '1001';
    
    toggleBtn.addEventListener('click', () => {
        minimapVisible = !minimapVisible;
        minimapCanvas.style.display = minimapVisible ? 'block' : 'none';
        toggleBtn.textContent = minimapVisible ? 'Hide Map' : 'Show Map';
    });
    
    document.body.appendChild(toggleBtn);
}

/**
 * Updates the minimap
 */
function updateMinimap() {
    if (!minimapVisible) return;
    
    // Clear minimap
    minimapContext.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);
    
    // Center of minimap
    const centerX = MINIMAP_SIZE / 2;
    const centerY = MINIMAP_SIZE / 2;
    
    // Draw circular border with gradient
    const gradient = minimapContext.createRadialGradient(
        centerX, centerY, MINIMAP_SIZE / 2 - 10,
        centerX, centerY, MINIMAP_SIZE / 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 150, 255, 0.5)');
    
    minimapContext.beginPath();
    minimapContext.arc(centerX, centerY, MINIMAP_SIZE / 2 - 3, 0, Math.PI * 2);
    minimapContext.fillStyle = gradient;
    minimapContext.fill();
    
    // Draw ground color
    minimapContext.fillStyle = 'rgba(50, 150, 50, 0.2)';
    minimapContext.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);
    
    // Draw walls
    minimapContext.fillStyle = 'rgba(255, 0, 0, 0.6)';
    
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        
        if (obstacle.userData.isWall) {
            // Convert world coordinates to minimap coordinates
            const minimapX = centerX + (obstacle.position.x - playerSphere.position.x) / MINIMAP_SCALE;
            const minimapZ = centerY + (obstacle.position.z - playerSphere.position.z) / MINIMAP_SCALE;
            
            // Get obstacle dimensions
            const boxGeometry = obstacle.geometry;
            const width = boxGeometry.parameters.width / MINIMAP_SCALE;
            const depth = boxGeometry.parameters.depth / MINIMAP_SCALE;
            
            // Account for obstacle rotation (simplified)
            minimapContext.save();
            minimapContext.translate(minimapX, minimapZ);
            minimapContext.rotate(obstacle.rotation.y);
            
            // Draw rectangle for the wall
            minimapContext.fillRect(-width / 2, -depth / 2, width, depth);
            
            minimapContext.restore();
        }
    }
    
    // Draw collectibles
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        
        if (obstacle.userData.isCollectible) {
            // Convert world coordinates to minimap coordinates
            const minimapX = centerX + (obstacle.position.x - playerSphere.position.x) / MINIMAP_SCALE;
            const minimapZ = centerY + (obstacle.position.z - playerSphere.position.z) / MINIMAP_SCALE;
            
            // Draw circle for collectible
            minimapContext.beginPath();
            minimapContext.arc(minimapX, minimapZ, 2, 0, Math.PI * 2);
            minimapContext.fillStyle = 'rgba(255, 255, 0, 0.8)';
            minimapContext.fill();
        }
    }
    
    // Draw power-ups
    if (typeof powerUpObjects !== 'undefined') {
        for (let i = 0; i < powerUpObjects.length; i++) {
            const powerUp = powerUpObjects[i];
            
            // Convert world coordinates to minimap coordinates
            const minimapX = centerX + (powerUp.position.x - playerSphere.position.x) / MINIMAP_SCALE;
            const minimapZ = centerY + (powerUp.position.z - playerSphere.position.z) / MINIMAP_SCALE;
            
            // Draw star for power-up
            drawMinimapStar(minimapX, minimapZ, 3, 5, powerUp.userData.powerUpType);
        }
    }
    
    // Draw red blob (enemy)
    const blobX = centerX + (redBlob.position.x - playerSphere.position.x) / MINIMAP_SCALE;
    const blobZ = centerY + (redBlob.position.z - playerSphere.position.z) / MINIMAP_SCALE;
    
    // Pulsing effect for red blob
    const pulseSize = 3 + Math.sin(Date.now() * 0.005) * 1;
    
    minimapContext.beginPath();
    minimapContext.arc(blobX, blobZ, pulseSize, 0, Math.PI * 2);
    minimapContext.fillStyle = 'rgba(255, 0, 0, 0.7)';
    minimapContext.fill();
    
    // Draw other players
    for (const peerId in otherPlayers) {
        const otherPlayer = otherPlayers[peerId];
        
        // Convert world coordinates to minimap coordinates
        const otherX = centerX + (otherPlayer.position.x - playerSphere.position.x) / MINIMAP_SCALE;
        const otherZ = centerY + (otherPlayer.position.z - playerSphere.position.z) / MINIMAP_SCALE;
        
        // Draw circle for other player
        minimapContext.beginPath();
        minimapContext.arc(otherX, otherZ, 3, 0, Math.PI * 2);
        
        // Use their color
        const color = otherPlayer.material.color;
        minimapContext.fillStyle = `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 0.7)`;
        minimapContext.fill();
    }
    
    // Draw player (always in center)
    minimapContext.beginPath();
    minimapContext.arc(centerX, centerY, 4, 0, Math.PI * 2);
    
    // Use player color from global variable
    minimapContext.fillStyle = playerColor;
    minimapContext.fill();
    
    // Draw player direction indicator
    const dirX = centerX + Math.sin(playerSphere.rotation.y) * 8;
    const dirZ = centerY + Math.cos(playerSphere.rotation.y) * 8;
    
    minimapContext.beginPath();
    minimapContext.moveTo(centerX, centerY);
    minimapContext.lineTo(dirX, dirZ);
    minimapContext.strokeStyle = 'white';
    minimapContext.lineWidth = 2;
    minimapContext.stroke();
    
    // Draw compass rose
    // drawCompassRose();
}

/**
 * Draws a star shape on the minimap for power-ups
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} radius - Outer radius of star
 * @param {number} points - Number of points
 * @param {string} type - Power-up type for color
 */
function drawMinimapStar(x, y, radius, points, type) {
    // Get color based on type
    let color;
    
    switch (type) {
        case 'SPEED':
            color = 'rgba(0, 255, 255, 0.8)'; // Cyan
            break;
        case 'INVINCIBLE':
            color = 'rgba(255, 0, 255, 0.8)'; // Magenta
            break;
        case 'GHOST':
            color = 'rgba(170, 170, 170, 0.8)'; // Light gray
            break;
        default:
            color = 'rgba(255, 255, 255, 0.8)'; // White
    }
    
    minimapContext.beginPath();
    minimapContext.moveTo(x + radius, y);
    
    const innerRadius = radius / 2;
    
    for (let i = 0; i < points * 2; i++) {
        const r = (i % 2 === 0) ? radius : innerRadius;
        const angle = (Math.PI * i) / points;
        const pointX = x + r * Math.cos(angle);
        const pointY = y + r * Math.sin(angle);
        minimapContext.lineTo(pointX, pointY);
    }
    
    minimapContext.closePath();
    minimapContext.fillStyle = color;
    minimapContext.fill();
}

/**
 * Draws a compass rose on the minimap
 */
function drawCompassRose() {
    const x = 50;
    const y = 30;
    const radius = 15;
    
    // Draw circle
    minimapContext.beginPath();
    minimapContext.arc(x, y, radius, 0, Math.PI * 2);
    minimapContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
    minimapContext.fill();
    minimapContext.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    minimapContext.lineWidth = 1;
    minimapContext.stroke();
    
    // Adjust for player rotation
    minimapContext.save();
    minimapContext.translate(x, y);
    minimapContext.rotate(-playerSphere.rotation.y);
    
    // Draw cardinal directions
    const directions = [
        { letter: 'N', angle: 0 },
        { letter: 'E', angle: Math.PI / 2 },
        { letter: 'S', angle: Math.PI },
        { letter: 'W', angle: Math.PI * 3 / 2 }
    ];
    
    directions.forEach(dir => {
        const dirX = Math.sin(dir.angle) * (radius - 5);
        const dirY = -Math.cos(dir.angle) * (radius - 5);
        
        minimapContext.fillStyle = dir.letter === 'N' ? 'red' : 'white';
        minimapContext.font = '10px Arial';
        minimapContext.textAlign = 'center';
        minimapContext.textBaseline = 'middle';
        minimapContext.fillText(dir.letter, dirX, dirY);
    });
    
    // Draw north pointer
    minimapContext.beginPath();
    minimapContext.moveTo(0, -radius + 2);
    minimapContext.lineTo(0, -radius - 5);
    minimapContext.strokeStyle = 'red';
    minimapContext.lineWidth = 2;
    minimapContext.stroke();
    
    minimapContext.restore();
}