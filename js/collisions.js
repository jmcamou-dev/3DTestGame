/**
 * Checks for player collisions with obstacles and collectibles
 */
function checkCollisions() {
    const wallCollisions = [];
    
    // Check all obstacles
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        
        if (obstacle.userData.isCollectible) {
            checkCollectibleCollision(obstacle, i);
        } else {
            // Wall collision
            checkWallCollision(obstacle, wallCollisions);
        }
    }
    
    // Resolve wall collisions
    if (wallCollisions.length > 0) {
        resolveWallCollisions(wallCollisions);
    }
}

/**
 * Checks for collision with a collectible
 * @param {THREE.Mesh} collectible - The collectible to check
 * @param {number} index - Index in the obstacles array
 * @returns {boolean} True if collision occurred
 */
function checkCollectibleCollision(collectible, index) {
    const distance = playerSphere.position.distanceTo(collectible.position);
    
    if (distance < 1.5) {
        // Collect point
        score += 10;
        document.getElementById('score').textContent = score;
        
        // Play collect sound - add this line
        playCollectSound(collectible.position.clone());
        
        // Remove collectible
        scene.remove(collectible);
        obstacles.splice(index, 1);
        
        // Check if all collectibles are gone - add this section
        const remainingCollectibles = obstacles.filter(obj => obj.userData.isCollectible);
        if (remainingCollectibles.length === 0) {
            // Player has won the game!
            showVictoryScreen();
            // Play victory sound
            playVictorySound();
        }
        
        // Remove this line to prevent new collectibles from appearing
        // createNewCollectible();
        
        return true;
    }
    
    return false;
}

/**
 * Shows victory screen when all collectibles are collected
 */
function showVictoryScreen() {
    // Create victory overlay
    const victoryOverlay = document.createElement('div');
    victoryOverlay.id = 'victory-overlay';
    victoryOverlay.style.position = 'fixed';
    victoryOverlay.style.top = '0';
    victoryOverlay.style.left = '0';
    victoryOverlay.style.width = '100%';
    victoryOverlay.style.height = '100%';
    victoryOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    victoryOverlay.style.display = 'flex';
    victoryOverlay.style.flexDirection = 'column';
    victoryOverlay.style.justifyContent = 'center';
    victoryOverlay.style.alignItems = 'center';
    victoryOverlay.style.zIndex = '3000';
    
    // Victory message
    const victoryMessage = document.createElement('h1');
    victoryMessage.textContent = 'Victory!';
    victoryMessage.style.color = '#ffff00';
    victoryMessage.style.fontSize = '48px';
    victoryMessage.style.marginBottom = '20px';
    victoryMessage.style.textShadow = '0 0 10px #ffff00';
    
    // Score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.textContent = `Final Score: ${score}`;
    scoreDisplay.style.color = 'white';
    scoreDisplay.style.fontSize = '24px';
    scoreDisplay.style.marginBottom = '30px';
    
    // Play again button
    const playAgainBtn = document.createElement('button');
    playAgainBtn.textContent = 'Play Again';
    playAgainBtn.style.padding = '15px 30px';
    playAgainBtn.style.backgroundColor = '#4CAF50';
    playAgainBtn.style.color = 'white';
    playAgainBtn.style.border = 'none';
    playAgainBtn.style.borderRadius = '5px';
    playAgainBtn.style.fontSize = '18px';
    playAgainBtn.style.cursor = 'pointer';
    playAgainBtn.style.marginBottom = '15px';
    
    playAgainBtn.addEventListener('click', () => {
        playButtonSound(); // Add sound
        location.reload();
    });
    
    // Add elements to overlay
    victoryOverlay.appendChild(victoryMessage);
    victoryOverlay.appendChild(scoreDisplay);
    victoryOverlay.appendChild(playAgainBtn);
    
    // Add to document
    document.body.appendChild(victoryOverlay);
    
    // Play victory sound
    playVictorySound();
}


/**
 * Checks for collision with a wall
 * @param {THREE.Mesh} wall - The wall to check
 * @param {Array} wallCollisions - Array to store collision data
 */
function checkWallCollision(wall, wallCollisions) {
    const sphereCenter = playerSphere.position.clone();
    const sphereRadius = 1; // Player sphere radius
    
    // Get wall bounding box
    const obstacleBox = new THREE.Box3().setFromObject(wall);
    
    // Find closest point on the box to the sphere center
    const closestPoint = new THREE.Vector3();
    closestPoint.copy(sphereCenter).clamp(obstacleBox.min, obstacleBox.max);
    
    // Calculate distance vector from closest point to sphere center
    const distanceVector = new THREE.Vector3();
    distanceVector.subVectors(sphereCenter, closestPoint);
    
    // Check if distance is less than sphere radius
    const distance = distanceVector.length();
    
    if (distance < sphereRadius) {
        // Store collision data
        const penetrationDepth = sphereRadius - distance;
        const collisionNormal = distanceVector.clone().normalize();
        
        wallCollisions.push({
            obstacle: wall,
            normal: collisionNormal,
            penetrationDepth: penetrationDepth
        });
    }
}

/**
 * Resolves collisions with walls
 * @param {Array} wallCollisions - Array of collision data
 */
function resolveWallCollisions(wallCollisions) {
    // Sort collisions by penetration depth (resolve deepest penetrations first)
    wallCollisions.sort((a, b) => b.penetrationDepth - a.penetrationDepth);
    
    // Combine all resolution vectors
    const resolutionVector = new THREE.Vector3();
    
    for (const collision of wallCollisions) {
        // Scale normal by penetration depth + small buffer
        const pushVector = collision.normal.clone()
            .multiplyScalar(collision.penetrationDepth + 0.05);
        
        // Add to total resolution vector
        resolutionVector.add(pushVector);
    }
    
    // Apply combined resolution vector
    playerSphere.position.add(resolutionVector);
    
    // Play wall hit sound if collision is significant - add this section
    if (resolutionVector.length() > 0.1) {
        // Calculate collision force based on resolution length
        const force = Math.min(resolutionVector.length() * 2, 1);
        
        // Position is halfway between player and wall
        const position = playerSphere.position.clone();
        position.sub(resolutionVector.clone().multiplyScalar(0.5));
        
        // Play sound
        playWallHitSound(position, force);
    }
}

/**
 * Handles player collision with red blob
 */
function checkRedBlobCollision() {
    // Check for collision between player and Red Blob
    const distanceToBlob = playerSphere.position.distanceTo(redBlob.position);
    
    if (distanceToBlob < 2.5 && !playerRespawning) {
        // Player caught by Red Blob!
        startRespawnCountdown();
        
        // Play hurt sound - add this line
        playHurtSound();
        
        return true;
    }
    
    return false;
}

/**
 * Starts the respawn countdown when caught by red blob
 */
function startRespawnCountdown() {
    // Hide player
    playerRespawning = true;
    playerSphere.visible = false;
    
    // Initialize countdown
    respawnCountdown = 5;
    lastCountdownUpdate = Date.now();
    
    // Show respawn UI
    const respawnUI = document.getElementById('respawnCountdown');
    respawnUI.textContent = `Caught by Red Blob! Respawning in ${respawnCountdown}...`;
    respawnUI.style.display = 'block';
}

/**
 * Updates the respawn countdown timer
 */
function updateRespawnCountdown() {
    // Update every second
    const now = Date.now();
    
    if (now - lastCountdownUpdate >= 1000) {
        respawnCountdown--;
        lastCountdownUpdate = now;
        
        // Update UI
        const respawnUI = document.getElementById('respawnCountdown');
        respawnUI.textContent = `Caught by Red Blob! Respawning in ${respawnCountdown}...`;
        
        // Time to respawn
        if (respawnCountdown <= 0) {
            respawnPlayer();
        }
    }
}

/**
 * Respawns the player at a random location
 */
function respawnPlayer() {
    // Respawn at random position
    playerSphere.position.x = (Math.random() - 0.5) * 80;
    playerSphere.position.z = (Math.random() - 0.5) * 80;
    playerSphere.position.y = 1;
    
    // Make visible again
    playerSphere.visible = true;
    playerRespawning = false;
    
    // Hide UI
    document.getElementById('respawnCountdown').style.display = 'none';
    
    // Move red blob away
    redBlob.position.x = -playerSphere.position.x + (Math.random() - 0.5) * 20;
    redBlob.position.z = -playerSphere.position.z + (Math.random() - 0.5) * 20;
    
    // Play spawn sound - add this line
    playSpawnSound();
}