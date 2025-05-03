// Game scene variables
let scene, camera, renderer, playerSphere, redBlob;
let obstacles = [], otherPlayers = {};

// Player variables
let playerVelocity = { x: 0, z: 0 };
// Generate a valid 6-digit hex color code
let playerColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
let playerPosition = { x: 0, y: 1, z: 0 };
let playerRespawning = false;

// Game state variables
let score = 0;
let respawnCountdown = 0;
let lastCountdownUpdate = 0;

// Camera variables
let cameraRotation = 0;
let cameraDistance = 10;
let cameraHeight = 5;

// Red Blob AI variables
let playerVisible = false;

// Networking variables
let peer;
let connections = [];
let gameCode;
let connectedPlayers = []; // List of connected players

// Player information
let playerName = "Player";
let otherPlayerInfo = {};

// Game state
let gamePaused = false;
let gameStarted = false;

// UI state
let minimapVisible = false;
let joysticksVisible = false;

// Networking mode
let gameMode = 'host';
let gameCodeToJoin = null;

// Update minimap constants for better zoom
const MINIMAP_SIZE = 200;
const MINIMAP_SCALE = .5; // Increased from 2.5 to zoom in more


// Player movement variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let rotateLeft = false;
let rotateRight = false;

// Movement constants
const MOVEMENT_SPEED = 0.1;
const ROTATION_SPEED = 0.03;

let cameraYaw = 0; // Horizontal camera rotation
let cameraPitch = 0; // Vertical camera rotation
let mouseControlEnabled = true; // Flag to enable/disable mouse control

const MAX_PITCH = Math.PI / 3; // Maximum camera pitch (up/down)
const MIN_PITCH = -Math.PI / 3; // Minimum camera pitch (up/down)