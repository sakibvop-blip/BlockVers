// BLOCKVERSE: NEON RUSH - Shapes, Palettes & Intelligent Piece Generator

// Shape definitions using 2D binary matrices
const SHAPE_DEFINITIONS = [
  // 1-block Dot
  { id: "dot", matrix: [[1]], weight: 12 },

  // 2-block Line
  { id: "line2_h", matrix: [[1, 1]], weight: 14 },
  { id: "line2_v", matrix: [[1], [1]], weight: 14 },

  // 3-block Line
  { id: "line3_h", matrix: [[1, 1, 1]], weight: 12 },
  { id: "line3_v", matrix: [[1], [1], [1]], weight: 12 },

  // 4-block Line
  { id: "line4_h", matrix: [[1, 1, 1, 1]], weight: 8 },
  { id: "line4_v", matrix: [[1], [1], [1], [1]], weight: 8 },

  // 5-block Line
  { id: "line5_h", matrix: [[1, 1, 1, 1, 1]], weight: 5 },
  { id: "line5_v", matrix: [[1], [1], [1], [1], [1]], weight: 5 },

  // 2x2 Square
  { id: "square2", matrix: [[1, 1], [1, 1]], weight: 12 },

  // 3x3 Square
  { id: "square3", matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], weight: 4 },

  // Small Corner 2x2 (3 blocks)
  { id: "corner_tl", matrix: [[1, 1], [1, 0]], weight: 10 },
  { id: "corner_tr", matrix: [[1, 1], [0, 1]], weight: 10 },
  { id: "corner_bl", matrix: [[1, 0], [1, 1]], weight: 10 },
  { id: "corner_br", matrix: [[0, 1], [1, 1]], weight: 10 },

  // Big Corner 3x3 (5 blocks)
  { id: "big_corner_tl", matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], weight: 5 },
  { id: "big_corner_tr", matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], weight: 5 },
  { id: "big_corner_bl", matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], weight: 5 },
  { id: "big_corner_br", matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], weight: 5 },

  // L-Shapes (4 blocks: 3x2)
  { id: "L1", matrix: [[1, 0], [1, 0], [1, 1]], weight: 8 },
  { id: "L2", matrix: [[0, 1], [0, 1], [1, 1]], weight: 8 },
  { id: "L3", matrix: [[1, 1, 1], [1, 0, 0]], weight: 8 },
  { id: "L4", matrix: [[1, 1, 1], [0, 0, 1]], weight: 8 },
  { id: "L5", matrix: [[1, 1], [0, 1], [0, 1]], weight: 8 },
  { id: "L6", matrix: [[1, 1], [1, 0], [1, 0]], weight: 8 },
  { id: "L7", matrix: [[0, 0, 1], [1, 1, 1]], weight: 8 },
  { id: "L8", matrix: [[1, 0, 0], [1, 1, 1]], weight: 8 },

  // T-Shapes (4 blocks: 3x2)
  { id: "T1", matrix: [[1, 1, 1], [0, 1, 0]], weight: 7 },
  { id: "T2", matrix: [[0, 1, 0], [1, 1, 1]], weight: 7 },
  { id: "T3", matrix: [[1, 0], [1, 1], [1, 0]], weight: 7 },
  { id: "T4", matrix: [[0, 1], [1, 1], [0, 1]], weight: 7 },

  // Z & S Shapes (4 blocks)
  { id: "Z1", matrix: [[1, 1, 0], [0, 1, 1]], weight: 6 },
  { id: "Z2", matrix: [[0, 1], [1, 1], [1, 0]], weight: 6 },
  { id: "S1", matrix: [[0, 1, 1], [1, 1, 0]], weight: 6 },
  { id: "S2", matrix: [[1, 0], [1, 1], [0, 1]], weight: 6 },

  // Plus shape (5 blocks)
  { id: "plus", matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], weight: 5 },

  // U shape (5 blocks)
  { id: "U_up", matrix: [[1, 0, 1], [1, 1, 1]], weight: 4 },
  { id: "U_down", matrix: [[1, 1, 1], [1, 0, 1]], weight: 4 }
];

// Themes configuration
const THEMES = {
  cyber_neon: {
    id: "cyber_neon",
    name: "Cyber Neon",
    price: 0,
    unlocked: true,
    bgGrad: ["#090d20", "#04060f"],
    gridBg: "rgba(14, 21, 50, 0.65)",
    cellEmpty: "rgba(22, 33, 76, 0.45)",
    gridBorder: "rgba(0, 240, 255, 0.35)",
    glowColor: "#00f0ff",
    colors: [
      { main: "#00f0ff", light: "#80f8ff", dark: "#008ca0", glow: "rgba(0, 240, 255, 0.8)" }, // Electric Blue
      { main: "#b026ff", light: "#d780ff", dark: "#670ea8", glow: "rgba(176, 38, 255, 0.8)" }, // Cyber Purple
      { main: "#39ff14", light: "#9eff88", dark: "#188a00", glow: "rgba(57, 255, 20, 0.8)" },  // Neon Green
      { main: "#ff7700", light: "#ffb066", dark: "#a64400", glow: "rgba(255, 119, 0, 0.8)" },  // Energy Orange
      { main: "#ff007f", light: "#ff73b8", dark: "#a3004f", glow: "rgba(255, 0, 127, 0.8)" },  // Plasma Pink
      { main: "#ffe600", light: "#fff373", dark: "#a39200", glow: "rgba(255, 230, 0, 0.8)" },  // Golden Yellow
      { main: "#00e5ff", light: "#7df2ff", dark: "#008999", glow: "rgba(0, 229, 255, 0.8)" }   // Ice Cyan
    ]
  },
  galaxy: {
    id: "galaxy",
    name: "Galaxy",
    price: 500,
    unlocked: false,
    bgGrad: ["#140826", "#05020c"],
    gridBg: "rgba(28, 14, 52, 0.65)",
    cellEmpty: "rgba(42, 23, 79, 0.45)",
    gridBorder: "rgba(184, 92, 255, 0.35)",
    glowColor: "#b85cff",
    colors: [
      { main: "#9d4edd", light: "#c77dff", dark: "#5a189a", glow: "rgba(157, 78, 221, 0.8)" },
      { main: "#ff5400", light: "#ff8500", dark: "#9e2a2b", glow: "rgba(255, 84, 0, 0.8)" },
      { main: "#4cc9f0", light: "#72efdd", dark: "#4361ee", glow: "rgba(76, 201, 240, 0.8)" },
      { main: "#f72585", light: "#ff70a6", dark: "#7209b7", glow: "rgba(247, 37, 133, 0.8)" },
      { main: "#ffd166", light: "#ffe39f", dark: "#c79822", glow: "rgba(255, 209, 102, 0.8)" },
      { main: "#06d6a0", light: "#6ef3d6", dark: "#028060", glow: "rgba(6, 214, 160, 0.8)" },
      { main: "#e0aaff", light: "#f3d8ff", dark: "#7b2cbf", glow: "rgba(224, 170, 255, 0.8)" }
    ]
  },
  ocean: {
    id: "ocean",
    name: "Ocean Deep",
    price: 600,
    unlocked: false,
    bgGrad: ["#021b2b", "#010912"],
    gridBg: "rgba(4, 39, 61, 0.65)",
    cellEmpty: "rgba(9, 56, 88, 0.45)",
    gridBorder: "rgba(0, 210, 255, 0.35)",
    glowColor: "#00d2ff",
    colors: [
      { main: "#00b4d8", light: "#90e0ef", dark: "#0077b6", glow: "rgba(0, 180, 216, 0.8)" },
      { main: "#0077b6", light: "#48cae4", dark: "#03045e", glow: "rgba(0, 119, 182, 0.8)" },
      { main: "#52b788", light: "#74c69d", dark: "#2d6a4f", glow: "rgba(82, 183, 136, 0.8)" },
      { main: "#06d6a0", light: "#80ffdb", dark: "#089772", glow: "rgba(6, 214, 160, 0.8)" },
      { main: "#00f5d4", light: "#7bf1a8", dark: "#009e86", glow: "rgba(0, 245, 212, 0.8)" },
      { main: "#64dfdf", light: "#c2ffff", dark: "#4895ef", glow: "rgba(100, 223, 223, 0.8)" },
      { main: "#3a86ff", light: "#8cb9ff", dark: "#0047ab", glow: "rgba(58, 134, 255, 0.8)" }
    ]
  },
  sunset: {
    id: "sunset",
    name: "Cyber Sunset",
    price: 800,
    unlocked: false,
    bgGrad: ["#240d1e", "#0a040b"],
    gridBg: "rgba(51, 19, 42, 0.65)",
    cellEmpty: "rgba(77, 28, 64, 0.45)",
    gridBorder: "rgba(255, 107, 107, 0.35)",
    glowColor: "#ff6b6b",
    colors: [
      { main: "#ff5964", light: "#ff9097", dark: "#b31a26", glow: "rgba(255, 89, 100, 0.8)" },
      { main: "#fca311", light: "#ffc966", dark: "#aa6400", glow: "rgba(252, 163, 17, 0.8)" },
      { main: "#ff007f", light: "#ff66b2", dark: "#99004c", glow: "rgba(255, 0, 127, 0.8)" },
      { main: "#e056fd", light: "#ee90ff", dark: "#911bb5", glow: "rgba(224, 86, 253, 0.8)" },
      { main: "#ff758c", light: "#ffa8b6", dark: "#b52b42", glow: "rgba(255, 117, 140, 0.8)" },
      { main: "#ffb703", light: "#ffd166", dark: "#b37b00", glow: "rgba(255, 183, 3, 0.8)" },
      { main: "#fb5607", light: "#ff8c52", dark: "#aa2e00", glow: "rgba(251, 86, 7, 0.8)" }
    ]
  },
  candy: {
    id: "candy",
    name: "Sugar Rush",
    price: 1000,
    unlocked: false,
    bgGrad: ["#1c0f24", "#0a0510"],
    gridBg: "rgba(42, 21, 56, 0.65)",
    cellEmpty: "rgba(66, 32, 88, 0.45)",
    gridBorder: "rgba(255, 133, 227, 0.35)",
    glowColor: "#ff85e3",
    colors: [
      { main: "#ff4d8d", light: "#ff8cb4", dark: "#ab0f46", glow: "rgba(255, 77, 141, 0.8)" },
      { main: "#48cae4", light: "#a0eaf7", dark: "#0077b6", glow: "rgba(72, 202, 228, 0.8)" },
      { main: "#a7ff83", light: "#ccffb3", dark: "#5bb836", glow: "rgba(167, 255, 131, 0.8)" },
      { main: "#ffb703", light: "#ffdc73", dark: "#ba7d00", glow: "rgba(255, 183, 3, 0.8)" },
      { main: "#c77dff", light: "#e0aaff", dark: "#7b2cbf", glow: "rgba(199, 125, 255, 0.8)" },
      { main: "#ff8fab", light: "#ffc2d1", dark: "#b54460", glow: "rgba(255, 143, 171, 0.8)" },
      { main: "#ffd166", light: "#ffe8a3", dark: "#b3891b", glow: "rgba(255, 209, 102, 0.8)" }
    ]
  },
  matrix: {
    id: "matrix",
    name: "Matrix Core",
    price: 1200,
    unlocked: false,
    bgGrad: ["#021808", "#010803"],
    gridBg: "rgba(4, 38, 14, 0.65)",
    cellEmpty: "rgba(8, 61, 22, 0.45)",
    gridBorder: "rgba(0, 255, 65, 0.35)",
    glowColor: "#00ff41",
    colors: [
      { main: "#00ff41", light: "#73ff94", dark: "#008c23", glow: "rgba(0, 255, 65, 0.8)" },
      { main: "#00e676", light: "#72f9b1", dark: "#008a41", glow: "rgba(0, 230, 118, 0.8)" },
      { main: "#76ff03", light: "#b7ff70", dark: "#469e00", glow: "rgba(118, 255, 3, 0.8)" },
      { main: "#00f0ff", light: "#85f7ff", dark: "#008ca0", glow: "rgba(0, 240, 255, 0.8)" },
      { main: "#c6ff00", light: "#e2ff73", dark: "#7aa300", glow: "rgba(198, 255, 0, 0.8)" },
      { main: "#1de9b6", light: "#85f7db", dark: "#00916d", glow: "rgba(29, 233, 182, 0.8)" },
      { main: "#a7ffeb", light: "#e0fff8", dark: "#38a88e", glow: "rgba(167, 255, 235, 0.8)" }
    ]
  },
  volcanic: {
    id: "volcanic",
    name: "Volcanic Magma",
    price: 1500,
    unlocked: false,
    bgGrad: ["#210904", "#0b0301"],
    gridBg: "rgba(51, 14, 6, 0.65)",
    cellEmpty: "rgba(82, 23, 10, 0.45)",
    gridBorder: "rgba(255, 69, 0, 0.35)",
    glowColor: "#ff4500",
    colors: [
      { main: "#ff3d00", light: "#ff8259", dark: "#ad2200", glow: "rgba(255, 61, 0, 0.8)" },
      { main: "#ff9100", light: "#ffbf66", dark: "#ab5c00", glow: "rgba(255, 145, 0, 0.8)" },
      { main: "#ff0055", light: "#ff6699", dark: "#9e0033", glow: "rgba(255, 0, 85, 0.8)" },
      { main: "#ffd600", light: "#ffe766", dark: "#a38600", glow: "rgba(255, 214, 0, 0.8)" },
      { main: "#dd2c00", light: "#ff6e40", dark: "#8c1500", glow: "rgba(221, 44, 0, 0.8)" },
      { main: "#ff5722", light: "#ff8a65", dark: "#b52c00", glow: "rgba(255, 87, 34, 0.8)" },
      { main: "#ffab00", light: "#ffcd66", dark: "#ad7000", glow: "rgba(255, 171, 0, 0.8)" }
    ]
  },
  ice: {
    id: "ice",
    name: "Glacial Frost",
    price: 1800,
    unlocked: false,
    bgGrad: ["#071a2b", "#02070e"],
    gridBg: "rgba(14, 43, 71, 0.65)",
    cellEmpty: "rgba(24, 68, 110, 0.45)",
    gridBorder: "rgba(142, 227, 255, 0.35)",
    glowColor: "#8ee3ff",
    colors: [
      { main: "#a0e8ff", light: "#d6f5ff", dark: "#4a9eb8", glow: "rgba(160, 232, 255, 0.8)" },
      { main: "#4cc9f0", light: "#8ee4ff", dark: "#187799", glow: "rgba(76, 201, 240, 0.8)" },
      { main: "#caf0f8", light: "#ffffff", dark: "#74a5b0", glow: "rgba(202, 240, 248, 0.8)" },
      { main: "#00b4d8", light: "#62d8f2", dark: "#006d82", glow: "rgba(0, 180, 216, 0.8)" },
      { main: "#bde0fe", light: "#e8f4ff", dark: "#6389ad", glow: "rgba(189, 224, 254, 0.8)" },
      { main: "#90e0ef", light: "#cff4fc", dark: "#3c8694", glow: "rgba(144, 224, 239, 0.8)" },
      { main: "#70e000", light: "#abff4f", dark: "#418500", glow: "rgba(112, 224, 0, 0.8)" }
    ]
  },
  golden: {
    id: "golden",
    name: "Aura Royale",
    price: 2500,
    unlocked: false,
    bgGrad: ["#241b08", "#0d0901"],
    gridBg: "rgba(56, 42, 13, 0.65)",
    cellEmpty: "rgba(87, 65, 20, 0.45)",
    gridBorder: "rgba(255, 215, 0, 0.35)",
    glowColor: "#ffd700",
    colors: [
      { main: "#ffd700", light: "#fff085", dark: "#ad8c00", glow: "rgba(255, 215, 0, 0.8)" },
      { main: "#ffb703", light: "#ffd966", dark: "#b37b00", glow: "rgba(255, 183, 3, 0.8)" },
      { main: "#fb8500", light: "#ffb04f", dark: "#ab5400", glow: "rgba(251, 133, 0, 0.8)" },
      { main: "#e0a96d", light: "#f0cca6", dark: "#8c602e", glow: "rgba(224, 169, 109, 0.8)" },
      { main: "#ffeaa7", light: "#fff6d9", dark: "#a89452", glow: "rgba(255, 234, 167, 0.8)" },
      { main: "#f39c12", light: "#f8c471", dark: "#9c5e00", glow: "rgba(243, 156, 18, 0.8)" },
      { main: "#f1c40f", light: "#f9e79f", dark: "#947600", glow: "rgba(241, 196, 15, 0.8)" }
    ]
  },
  dark_mode: {
    id: "dark_mode",
    name: "Obsidian Stealth",
    price: 3000,
    unlocked: false,
    bgGrad: ["#0b0b0d", "#020203"],
    gridBg: "rgba(20, 20, 24, 0.65)",
    cellEmpty: "rgba(35, 35, 42, 0.45)",
    gridBorder: "rgba(100, 105, 120, 0.35)",
    glowColor: "#a0a5b8",
    colors: [
      { main: "#4a5568", light: "#718096", dark: "#2d3748", glow: "rgba(113, 128, 150, 0.8)" },
      { main: "#00b4d8", light: "#48cae4", dark: "#0077b6", glow: "rgba(72, 202, 228, 0.8)" },
      { main: "#ff007f", light: "#ff66b2", dark: "#99004c", glow: "rgba(255, 0, 127, 0.8)" },
      { main: "#39ff14", light: "#80ff66", dark: "#1e8707", glow: "rgba(57, 255, 20, 0.8)" },
      { main: "#ffe600", light: "#fff066", dark: "#998a00", glow: "rgba(255, 230, 0, 0.8)" },
      { main: "#b026ff", light: "#d073ff", dark: "#600799", glow: "rgba(176, 38, 255, 0.8)" },
      { main: "#e2e8f0", light: "#ffffff", dark: "#94a3b8", glow: "rgba(226, 232, 240, 0.8)" }
    ]
  }
};

// SPECIAL BLOCKS DEFINITIONS (Blockverse 2.0)
const SPECIAL_BLOCKS = {
  bomb: { type: "bomb", icon: "💣", name: "Bomb Block", desc: "Explodes 3x3 surrounding blocks on clear", color: "#ff3300" },
  rainbow: { type: "rainbow", icon: "🌈", name: "Rainbow Block", desc: "Clears all blocks of adjacent colors", color: "#ff007f" },
  lightning: { type: "lightning", icon: "⚡", name: "Lightning Block", desc: "Clears its entire row and column", color: "#ffe600" },
  ice: { type: "ice", icon: "❄️", name: "Ice Block", hits: 2, desc: "Requires 2 clears to shatter", color: "#7df2ff" },
  multiplier: { type: "multiplier", icon: "✖️", mult: 2, name: "2x Multiplier", desc: "Doubles the score of any cleared line", color: "#ffd700" },
  wild: { type: "wild", icon: "⭐", name: "Wild Block", desc: "Universal connector with bonus points", color: "#39ff14" }
};

// 7-DAY DAILY REWARDS CALENDAR
const DAILY_7DAY_REWARDS = [
  { day: 1, icon: "🪙", coins: 200, gems: 5, powerup: null, label: "200 Coins + 5 Gems" },
  { day: 2, icon: "🔄", coins: 350, gems: 5, powerup: "shuffle", label: "350 Coins + 1 Shuffle" },
  { day: 3, icon: "🔨", coins: 500, gems: 10, powerup: "hammer", label: "500 Coins + 1 Hammer" },
  { day: 4, icon: "⚡", coins: 750, gems: 15, powerup: "lightning", label: "750 Coins + 1 Lightning" },
  { day: 5, icon: "💣", coins: 1000, gems: 25, powerup: "colorbomb", label: "1000 Coins + 1 Color Bomb" },
  { day: 6, icon: "↩️", coins: 1500, gems: 35, powerup: "undo", label: "1500 Coins + 2 Undos" },
  { day: 7, icon: "👑", coins: 3000, gems: 100, skin: "gold_royalty", label: "3000 Coins + 100 Gems + Gold Skin!" }
];

// COLLECTION & CUSTOMIZATION SYSTEM
const COLLECTIONS = {
  skins: [
    { id: "cyber_neon", name: "Cyber Neon", type: "skin", price: 0, unlocked: true, preview: "#00f0ff" },
    { id: "synthwave", name: "Retro Synth", type: "skin", price: 400, unlocked: false, preview: "#ff007f" },
    { id: "gold_royalty", name: "Gold Royalty", type: "skin", price: 1200, unlocked: false, preview: "#ffd700" },
    { id: "obsidian_matrix", name: "Obsidian Core", type: "skin", price: 800, unlocked: false, preview: "#39ff14" },
    { id: "cosmic_nebula", name: "Cosmic Nebula", type: "skin", price: 1000, unlocked: false, preview: "#b026ff" },
    { id: "plasma_magma", name: "Plasma Magma", type: "skin", price: 1500, unlocked: false, preview: "#ff5500" }
  ],
  boards: [
    { id: "midnight_grid", name: "Midnight Cyber", type: "board", price: 0, unlocked: true, preview: "#0e1638" },
    { id: "cyberpunk_neon", name: "Cyberpunk Alley", type: "board", price: 500, unlocked: false, preview: "#1f092b" },
    { id: "matrix_holo", name: "Matrix Data", type: "board", price: 750, unlocked: false, preview: "#041a0d" },
    { id: "void_hyper", name: "Void Hologram", type: "board", price: 1000, unlocked: false, preview: "#03040c" }
  ],
  particles: [
    { id: "neon_sparks", name: "Neon Sparks", type: "particle", price: 0, unlocked: true, preview: "⚡" },
    { id: "stardust", name: "Stardust Stars", type: "particle", price: 400, unlocked: false, preview: "✨" },
    { id: "voxels", name: "Digital Voxels", type: "particle", price: 600, unlocked: false, preview: "🧊" },
    { id: "plasma_orbs", name: "Plasma Orbs", type: "particle", price: 800, unlocked: false, preview: "🔮" }
  ],
  trails: [
    { id: "laser_pulse", name: "Laser Pulse", type: "trail", price: 0, unlocked: true, preview: "💠" },
    { id: "rainbow_stream", name: "Rainbow Stream", type: "trail", price: 500, unlocked: false, preview: "🌈" },
    { id: "fire_magma", name: "Fire Magma", type: "trail", price: 750, unlocked: false, preview: "🔥" },
    { id: "electric_spark", name: "Electric Arc", type: "trail", price: 900, unlocked: false, preview: "⚡" }
  ]
};

// Intelligent Piece Generator
class PieceGenerator {
  constructor() {
    this.history = [];
  }

  // Returns true if shape can fit somewhere on board
  canFit(grid, matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    for (let r = 0; r <= 10 - rows; r++) {
      for (let c = 0; c <= 10 - cols; c++) {
        let valid = true;
        for (let dr = 0; dr < rows; dr++) {
          for (let dc = 0; dc < cols; dc++) {
            if (matrix[dr][dc] && grid[r + dr][c + dc] !== null) {
              valid = false;
              break;
            }
          }
          if (!valid) break;
        }
        if (valid) return true;
      }
    }
    return false;
  }

  // Calculate board occupancy density
  getBoardDensity(grid) {
    let filled = 0;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (grid[r][c] !== null) filled++;
      }
    }
    return filled / 100;
  }

  // Generate 3 pieces with Smart Difficulty & Special Blocks
  generateSet(grid, currentTheme, playerLevel = 1, currentScore = 0) {
    const pieces = [];
    const availableShapes = [...SHAPE_DEFINITIONS];
    const density = this.getBoardDensity(grid);

    // Smart Difficulty: If board is congested (> 65% full), boost small life-saving shapes!
    let guaranteedFit = false;

    const adjustedWeights = availableShapes.map(s => {
      let weight = s.weight;
      // If density is high (> 60%), dramatically boost small pieces (1x1, 1x2, 2x2)
      if (density > 0.60) {
        if (s.id === "dot" || s.id.includes("line2") || s.id === "square2") {
          weight *= 2.8;
        } else if (s.id.includes("big") || s.id === "square3" || s.id === "plus") {
          weight *= 0.15;
        }
      } else {
        if (s.id.includes("big") || s.id === "square3" || s.id === "plus" || s.id.includes("U_")) {
          if (playerLevel < 4) weight *= 0.35;
        }
      }

      const fits = this.canFit(grid, s.matrix);
      if (!fits) {
        weight *= 0.12;
      } else {
        weight *= 1.4;
      }
      return { shape: s, weight: Math.max(1, weight), fits };
    });

    for (let i = 0; i < 3; i++) {
      let chosenShape = null;

      // Guaranteed fit on 3rd piece if previous pieces don't fit
      if (i === 2 && !guaranteedFit) {
        const fittingShapes = adjustedWeights.filter(w => w.fits);
        if (fittingShapes.length > 0) {
          const totalFittingWeight = fittingShapes.reduce((acc, curr) => acc + curr.weight, 0);
          let rnd = Math.random() * totalFittingWeight;
          for (const item of fittingShapes) {
            rnd -= item.weight;
            if (rnd <= 0) {
              chosenShape = item.shape;
              guaranteedFit = true;
              break;
            }
          }
          if (!chosenShape) chosenShape = fittingShapes[0].shape;
        }
      }

      if (!chosenShape) {
        const totalWeight = adjustedWeights.reduce((acc, curr) => acc + curr.weight, 0);
        let rnd = Math.random() * totalWeight;
        for (const item of adjustedWeights) {
          rnd -= item.weight;
          if (rnd <= 0) {
            chosenShape = item.shape;
            if (item.fits) guaranteedFit = true;
            break;
          }
        }
        if (!chosenShape) chosenShape = availableShapes[Math.floor(Math.random() * availableShapes.length)];
      }

      // Special Block assignment (Bomb, Rainbow, Lightning, Ice, Multiplier, Wild)
      // Probability scales with level or density:
      const specialChance = density > 0.65 ? 0.35 : Math.min(0.28, 0.08 + playerLevel * 0.03 + (currentScore > 3000 ? 0.06 : 0));
      let specialType = null;

      if (Math.random() < specialChance) {
        const types = ["bomb", "lightning", "rainbow", "multiplier", "wild", "ice"];
        specialType = types[Math.floor(Math.random() * types.length)];
      }

      // Matrix cloning with special block embedding
      const pieceMatrix = chosenShape.matrix.map(row => [...row]);
      let specialCellAssigned = false;

      if (specialType) {
        // Find a random filled cell in the matrix to convert into special block
        const filledCoords = [];
        for (let r = 0; r < pieceMatrix.length; r++) {
          for (let c = 0; c < pieceMatrix[r].length; c++) {
            if (pieceMatrix[r][c] === 1) filledCoords.push({ r, c });
          }
        }
        if (filledCoords.length > 0) {
          const target = filledCoords[Math.floor(Math.random() * filledCoords.length)];
          pieceMatrix[target.r][target.c] = {
            special: specialType,
            hits: specialType === "ice" ? 2 : 1
          };
          specialCellAssigned = true;
        }
      }

      const colorIndex = Math.floor(Math.random() * currentTheme.colors.length);

      pieces.push({
        id: "piece_" + Date.now() + "_" + i + "_" + Math.floor(Math.random() * 1000),
        shapeId: chosenShape.id,
        matrix: pieceMatrix,
        colorIndex: colorIndex,
        hasSpecial: specialCellAssigned,
        specialType: specialCellAssigned ? specialType : null,
        placed: false
      });
    }

    return pieces;
  }
}
