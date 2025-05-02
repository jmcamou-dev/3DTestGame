/**
 * Visual Effects for 3D Sphere Game
 */

// Particle systems
let particleSystems = [];

/**
 * Initializes visual effects
 */
function initVisualEffects() {
    // Add lighting effects
    addDynamicLighting();
    
    // Add ambient particle effects
    createAmbientParticles();
}

/**
 * Adds dynamic lighting effects to the scene
 */
function addDynamicLighting() {
    // Add point light that follows player
    const playerLight = new THREE.PointLight(0xffffff, 0.7, 20);
    playerLight.position.set(0, 3, 0);
    playerLight.castShadow = true;
    playerSphere.add(playerLight);
    
    // Add spotlight for red blob to make it more menacing
    const redSpotlight = new THREE.SpotLight(0xff0000, 0.8, 15, Math.PI / 6, 0.5);
    redSpotlight.position.set(0, 5, 0);
    redSpotlight.target = redBlob;
    scene.add(redSpotlight);
    
    // Animate red spotlight
    function animateRedLight() {
        const intensity = 0.5 + Math.sin(Date.now() * 0.003) * 0.3;
        redSpotlight.intensity = intensity;
        
        // Update position to follow red blob
        redSpotlight.position.x = redBlob.position.x;
        redSpotlight.position.z = redBlob.position.z;
        redSpotlight.position.y = redBlob.position.y + 5;
        
        requestAnimationFrame(animateRedLight);
    }
    
    animateRedLight();
    
    // Add soft ambient light for better scene illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    // Add directional light to simulate sun
    const sunLight = new THREE.DirectionalLight(0xffffcc, 0.8);
    sunLight.position.set(50, 80, 50);
    sunLight.castShadow = true;
    
    // Improve shadow quality
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    
    scene.add(sunLight);
    
    // Enable shadows on renderer
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

/**
 * Creates ambient particle system for atmosphere
 */
function createAmbientParticles() {
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2,
        transparent: true,
        opacity: 0.6,
        map: createCircleTexture('#ffffff', 256),
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    // Create positions for particles
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    
    for (let i = 0; i < particleCount; i++) {
        // Random position in a large cube around the play area
        const x = (Math.random() - 0.5) * 100;
        const y = Math.random() * 10 + 2; // Above ground
        const z = (Math.random() - 0.5) * 100;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Add random velocity
        velocities.push({
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.02
        });
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create particle system
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.userData.velocities = velocities;
    scene.add(particleSystem);
    
    // Add to tracking array
    particleSystems.push({
        system: particleSystem,
        update: function() {
            const positions = particleSystem.geometry.attributes.position.array;
            
            for (let i = 0; i < particleCount; i++) {
                // Update position based on velocity
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;
                
                // Keep particles within bounds
                if (positions[i * 3] < -50 || positions[i * 3] > 50) {
                    velocities[i].x *= -1;
                }
                if (positions[i * 3 + 1] < 1 || positions[i * 3 + 1] > 15) {
                    velocities[i].y *= -1;
                }
                if (positions[i * 3 + 2] < -50 || positions[i * 3 + 2] > 50) {
                    velocities[i].z *= -1;
                }
            }
            
            // Update geometry
            particleSystem.geometry.attributes.position.needsUpdate = true;
        }
    });
}

/**
 * Creates collection particle effect
 * @param {THREE.Vector3} position - Position of the effect
 * @param {number} color - Color of the particles
 */
function createCollectionParticles(position, color) {
    const particleCount = 20;
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
        color: color,
        size: 0.5,
        transparent: true,
        opacity: 0.8,
        map: createCircleTexture('#ffffff', 256),
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    // Create positions for particles
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const startTime = Date.now();
    
    for (let i = 0; i < particleCount; i++) {
        // Initial position at collection point
        positions[i * 3] = position.x;
        positions[i * 3 + 1] = position.y;
        positions[i * 3 + 2] = position.z;
        
        // Add random velocity (burst outward)
        const speed = 0.05 + Math.random() * 0.1;
        const angle = Math.random() * Math.PI * 2;
        const heightAngle = Math.random() * Math.PI - Math.PI / 2;
        
        velocities.push({
            x: Math.cos(angle) * Math.cos(heightAngle) * speed,
            y: Math.sin(heightAngle) * speed,
            z: Math.sin(angle) * Math.cos(heightAngle) * speed
        });
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create particle system
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.userData.velocities = velocities;
    scene.add(particleSystem);
    
    // Add to tracking array with limited lifetime
    particleSystems.push({
        system: particleSystem,
        update: function() {
            const positions = particleSystem.geometry.attributes.position.array;
            const elapsed = Date.now() - startTime;
            
            // Remove after 1.5 seconds
            if (elapsed > 1500) {
                scene.remove(particleSystem);
                return true; // Return true to remove from array
            }
            
            // Update opacity based on lifetime
            particleSystem.material.opacity = 0.8 * (1 - (elapsed / 1500));
            
            for (let i = 0; i < particleCount; i++) {
                // Update position based on velocity
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;
                
                // Add gravity effect
                velocities[i].y -= 0.001;
            }
            
            // Update geometry
            particleSystem.geometry.attributes.position.needsUpdate = true;
            
            return false; // Keep in array
        }
    });
}

/**
 * Creates a trail effect behind the player
 */
function createPlayerTrail() {
    // Only create trail when moving
    if (!moveForward && !moveBackward && !moveLeft && !moveRight) {
        return;
    }
    
    // Check if power-up is active and change trail color
    let trailColor;
    
    if (playerIsInvincible) {
        trailColor = 0xff00ff; // Magenta for invincibility
    } else if (playerIsGhost) {
        trailColor = 0xaaaaaa; // Light gray for ghost
    } else if (playerSpeedMultiplier > 1) {
        trailColor = 0x00ffff; // Cyan for speed
    } else {
        trailColor = new THREE.Color(playerColor).getHex(); // Player color
    }
    
    // Create trail particle
    const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({
            color: trailColor,
            transparent: true,
            opacity: 0.7
        })
    );
    
    // Position slightly behind player
    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerSphere.rotation.y);
    
    particle.position.copy(playerSphere.position);
    particle.position.y = 0.6; // Slightly above ground
    particle.position.x -= direction.x * 0.5;
    particle.position.z -= direction.z * 0.5;
    
    scene.add(particle);
    
    // Track creation time
    const startTime = Date.now();
    
    // Add to tracking array with limited lifetime
    particleSystems.push({
        system: particle,
        update: function() {
            const elapsed = Date.now() - startTime;
            
            // Remove after 0.8 seconds
            if (elapsed > 800) {
                scene.remove(particle);
                return true; // Return true to remove from array
            }
            
            // Shrink and fade out
            const scale = 1 - (elapsed / 800);
            particle.scale.set(scale, scale, scale);
            particle.material.opacity = 0.7 * scale;
            
            return false; // Keep in array
        }
    });
}

/**
 * Updates all visual effects
 */
function updateVisualEffects() {
    // Update all particle systems
    for (let i = particleSystems.length - 1; i >= 0; i--) {
        // Call update function and remove if it returns true
        if (particleSystems[i].update()) {
            particleSystems.splice(i, 1);
        }
    }
    
    // Create player trail (throttled to reduce particles)
    if (Math.random() < 0.3) {
        createPlayerTrail();
    }
}

/**
 * Creates a circle texture for particles
 * @param {string} color - CSS color string
 * @param {number} size - Texture size
 * @returns {THREE.Texture} The circle texture
 */
function createCircleTexture(color, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const context = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2;
    
    // Draw gradient circle
    const gradient = context.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.fill();
    
    // Create texture from canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

/**
 * Creates post-processing effects for the scene
 */
function setupPostProcessing() {
    // Add fog to the scene for atmosphere
    scene.fog = new THREE.FogExp2(0x88aacc, 0.01);
    
    // Enable antialiasing on renderer
    renderer.antialias = true;
    
    // Set higher pixel ratio for better quality (with limit for performance)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}