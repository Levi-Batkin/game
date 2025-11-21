# Fire & Water - Cooperative Puzzle Game

A two-player cooperative puzzle platformer inspired by Fireboy and Watergirl. Navigate two unique characters through challenging levels, solve puzzles, avoid hazards, and reach the exit doors together!

## 🎮 Game Features

- **Two Unique Characters**: Control Fire Boy and Water Girl, each with unique hazard resistances
- **Cooperative Gameplay**: Both players must work together to complete levels
- **3 Challenging Levels**: Progressively difficult puzzles requiring coordination
- **Physics Engine**: Realistic gravity and collision detection
- **Interactive Elements**:
  - Switches and doors
  - Moving platforms
  - Deadly hazards (fire and water pools)
  - Collectible gems for bonus points
- **Victory & Game Over Screens**: Clear feedback and restart options

## 🕹️ How to Play

### Running the Game

1. Clone this repository or download the files
2. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
3. No installation or build process required!

### Controls

**Fire Boy (🔥)**
- **Arrow Keys**: Move left/right
- **Up Arrow**: Jump

**Water Girl (💧)**
- **A/D Keys**: Move left/right  
- **W Key**: Jump

### Game Rules

1. **Character Abilities**:
   - Fire Boy can safely walk through fire but dies in water
   - Water Girl can safely walk through water but dies in fire
   - Both characters die if they touch the wrong hazard

2. **Level Objectives**:
   - Navigate both characters to their matching colored doors
   - Fire Boy must reach the orange/red door
   - Water Girl must reach the blue/cyan door
   - Both must reach their doors to complete the level

3. **Collectibles**:
   - Collect golden gems for bonus points
   - Not required to complete levels but increase your score

4. **Switches**:
   - Stand on switches to activate doors or platforms
   - Some puzzles require coordinated timing

5. **Moving Platforms**:
   - Time your jumps carefully
   - Platforms move back and forth automatically

6. **Game Over**:
   - If both characters die, you must restart the level
   - Your score is preserved across level restarts

## 📁 File Structure

```
game/
├── index.html      # Main HTML structure
├── style.css       # Game styling and UI
├── game.js         # Game logic, physics, and mechanics
└── README.md       # This file
```

## 🎨 Technical Details

### Technologies Used
- **HTML5 Canvas**: For game rendering
- **Vanilla JavaScript**: Game engine and logic
- **CSS3**: UI styling and animations

### Key Features Implementation
- **Physics System**: Custom gravity and collision detection
- **Character Classes**: Object-oriented design for characters and game objects
- **Level System**: Modular level definitions for easy expansion
- **Input Handling**: Simultaneous two-player keyboard controls
- **Animation**: Smooth 60 FPS game loop using requestAnimationFrame

## 🔧 Customization

### Adding New Levels

Levels are defined in the `LEVELS` array in `game.js`. Each level includes:

```javascript
{
    name: "Level Name",
    fireBoyStart: { x: 50, y: 450 },
    waterGirlStart: { x: 100, y: 450 },
    objects: [
        new Platform(x, y, width, height),
        new Hazard(x, y, width, height, 'fire' or 'water'),
        new Door(x, y, CHAR_TYPE.FIRE or CHAR_TYPE.WATER),
        // ... more objects
    ]
}
```

### Adjusting Game Physics

Modify constants at the top of `game.js`:
- `GRAVITY`: Controls fall speed
- `JUMP_FORCE`: Height of jumps
- `MOVE_SPEED`: Character movement speed

## 📝 Code Documentation

The JavaScript code includes comprehensive inline comments explaining:
- Class structures and methods
- Game logic and algorithms
- Collision detection mechanisms
- Level progression system

## 🎯 Future Enhancement Ideas

- Add sound effects and background music
- Implement more level mechanics (teleporters, pressure plates, etc.)
- Add a level editor
- Include time-based scoring
- Add touch controls for mobile devices
- Implement save/load functionality

## 📄 License & Credits

This game is created as an educational project inspired by the Fireboy and Watergirl game series. No copyrighted assets or direct gameplay levels are duplicated.

All game assets are created programmatically using HTML5 Canvas and are free to use.

## 🐛 Known Issues

None currently. If you find any bugs, please report them!

## 🤝 Contributing

Feel free to fork this project and add your own levels, features, or improvements!

---

**Enjoy playing Fire & Water!** 🔥💧