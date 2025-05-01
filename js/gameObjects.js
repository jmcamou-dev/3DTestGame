/**
 * Creates the scene, camera, lighting and ground
 */
function createScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Create lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // Create ground
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshStandardMaterial({ 
            color: 0x33aa33, // Green ground
            roughness: 0.8
        })
    );
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.receiveShadow = true;
    scene.add(ground);
}

/**
 * Creates the player sphere
 */
function createPlayer() {
    // Create a player group
    const playerGroup = new THREE.Group();
    
    // Main sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ 
        color: playerColor,
        roughness: 0.4,
        metalness: 0.3
    });
    const mainSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    playerGroup.add(mainSphere);
    
    // Create face features
    
    // Eyes (facing forward in the -Z direction)
    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000, // Black eyes
        roughness: 0.1,
        metalness: 0.2
    });
    
    // Left eye - positioned on the sphere's surface facing forward
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.4, 0.4, -0.9); // Negative Z is forward
    playerGroup.add(leftEye);
    
    // Right eye - positioned on the sphere's surface facing forward
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.4, 0.4, -0.9); // Negative Z is forward
    playerGroup.add(rightEye);
    
    // Mouth (slightly curved line facing forward)
    const mouthGeometry = new THREE.TorusGeometry(0.3, 0.05, 8, 12, Math.PI * 0.5);
    const mouthMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000, // Black mouth
        roughness: 0.2,
        metalness: 0.1
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.3, -0.9); // Below the eyes
    mouth.rotation.x = Math.PI / 2; // Rotate to face forward
    mouth.rotation.y = Math.PI; // Flip to smile
    playerGroup.add(mouth);
    
    // Position the group
    playerGroup.position.y = 1;
    playerGroup.castShadow = true;
    
    // Assign to global variable
    playerSphere = playerGroup;
    scene.add(playerSphere);
}

/**
 * Creates red wall obstacles and yellow collectibles
 */
function createObstacles() {
    const wallHeight = 3;
    const wallThickness = 1;
    
    // Create a maze-like pattern of walls
    const walls = [
        // Horizontal walls
        { x: 0, z: 10, width: 15, depth: wallThickness },
        { x: -20, z: -5, width: 20, depth: wallThickness },
        { x: 15, z: -15, width: 25, depth: wallThickness },
        { x: -10, z: -25, width: 30, depth: wallThickness },
        { x: 25, z: 5, width: 15, depth: wallThickness },
        { x: -25, z: 20, width: 20, depth: wallThickness },
        { x: 5, z: 30, width: 10, depth: wallThickness },
        
        // Vertical walls
        { x: -15, z: 0, width: wallThickness, depth: 20 },
        { x: 10, z: -10, width: wallThickness, depth: 15 },
        { x: -5, z: 15, width: wallThickness, depth: 25 },
        { x: 20, z: -20, width: wallThickness, depth: 10 },
        { x: -30, z: -15, width: wallThickness, depth: 20 },
        { x: 30, z: 10, width: wallThickness, depth: 30 },
        { x: 5, z: -30, width: wallThickness, depth: 15 }
    ];
    
    walls.forEach(wall => {
        const obstacle = new THREE.Mesh(
            new THREE.BoxGeometry(wall.width, wallHeight, wall.depth),
            new THREE.MeshStandardMaterial({
                color: 0xff0000, // Red walls
                roughness: 0.7,
                metalness: 0.2
            })
        );
        obstacle.position.x = wall.x;
        obstacle.position.y = wallHeight / 2;
        obstacle.position.z = wall.z;
        
        // Tag as wall for collision detection
        obstacle.userData.isWall = true;
        
        scene.add(obstacle);
        obstacles.push(obstacle);
    });
    
    // Create collectible spheres
    createCollectibles(15);
}

/**
 * Creates collectible yellow spheres
 * @param {number} count - Number of collectibles to create
 */
function createCollectibles(count) {
    for (let i = 0; i < count; i++) {
        const collectible = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 16, 16),
            new THREE.MeshStandardMaterial({
                color: 0xffff00, // Yellow collectibles
                roughness: 0.3,
                metalness: 0.8,
                emissive: 0xffff00,
                emissiveIntensity: 0.2
            })
        );
        collectible.position.x = (Math.random() - 0.5) * 40;
        collectible.position.y = 1;
        collectible.position.z = (Math.random() - 0.5) * 40;
        collectible.userData.isCollectible = true;
        
        scene.add(collectible);
        obstacles.push(collectible);
    }
}

/**
 * Creates a new collectible at a random position
 */
function createNewCollectible() {
    const collectible = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0xffff00,
            roughness: 0.3,
            metalness: 0.8,
            emissive: 0xffff00,
            emissiveIntensity: 0.2
        })
    );
    collectible.position.x = (Math.random() - 0.5) * 40;
    collectible.position.y = 1;
    collectible.position.z = (Math.random() - 0.5) * 40;
    collectible.userData.isCollectible = true;
    
    scene.add(collectible);
    obstacles.push(collectible);
    
    return collectible;
}

/**
 * Creates the red blob enemy
 */
function createRedBlob() {
    redBlob = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 20, 20),
        new THREE.MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.3,
            metalness: 0.2,
            transparent: true,
            opacity: 0.8
        })
    );
    
    // Position at random location
    redBlob.position.x = (Math.random() - 0.5) * 80;
    redBlob.position.y = 1.5; // Slightly higher than player
    redBlob.position.z = (Math.random() - 0.5) * 80;
    
    // Add wobble animation
    animateRedBlob();
    
    scene.add(redBlob);
}

/**
 * Animates the red blob with a wobbling effect
 */
function animateRedBlob() {
    const wobbleAnimation = () => {
        const scaleAmount = 0.1;
        const scale = 1 + Math.sin(Date.now() * 0.005) * scaleAmount;
        
        if (redBlob) {
            redBlob.scale.set(scale, scale * 0.9, scale);
        }
        
        requestAnimationFrame(wobbleAnimation);
    };
    
    wobbleAnimation();
}