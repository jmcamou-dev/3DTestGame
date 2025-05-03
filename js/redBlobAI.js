/**
 * Updates the red blob enemy position and behavior
 */
function updateRedBlob() {
    // Check if player is visible
    const wasVisible = playerVisible;
    playerVisible = isPlayerVisibleToRedBlob();
    
    // Get direction to player
    const directionToPlayer = new THREE.Vector3();
    directionToPlayer.subVectors(playerSphere.position, redBlob.position).normalize();
    
    // Set different speeds based on visibility
    const blobSpeed = playerVisible ? 0.05 : 0.02;
    
    if (playerVisible) {
        // Chase player if visible
        redBlob.position.x += directionToPlayer.x * blobSpeed;
        redBlob.position.z += directionToPlayer.z * blobSpeed;
    } else {
        // Wander randomly if player not visible
        wanderRandomly();
    }
    
    // Check for collisions with walls
    checkRedBlobWallCollisions();
    
    // Update enemy sound based on visibility change - add this section
    if (playerVisible !== wasVisible) {
        if (redBlob.userData.sound) {
            redBlob.userData.sound.stop();
        }
        playEnemySound(redBlob.position, playerVisible);
    }
}

/**
 * Makes the red blob wander randomly
 */
function wanderRandomly() {
    // Random movement
    redBlob.position.x += (Math.random() - 0.5) * 0.05;
    redBlob.position.z += (Math.random() - 0.5) * 0.05;
    
    // Keep within bounds
    if (Math.abs(redBlob.position.x) > 45) {
        redBlob.position.x *= 0.95;
    }
    if (Math.abs(redBlob.position.z) > 45) {
        redBlob.position.z *= 0.95;
    }
}

/**
 * Determines if the player is visible to the red blob
 * @returns {boolean} True if player is visible
 */
function isPlayerVisibleToRedBlob() {
    // Calculate distance to player
    const distanceToPlayer = redBlob.position.distanceTo(playerSphere.position);
    
    // If too far, not visible
    if (distanceToPlayer > 25) {
        return false;
    }
    
    // Cast ray from Red Blob to player to check for walls
    const raycaster = new THREE.Raycaster();
    const rayDirection = new THREE.Vector3();
    rayDirection.subVectors(playerSphere.position, redBlob.position).normalize();
    
    raycaster.set(redBlob.position, rayDirection);
    
    // Check for intersections with walls
    const wallsToCheck = obstacles.filter(obstacle => obstacle.userData.isWall);
    const intersections = raycaster.intersectObjects(wallsToCheck);
    
    // If there's an intersection before reaching the player, then player is not visible
    if (intersections.length > 0 && intersections[0].distance < distanceToPlayer) {
        return false;
    }
    
    return true;
}

/**
 * Checks for and resolves red blob collisions with walls
 */
function checkRedBlobWallCollisions() {
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        
        if (obstacle.userData.isWall) {
            // Better sphere vs box collision detection for Red Blob
            const blobCenter = redBlob.position.clone();
            const blobRadius = 1.5; // Red Blob radius
            
            // Create a temporary box for the obstacle
            const obstacleBox = new THREE.Box3().setFromObject(obstacle);
            
            // Find the closest point on the box to the blob center
            const closestPoint = new THREE.Vector3();
            closestPoint.copy(blobCenter).clamp(obstacleBox.min, obstacleBox.max);
            
            // Calculate distance vector from closest point to blob center
            const distanceVector = new THREE.Vector3();
            distanceVector.subVectors(blobCenter, closestPoint);
            
            // Check if distance is less than blob radius
            const distance = distanceVector.length();
            
            if (distance < blobRadius) {
                // Push the blob away from the wall
                const pushVector = distanceVector.normalize().multiplyScalar(blobRadius - distance + 0.1);
                redBlob.position.add(pushVector);
            }
        }
    }
}