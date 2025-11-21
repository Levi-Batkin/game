// ============================================
// GAME CONSTANTS AND CONFIGURATION
// ============================================

// Canvas and rendering setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game physics constants
const GRAVITY = 0.5;           // Gravity force applied to characters
const JUMP_FORCE = -12;        // Initial velocity when jumping
const MOVE_SPEED = 4;          // Horizontal movement speed
const MAX_FALL_SPEED = 15;     // Maximum falling speed

// Character types
const CHAR_TYPE = {
    FIRE: 'fire',
    WATER: 'water'
};

// Game object types
const OBJ_TYPE = {
    PLATFORM: 'platform',
    HAZARD: 'hazard',
    DOOR: 'door',
    SWITCH: 'switch',
    COLLECTIBLE: 'collectible',
    MOVING_PLATFORM: 'moving_platform'
};

// ============================================
// CHARACTER CLASS
// ============================================

/**
 * Character class representing either Fire Boy or Water Girl
 * Each character has unique hazard resistances
 */
class Character {
    constructor(x, y, type) {
        this.x = x;                    // X position
        this.y = y;                    // Y position
        this.width = 25;               // Character width
        this.height = 35;              // Character height
        this.type = type;              // Character type (fire or water)
        this.velocityX = 0;            // Horizontal velocity
        this.velocityY = 0;            // Vertical velocity
        this.isOnGround = false;       // Whether character is on ground
        this.isAlive = true;           // Whether character is alive
        this.hasReachedDoor = false;   // Whether character reached exit
        this.color = type === CHAR_TYPE.FIRE ? '#ff6b35' : '#4ecdc4';
    }

    /**
     * Update character physics and position
     */
    update() {
        if (!this.isAlive) return;

        // Apply gravity
        this.velocityY += GRAVITY;
        
        // Cap falling speed
        if (this.velocityY > MAX_FALL_SPEED) {
            this.velocityY = MAX_FALL_SPEED;
        }

        // Update position based on velocity
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Keep character within canvas bounds
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }

        // Reset ground state (will be set by collision detection)
        this.isOnGround = false;
    }

    /**
     * Render the character on canvas
     */
    draw() {
        if (!this.isAlive) return;

        // Draw character body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw character face
        ctx.fillStyle = 'white';
        
        // Eyes
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y + 12, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 17, this.y + 12, 3, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y + 12, 1.5, 0, Math.PI * 2);
        ctx.arc(this.x + 17, this.y + 12, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Mouth (smile)
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + 12.5, this.y + 20, 6, 0.2, Math.PI - 0.2);
        ctx.stroke();
    }

    /**
     * Make the character jump if on ground
     */
    jump() {
        if (this.isOnGround && this.isAlive) {
            this.velocityY = JUMP_FORCE;
            this.isOnGround = false;
        }
    }

    /**
     * Move character left
     */
    moveLeft() {
        if (this.isAlive) {
            this.velocityX = -MOVE_SPEED;
        }
    }

    /**
     * Move character right
     */
    moveRight() {
        if (this.isAlive) {
            this.velocityX = MOVE_SPEED;
        }
    }

    /**
     * Stop horizontal movement
     */
    stopMoving() {
        this.velocityX = 0;
    }

    /**
     * Kill the character
     */
    die() {
        this.isAlive = false;
    }

    /**
     * Check if character intersects with a hazard
     */
    canSurviveHazard(hazardType) {
        // Fire Boy can survive fire but not water
        if (this.type === CHAR_TYPE.FIRE) {
            return hazardType === 'fire';
        }
        // Water Girl can survive water but not fire
        if (this.type === CHAR_TYPE.WATER) {
            return hazardType === 'water';
        }
        return false;
    }
}

// ============================================
// GAME OBJECT CLASSES
// ============================================

/**
 * Platform class for static platforms
 */
class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = OBJ_TYPE.PLATFORM;
    }

    draw() {
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add some texture detail
        ctx.strokeStyle = '#6b5345';
        ctx.lineWidth = 2;
        for (let i = 0; i < this.width; i += 30) {
            ctx.beginPath();
            ctx.moveTo(this.x + i, this.y);
            ctx.lineTo(this.x + i, this.y + this.height);
            ctx.stroke();
        }
    }
}

/**
 * Hazard class for dangerous areas (fire and water)
 */
class Hazard {
    constructor(x, y, width, height, hazardType) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hazardType = hazardType; // 'fire' or 'water'
        this.type = OBJ_TYPE.HAZARD;
        this.animationFrame = 0;
    }

    draw() {
        this.animationFrame += 0.1;
        
        if (this.hazardType === 'fire') {
            // Draw fire hazard with animated effect
            const gradient = ctx.createLinearGradient(
                this.x, this.y, this.x, this.y + this.height
            );
            gradient.addColorStop(0, '#ff6b35');
            gradient.addColorStop(0.5, '#ff8c42');
            gradient.addColorStop(1, '#ffd700');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Animated flames
            for (let i = 0; i < this.width; i += 15) {
                const flameHeight = Math.sin(this.animationFrame + i / 10) * 5;
                ctx.fillStyle = 'rgba(255, 140, 0, 0.7)';
                ctx.beginPath();
                ctx.moveTo(this.x + i, this.y + this.height);
                ctx.lineTo(this.x + i + 7, this.y + this.height);
                ctx.lineTo(this.x + i + 3.5, this.y + flameHeight);
                ctx.closePath();
                ctx.fill();
            }
        } else if (this.hazardType === 'water') {
            // Draw water hazard with wave effect
            const gradient = ctx.createLinearGradient(
                this.x, this.y, this.x, this.y + this.height
            );
            gradient.addColorStop(0, '#4ecdc4');
            gradient.addColorStop(1, '#1a5490');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Animated waves
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            for (let y = 0; y < this.height; y += 10) {
                ctx.beginPath();
                for (let x = 0; x < this.width; x += 5) {
                    const wave = Math.sin((x + this.animationFrame * 10) / 10) * 3;
                    ctx.lineTo(this.x + x, this.y + y + wave);
                }
                ctx.stroke();
            }
        }
    }
}

/**
 * Door class for level exits
 */
class Door {
    constructor(x, y, doorType) {
        this.x = x;
        this.y = y;
        this.width = 35;
        this.height = 50;
        this.doorType = doorType; // 'fire' or 'water'
        this.type = OBJ_TYPE.DOOR;
        this.isActivated = false;
    }

    draw() {
        // Door color based on type
        const color = this.doorType === CHAR_TYPE.FIRE ? '#ff6b35' : '#4ecdc4';
        const darkColor = this.doorType === CHAR_TYPE.FIRE ? '#cc5529' : '#3da39a';
        
        // Door frame
        ctx.fillStyle = this.isActivated ? '#00ff00' : darkColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Door panels
        ctx.fillStyle = this.isActivated ? '#90ee90' : color;
        ctx.fillRect(this.x + 3, this.y + 3, this.width - 6, this.height - 6);
        
        // Door handle
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x + this.width - 10, this.y + this.height / 2 - 3, 4, 6);
        
        // Checkmark if activated
        if (this.isActivated) {
            ctx.strokeStyle = '#006600';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x + 10, this.y + this.height / 2);
            ctx.lineTo(this.x + 15, this.y + this.height / 2 + 8);
            ctx.lineTo(this.x + 25, this.y + this.height / 2 - 5);
            ctx.stroke();
        }
    }
}

/**
 * Switch class for activating doors
 */
class Switch {
    constructor(x, y, doorId) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 10;
        this.doorId = doorId; // ID of door this switch controls
        this.type = OBJ_TYPE.SWITCH;
        this.isPressed = false;
    }

    draw() {
        // Switch base
        ctx.fillStyle = '#555';
        ctx.fillRect(this.x - 5, this.y + this.height, this.width + 10, 5);
        
        // Switch button
        const buttonColor = this.isPressed ? '#00ff00' : '#ff0000';
        ctx.fillStyle = buttonColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Button shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 4);
    }
}

/**
 * Collectible class for bonus points
 */
class Collectible {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = OBJ_TYPE.COLLECTIBLE;
        this.collected = false;
        this.animationFrame = 0;
        this.points = 10;
    }

    draw() {
        if (this.collected) return;
        
        this.animationFrame += 0.1;
        const bounce = Math.sin(this.animationFrame) * 3;
        
        // Draw gem/crystal
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2 + bounce);
        ctx.rotate(this.animationFrame / 2);
        
        // Gem shape
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(7, -3);
        ctx.lineTo(7, 3);
        ctx.lineTo(0, 10);
        ctx.lineTo(-7, 3);
        ctx.lineTo(-7, -3);
        ctx.closePath();
        ctx.fill();
        
        // Gem shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.moveTo(-2, -6);
        ctx.lineTo(2, -6);
        ctx.lineTo(0, -2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

/**
 * Moving Platform class
 */
class MovingPlatform extends Platform {
    constructor(x, y, width, height, endX, endY, speed) {
        super(x, y, width, height);
        this.type = OBJ_TYPE.MOVING_PLATFORM;
        this.startX = x;
        this.startY = y;
        this.endX = endX;
        this.endY = endY;
        this.speed = speed;
        this.direction = 1; // 1 for forward, -1 for backward
    }

    update() {
        // Calculate movement direction
        const dx = this.endX - this.startX;
        const dy = this.endY - this.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        // Normalize and apply speed
        const moveX = (dx / distance) * this.speed * this.direction;
        const moveY = (dy / distance) * this.speed * this.direction;
        
        this.x += moveX;
        this.y += moveY;
        
        // Check if reached end point
        const distToEnd = Math.sqrt(
            Math.pow(this.x - this.endX, 2) + Math.pow(this.y - this.endY, 2)
        );
        const distToStart = Math.sqrt(
            Math.pow(this.x - this.startX, 2) + Math.pow(this.y - this.startY, 2)
        );
        
        // Reverse direction if at either endpoint
        if (distToEnd <= this.speed) {
            this.x = this.endX;
            this.y = this.endY;
            this.direction = -1;
        } else if (distToStart <= this.speed) {
            this.x = this.startX;
            this.y = this.startY;
            this.direction = 1;
        }
    }

    draw() {
        ctx.fillStyle = '#a0826d';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add arrows to show it's moving
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('↔', this.x + this.width / 2, this.y + this.height / 2 + 5);
    }
}

// ============================================
// LEVEL DEFINITIONS
// ============================================

const LEVELS = [
    // Level 1: Basic introduction to mechanics
    {
        name: "Level 1: The Beginning",
        fireBoyStart: { x: 50, y: 450 },
        waterGirlStart: { x: 100, y: 450 },
        objects: [
            // Floor
            new Platform(0, 500, 800, 100),
            // Platforms
            new Platform(200, 420, 150, 20),
            new Platform(450, 350, 150, 20),
            // Hazards
            new Hazard(350, 480, 100, 20, 'fire'),
            new Hazard(600, 480, 100, 20, 'water'),
            // Doors
            new Door(100, 450, CHAR_TYPE.FIRE),
            new Door(700, 450, CHAR_TYPE.WATER),
            // Collectibles
            new Collectible(275, 380),
            new Collectible(525, 310)
        ],
        doors: []
    },
    
    // Level 2: Switches and coordination
    {
        name: "Level 2: Teamwork",
        fireBoyStart: { x: 50, y: 250 },
        waterGirlStart: { x: 700, y: 250 },
        objects: [
            // Floors and platforms
            new Platform(0, 300, 200, 20),
            new Platform(600, 300, 200, 20),
            new Platform(250, 450, 300, 20),
            new Platform(0, 580, 800, 20),
            // Middle platform with switch
            new Platform(350, 200, 100, 20),
            // Hazards
            new Hazard(200, 560, 50, 20, 'fire'),
            new Hazard(300, 560, 50, 20, 'water'),
            new Hazard(450, 560, 50, 20, 'fire'),
            new Hazard(550, 560, 50, 20, 'water'),
            // Switches
            new Switch(375, 190, 0),
            // Doors
            new Door(50, 530, CHAR_TYPE.FIRE),
            new Door(720, 530, CHAR_TYPE.WATER),
            // Collectibles
            new Collectible(400, 160),
            new Collectible(400, 410),
            new Collectible(100, 540)
        ],
        doors: []
    },
    
    // Level 3: Moving platforms and complex puzzles
    {
        name: "Level 3: The Challenge",
        fireBoyStart: { x: 50, y: 450 },
        waterGirlStart: { x: 100, y: 450 },
        objects: [
            // Base floor
            new Platform(0, 500, 250, 100),
            new Platform(550, 500, 250, 100),
            // Platforms
            new Platform(300, 400, 100, 20),
            new Platform(500, 300, 100, 20),
            new Platform(200, 200, 100, 20),
            // Moving platforms
            new MovingPlatform(100, 350, 80, 15, 400, 350, 2),
            new MovingPlatform(600, 250, 80, 15, 300, 250, 1.5),
            // Hazards
            new Hazard(250, 480, 50, 20, 'water'),
            new Hazard(500, 480, 50, 20, 'fire'),
            new Hazard(300, 420, 200, 20, 'fire'),
            // Switches
            new Switch(225, 190, 0),
            new Switch(525, 290, 0),
            // Doors
            new Door(50, 450, CHAR_TYPE.FIRE),
            new Door(720, 450, CHAR_TYPE.WATER),
            // Collectibles
            new Collectible(350, 360),
            new Collectible(550, 260),
            new Collectible(250, 160),
            new Collectible(400, 180),
            new Collectible(150, 410)
        ],
        doors: []
    }
];

// ============================================
// GAME STATE AND INPUT HANDLING
// ============================================

/**
 * Main Game class managing all game logic
 */
class Game {
    constructor() {
        this.currentLevel = 0;
        this.score = 0;
        this.fireBoy = null;
        this.waterGirl = null;
        this.levelObjects = [];
        this.keys = {}; // Track pressed keys
        this.gameOver = false;
        this.levelComplete = false;
        
        // Initialize the first level
        this.loadLevel(this.currentLevel);
        
        // Set up input listeners
        this.setupInputHandlers();
        
        // Start the game loop
        this.gameLoop();
    }

    /**
     * Set up keyboard input handlers
     */
    setupInputHandlers() {
        // Track key presses
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Prevent arrow keys from scrolling the page
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });

        // Track key releases
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    /**
     * Load a specific level
     */
    loadLevel(levelIndex) {
        if (levelIndex >= LEVELS.length) {
            // All levels completed!
            this.showVictory();
            return;
        }

        const level = LEVELS[levelIndex];
        
        // Create characters at starting positions
        this.fireBoy = new Character(
            level.fireBoyStart.x,
            level.fireBoyStart.y,
            CHAR_TYPE.FIRE
        );
        
        this.waterGirl = new Character(
            level.waterGirlStart.x,
            level.waterGirlStart.y,
            CHAR_TYPE.WATER
        );

        // Load level objects
        this.levelObjects = level.objects;
        
        // Reset level state
        this.gameOver = false;
        this.levelComplete = false;
        
        // Update UI
        document.getElementById('current-level').textContent = levelIndex + 1;
    }

    /**
     * Process player input and move characters
     */
    handleInput() {
        // Fire Boy controls (Arrow Keys)
        if (this.keys['arrowleft']) {
            this.fireBoy.moveLeft();
        } else if (this.keys['arrowright']) {
            this.fireBoy.moveRight();
        } else {
            this.fireBoy.stopMoving();
        }

        if (this.keys['arrowup']) {
            this.fireBoy.jump();
        }

        // Water Girl controls (WASD)
        if (this.keys['a']) {
            this.waterGirl.moveLeft();
        } else if (this.keys['d']) {
            this.waterGirl.moveRight();
        } else {
            this.waterGirl.stopMoving();
        }

        if (this.keys['w']) {
            this.waterGirl.jump();
        }
    }

    /**
     * Check collision between a character and a rectangle object
     */
    checkCollision(char, obj) {
        return char.x < obj.x + obj.width &&
               char.x + char.width > obj.x &&
               char.y < obj.y + obj.height &&
               char.y + char.height > obj.y;
    }

    /**
     * Handle collisions between characters and game objects
     */
    handleCollisions() {
        const characters = [this.fireBoy, this.waterGirl];

        characters.forEach(char => {
            if (!char.isAlive) return;

            this.levelObjects.forEach(obj => {
                if (this.checkCollision(char, obj)) {
                    // Handle different object types
                    switch (obj.type) {
                        case OBJ_TYPE.PLATFORM:
                        case OBJ_TYPE.MOVING_PLATFORM:
                            this.handlePlatformCollision(char, obj);
                            break;
                        
                        case OBJ_TYPE.HAZARD:
                            this.handleHazardCollision(char, obj);
                            break;
                        
                        case OBJ_TYPE.DOOR:
                            this.handleDoorCollision(char, obj);
                            break;
                        
                        case OBJ_TYPE.SWITCH:
                            this.handleSwitchCollision(char, obj);
                            break;
                        
                        case OBJ_TYPE.COLLECTIBLE:
                            this.handleCollectibleCollision(char, obj);
                            break;
                    }
                }
            });
        });
    }

    /**
     * Handle platform collision (standing on platforms)
     */
    handlePlatformCollision(char, platform) {
        // Check if character is falling onto platform from above
        if (char.velocityY > 0 && 
            char.y + char.height - char.velocityY <= platform.y) {
            // Place character on top of platform
            char.y = platform.y - char.height;
            char.velocityY = 0;
            char.isOnGround = true;
            
            // If it's a moving platform, move character with it
            if (platform.type === OBJ_TYPE.MOVING_PLATFORM) {
                const dx = platform.endX - platform.startX;
                const dy = platform.endY - platform.startY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    char.x += (dx / distance) * platform.speed * platform.direction;
                }
            }
        }
        // Handle side collisions
        else if (char.velocityY >= 0) {
            // Push character out from side
            const overlapLeft = (char.x + char.width) - platform.x;
            const overlapRight = (platform.x + platform.width) - char.x;
            
            if (overlapLeft < overlapRight) {
                char.x = platform.x - char.width;
            } else {
                char.x = platform.x + platform.width;
            }
            char.velocityX = 0;
        }
    }

    /**
     * Handle hazard collision (fire/water pools)
     */
    handleHazardCollision(char, hazard) {
        // Check if character can survive this hazard
        if (!char.canSurviveHazard(hazard.hazardType)) {
            char.die();
        }
    }

    /**
     * Handle door collision (level exits)
     */
    handleDoorCollision(char, door) {
        // Character can only enter their matching door
        if (char.type === door.doorType) {
            char.hasReachedDoor = true;
        }
    }

    /**
     * Handle switch collision (activate doors)
     */
    handleSwitchCollision(char, switchObj) {
        // Activate the switch if character is standing on it from above
        // Check character is above the switch with some tolerance
        if (char.isOnGround && 
            char.y + char.height <= switchObj.y + 5 &&
            char.y + char.height >= switchObj.y - 5) {
            switchObj.isPressed = true;
        }
    }

    /**
     * Handle collectible collision (gems/crystals)
     */
    handleCollectibleCollision(char, collectible) {
        if (!collectible.collected) {
            collectible.collected = true;
            this.score += collectible.points;
            document.getElementById('score').textContent = this.score;
        }
    }

    /**
     * Check if level is complete (both characters at their doors)
     */
    checkLevelCompletion() {
        if (this.fireBoy.hasReachedDoor && this.waterGirl.hasReachedDoor) {
            this.levelComplete = true;
            // Wait a moment then load next level
            setTimeout(() => {
                this.currentLevel++;
                this.loadLevel(this.currentLevel);
            }, 1000);
        }
    }

    /**
     * Check if game is over (both characters dead)
     */
    checkGameOver() {
        if (!this.fireBoy.isAlive && !this.waterGirl.isAlive) {
            this.gameOver = true;
            this.showGameOver("Both players died!");
        }
    }

    /**
     * Update all game objects
     */
    update() {
        if (this.gameOver || this.levelComplete) return;

        // Handle player input
        this.handleInput();

        // Update characters
        this.fireBoy.update();
        this.waterGirl.update();

        // Update moving platforms
        this.levelObjects.forEach(obj => {
            if (obj.type === OBJ_TYPE.MOVING_PLATFORM) {
                obj.update();
            }
        });

        // Handle collisions
        this.handleCollisions();

        // Check win/lose conditions
        this.checkLevelCompletion();
        this.checkGameOver();
    }

    /**
     * Render all game objects
     */
    render() {
        // Clear canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw all level objects
        this.levelObjects.forEach(obj => obj.draw());

        // Draw characters
        this.fireBoy.draw();
        this.waterGirl.draw();

        // Draw level complete message
        if (this.levelComplete) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Level Complete!', canvas.width / 2, canvas.height / 2);
        }
    }

    /**
     * Main game loop
     */
    gameLoop() {
        this.update();
        this.render();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Show game over modal
     */
    showGameOver(message) {
        document.getElementById('death-message').textContent = message;
        document.getElementById('gameover-modal').classList.remove('hidden');
    }

    /**
     * Show victory modal
     */
    showVictory() {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('victory-modal').classList.remove('hidden');
    }

    /**
     * Restart current level
     */
    restartLevel() {
        document.getElementById('gameover-modal').classList.add('hidden');
        this.loadLevel(this.currentLevel);
    }

    /**
     * Restart entire game
     */
    restartGame() {
        document.getElementById('victory-modal').classList.add('hidden');
        this.currentLevel = 0;
        this.score = 0;
        document.getElementById('score').textContent = this.score;
        this.loadLevel(this.currentLevel);
    }
}

// ============================================
// START THE GAME
// ============================================

// Create and start the game when page loads
let game;
window.addEventListener('load', () => {
    game = new Game();
});
