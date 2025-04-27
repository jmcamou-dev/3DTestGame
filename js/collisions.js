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
        
        // Remove collectible
        scene.remove(collectible);
        obstacles.splice(index, 1);
        
        // Create new collectible
        createNewCollectible();
        
        return true;
    }
    
    return false;
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
}