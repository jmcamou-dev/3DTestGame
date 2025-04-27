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