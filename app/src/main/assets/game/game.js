// BLOCKVERSE: NEON RUSH - Core Game Logic & Controller

class BlockverseGame {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.fxCanvas = document.getElementById("fx-canvas");
    this.fxCtx = this.fxCanvas ? this.fxCanvas.getContext("2d") : null;

    this.ps = new ParticleSystem();
    this.pieceGen = new PieceGenerator();

    // Game state
    this.grid = Array(10).fill(null).map(() => Array(10).fill(null));
    this.currentMode = "classic"; // classic, timerush, zen
    this.currentTheme = THEMES.cyber_neon;
    this.currentLang = "en";

    this.score = 0;
    this.bestScore = 0;
    this.linesCleared = 0;
    this.currentCombo = 1;
    this.maxCombo = 1;
    this.comboTimer = 0;
    this.comboDecayTime = 6000; // ms
    this.lastClearTime = 0;

    // Blockverse 2.0 Career Profile Stats
    this.userAvatar = "⚡";
    this.totalGamesPlayed = 0;
    this.totalLinesCleared = 0;
    this.totalBlocksPlaced = 0;
    this.longestChain = 1;
    this.dailyStreak = 1;
    this.dailyRewardDay = 1;
    this.lastDailyRewardDate = null;

    // Blockverse 2.0 Fever Mode
    this.isFeverActive = false;
    this.feverTimeRemaining = 0;
    this.screenShakeEnabled = true;

    // Blockverse 2.0 Collections
    this.equippedSkin = "cyber_neon";
    this.equippedBoard = "midnight_grid";
    this.equippedParticle = "neon_sparks";
    this.equippedTrail = "laser_pulse";

    // Progression
    this.coins = 250;
    this.gems = 15;
    this.xp = 0;
    this.level = 1;
    this.levelTitles = ["Beginner", "Rookie", "Block Runner", "Neon Master", "Block Legend", "Cyber God"];

    // Tray pieces
    this.trayPieces = [];

    // Dragging state
    this.draggingPiece = null;
    this.dragSlotIndex = -1;
    this.screenClientX = 0;
    this.screenClientY = 0;
    this.pointerX = 0;
    this.pointerY = 0;
    this.isDragging = false;
    this.dragOffsetY = 75; // Dynamically adjusted on resize
    this.hoverCol = -1;
    this.hoverRow = -1;
    this.isValidHover = false;
    this.gameOverTimeout = null;

    // Power-ups
    this.powerups = {
      hammer: 3,
      lightning: 2,
      colorbomb: 2,
      shuffle: 3,
      undo: 3,
      magnet: 1
    };
    this.activePowerup = null;

    // Undo state
    this.undoHistory = null;

    // Time rush mode timer
    this.timeRemaining = 120; // seconds
    this.timeRushInterval = null;

    // Daily Challenge
    this.dailyObjective = { type: "lines", target: 12, current: 0, completed: false };

    // Missions
    this.missions = [
      { id: "m1", text: "Clear 15 Lines", target: 15, current: 0, reward: 200, claimed: false },
      { id: "m2", text: "Make 5 Combos", target: 5, current: 0, reward: 300, claimed: false },
      { id: "m3", text: "Score 3,000 Points", target: 3000, current: 0, reward: 500, claimed: false },
      { id: "m4", text: "Use 3 Power-Ups", target: 3, current: 0, reward: 250, claimed: false },
      { id: "m5", text: "Make a 3-Line Clear", target: 1, current: 0, reward: 400, claimed: false }
    ];

    // Achievements
    this.achievements = [
      { id: "first_block", title: "FIRST BLOCK", desc: "Place your first block", unlocked: false, rewardGems: 2 },
      { id: "first_clear", title: "FIRST CLEAR", desc: "Clear your first line", unlocked: false, rewardGems: 5 },
      { id: "combo_master", title: "COMBO MASTER", desc: "Reach a 4x Combo streak", unlocked: false, rewardGems: 10 },
      { id: "line_destroyer", title: "LINE DESTROYER", desc: "Clear 50 total lines", unlocked: false, rewardGems: 15 },
      { id: "super_clear", title: "SUPER CLEAR", desc: "Clear 3+ lines in a single move", unlocked: false, rewardGems: 20 },
      { id: "club_10k", title: "10K CLUB", desc: "Score over 10,000 points", unlocked: false, rewardGems: 25 },
      { id: "power_surge", title: "POWER SURGE", desc: "Use 10 tactical power-ups", unlocked: false, rewardGems: 15 },
      { id: "block_legend", title: "BLOCK LEGEND", desc: "Reach Player Level 10", unlocked: false, rewardGems: 50 }
    ];

    // Leaderboard
    this.leaderboard = [
      { rank: 1, name: "CYBER_NINJA", score: 28450, level: 32, avatar: "⚡" },
      { rank: 2, name: "NEON_VORTEX", score: 24100, level: 28, avatar: "🔥" },
      { rank: 3, name: "GLITCH_KING", score: 19800, level: 22, avatar: "👑" },
      { rank: 4, name: "QUANTUM_DROP", score: 16500, level: 19, avatar: "💎" },
      { rank: 5, name: "SYNTH_PULSE", score: 14200, level: 16, avatar: "🌌" },
      { rank: 6, name: "YOU", score: 0, level: 1, avatar: "B", isUser: true }
    ];

    // Layout
    this.cellSize = 0;
    this.boardOffsetLeft = 0;
    this.boardOffsetTop = 0;

    this.isPaused = false;
    this.isGameOver = false;

    this.loadSavedData();
    this.setupEventListeners();
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    // Hide preloader after 600ms
    setTimeout(() => {
      const preloader = document.getElementById("preloader");
      if (preloader) {
        preloader.style.opacity = "0";
        setTimeout(() => preloader.style.display = "none", 500);
      }
    }, 600);

    // Start 60 FPS animation loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  loadSavedData() {
    try {
      const data = localStorage.getItem("BLOCKVERSE_SAVE_V1");
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.bestScore) this.bestScore = parsed.bestScore;
        if (parsed.coins !== undefined) this.coins = parsed.coins;
        if (parsed.gems !== undefined) this.gems = parsed.gems;
        if (parsed.xp !== undefined) this.xp = parsed.xp;
        if (parsed.level !== undefined) this.level = parsed.level;
        if (parsed.themeId && THEMES[parsed.themeId]) this.currentTheme = THEMES[parsed.themeId];
        if (parsed.powerups) this.powerups = Object.assign(this.powerups, parsed.powerups);
        if (parsed.achievements) {
          parsed.achievements.forEach(sa => {
            const found = this.achievements.find(a => a.id === sa.id);
            if (found) found.unlocked = sa.unlocked;
          });
        }
        if (parsed.lang) this.currentLang = parsed.lang;
        if (parsed.unlockedThemes) {
          parsed.unlockedThemes.forEach(tid => {
            if (THEMES[tid]) THEMES[tid].unlocked = true;
          });
        }
        if (parsed.sfx !== undefined) SOUND.sfxEnabled = parsed.sfx;
        if (parsed.music !== undefined) SOUND.musicEnabled = parsed.music;
        if (parsed.vibration !== undefined) SOUND.vibrationEnabled = parsed.vibration;
        // 2.0 Persistence
        if (parsed.userAvatar) this.userAvatar = parsed.userAvatar;
        if (parsed.totalGamesPlayed) this.totalGamesPlayed = parsed.totalGamesPlayed;
        if (parsed.totalLinesCleared) this.totalLinesCleared = parsed.totalLinesCleared;
        if (parsed.totalBlocksPlaced) this.totalBlocksPlaced = parsed.totalBlocksPlaced;
        if (parsed.longestChain) this.longestChain = parsed.longestChain;
        if (parsed.dailyStreak) this.dailyStreak = parsed.dailyStreak;
        if (parsed.dailyRewardDay) this.dailyRewardDay = parsed.dailyRewardDay;
        if (parsed.lastDailyRewardDate) this.lastDailyRewardDate = parsed.lastDailyRewardDate;
        if (parsed.equippedSkin) this.equippedSkin = parsed.equippedSkin;
        if (parsed.equippedBoard) this.equippedBoard = parsed.equippedBoard;
        if (parsed.equippedParticle) this.equippedParticle = parsed.equippedParticle;
        if (parsed.equippedTrail) this.equippedTrail = parsed.equippedTrail;
        if (parsed.unlockedCollection) {
          Object.keys(parsed.unlockedCollection).forEach(cat => {
            if (COLLECTIONS[cat]) {
              parsed.unlockedCollection[cat].forEach(id => {
                const item = COLLECTIONS[cat].find(x => x.id === id);
                if (item) item.unlocked = true;
              });
            }
          });
        }
        if (parsed.screenShake !== undefined) {
          this.screenShakeEnabled = parsed.screenShake;
          this.ps.shakeEnabled = this.screenShakeEnabled;
        }
      }
    } catch (e) {}

    const toggleSfx = document.getElementById("toggle-sfx");
    if (toggleSfx) toggleSfx.checked = SOUND.sfxEnabled;
    const toggleMusic = document.getElementById("toggle-music");
    if (toggleMusic) toggleMusic.checked = SOUND.musicEnabled;
    const toggleVibe = document.getElementById("toggle-vibe");
    if (toggleVibe) toggleVibe.checked = SOUND.vibrationEnabled;
    const toggleShake = document.getElementById("toggle-shake");
    if (toggleShake) toggleShake.checked = this.screenShakeEnabled;

    this.updateUIHeaders();
  }

  saveData() {
    try {
      const unlockedThemeIds = Object.keys(THEMES).filter(k => THEMES[k].unlocked);
      const toSave = {
        bestScore: this.bestScore,
        coins: this.coins,
        gems: this.gems,
        xp: this.xp,
        level: this.level,
        themeId: this.currentTheme.id,
        powerups: this.powerups,
        achievements: this.achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
        lang: this.currentLang,
        unlockedThemes: unlockedThemeIds,
        sfx: SOUND.sfxEnabled,
        music: SOUND.musicEnabled,
        vibration: SOUND.vibrationEnabled,
        screenShake: this.screenShakeEnabled,
        userAvatar: this.userAvatar,
        totalGamesPlayed: this.totalGamesPlayed,
        totalLinesCleared: this.totalLinesCleared,
        totalBlocksPlaced: this.totalBlocksPlaced,
        longestChain: this.longestChain,
        dailyStreak: this.dailyStreak,
        dailyRewardDay: this.dailyRewardDay,
        lastDailyRewardDate: this.lastDailyRewardDate,
        equippedSkin: this.equippedSkin,
        equippedBoard: this.equippedBoard,
        equippedParticle: this.equippedParticle,
        equippedTrail: this.equippedTrail,
        unlockedCollection: {
          skins: COLLECTIONS.skins.filter(x => x.unlocked).map(x => x.id),
          boards: COLLECTIONS.boards.filter(x => x.unlocked).map(x => x.id),
          particles: COLLECTIONS.particles.filter(x => x.unlocked).map(x => x.id),
          trails: COLLECTIONS.trails.filter(x => x.unlocked).map(x => x.id)
        }
      };
      localStorage.setItem("BLOCKVERSE_SAVE_V1", JSON.stringify(toSave));
    } catch (e) {}
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.resetTransform ? this.ctx.resetTransform() : this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    this.cellSize = rect.width / 10;
    this.boardOffsetLeft = rect.left;
    this.boardOffsetTop = rect.top;
    this.dragOffsetY = Math.max(72, this.cellSize * 1.55);

    if (this.fxCanvas && this.fxCtx) {
      this.fxCanvas.width = window.innerWidth * dpr;
      this.fxCanvas.height = window.innerHeight * dpr;
      this.fxCtx.resetTransform ? this.fxCtx.resetTransform() : this.fxCtx.setTransform(1, 0, 0, 1, 0, 0);
      this.fxCtx.scale(dpr, dpr);
    }
  }

  switchScreen(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(screenId);
    if (target) target.classList.add("active");
    SOUND.playButtonClick();
  }

  startNewGame(mode = "classic") {
    this.currentMode = mode;
    this.grid = Array(10).fill(null).map(() => Array(10).fill(null));
    this.score = 0;
    this.linesCleared = 0;
    this.currentCombo = 1;
    this.maxCombo = 1;
    this.comboTimer = 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.activePowerup = null;
    this.totalGamesPlayed++;
    this.isFeverActive = false;
    this.feverTimeRemaining = 0;
    document.getElementById("app-container")?.classList.remove("fever-active");
    const feverBanner = document.getElementById("game-fever-banner");
    if (feverBanner) feverBanner.style.display = "none";

    if (this.timeRushInterval) {
      clearInterval(this.timeRushInterval);
      this.timeRushInterval = null;
    }

    if (mode === "timerush") {
      this.timeRemaining = 120;
      this.timeRushInterval = setInterval(() => {
        if (!this.isPaused && !this.isGameOver) {
          this.timeRemaining--;
          if (this.timeRemaining <= 0) {
            this.triggerGameOver();
          }
        }
      }, 1000);
    }

    this.spawnNewPieces();
    this.updateUIHeaders();
    this.switchScreen("screen-game");
    SOUND.startMusic();
    setTimeout(() => this.resizeCanvas(), 50);
  }

  activateComboFever() {
    if (this.isFeverActive) {
      this.feverTimeRemaining = Math.min(12, this.feverTimeRemaining + 4);
      return;
    }
    this.isFeverActive = true;
    this.feverTimeRemaining = 8.5; // seconds
    SOUND.playFeverActivate();
    document.getElementById("app-container")?.classList.add("fever-active");
    const banner = document.getElementById("game-fever-banner");
    if (banner) banner.style.display = "flex";
    this.ps.addMultiClearBadge("🔥 COMBO FEVER! 🔥", "2X SCORE ACTIVE!", "#ff007f");
  }

  spawnNewPieces() {
    this.trayPieces = this.pieceGen.generateSet(this.grid, this.currentTheme, this.level, this.score);
    this.renderTrayPieces();
    this.checkGameOver();
  }

  saveUndoState() {
    this.undoHistory = {
      grid: this.grid.map(row => row.map(cell => cell ? { ...cell } : null)),
      trayPieces: this.trayPieces.map(p => ({ ...p, matrix: p.matrix.map(r => [...r]) })),
      score: this.score,
      linesCleared: this.linesCleared,
      currentCombo: this.currentCombo,
      maxCombo: this.maxCombo,
      comboTimer: this.comboTimer,
      lastClearTime: this.lastClearTime
    };
  }

  performUndo() {
    if (!this.undoHistory || this.powerups.undo <= 0) {
      SOUND.playInvalid();
      return;
    }
    this.powerups.undo--;
    this.grid = this.undoHistory.grid;
    this.trayPieces = this.undoHistory.trayPieces;
    this.score = this.undoHistory.score;
    this.linesCleared = this.undoHistory.linesCleared;
    this.currentCombo = this.undoHistory.currentCombo;
    this.maxCombo = this.undoHistory.maxCombo;
    this.comboTimer = this.undoHistory.comboTimer;
    this.lastClearTime = this.undoHistory.lastClearTime;
    this.undoHistory = null;

    if (this.gameOverTimeout) {
      clearTimeout(this.gameOverTimeout);
      this.gameOverTimeout = null;
    }

    this.renderTrayPieces();
    this.updateUIHeaders();
    SOUND.playPowerup();
    this.ps.addShockwave(this.canvas.width / (2 * (window.devicePixelRatio || 1)), this.canvas.height / (2 * (window.devicePixelRatio || 1)), "#ff7700", 260);
    this.saveData();
  }

  performShuffle() {
    if (this.powerups.shuffle <= 0) {
      SOUND.playInvalid();
      return;
    }
    this.powerups.shuffle--;
    if (this.gameOverTimeout) {
      clearTimeout(this.gameOverTimeout);
      this.gameOverTimeout = null;
    }
    this.spawnNewPieces();
    this.updateUIHeaders();
    SOUND.playPowerup();
    this.ps.addConfetti(window.innerWidth / 2, window.innerHeight - 80, 50);
    this.saveData();
  }

  performMagnet() {
    if (this.powerups.magnet <= 0) {
      SOUND.playInvalid();
      return;
    }
    const piece = this.trayPieces.find(p => !p.placed);
    if (!piece) return;

    // Find first valid placement on board
    const rows = piece.matrix.length;
    const cols = piece.matrix[0].length;
    let placed = false;

    for (let r = 0; r <= 10 - rows; r++) {
      for (let c = 0; c <= 10 - cols; c++) {
        if (this.canPlacePiece(piece.matrix, r, c)) {
          this.powerups.magnet--;
          this.placePiece(piece, r, c);
          SOUND.playPowerup();
          this.ps.addShockwave((c + cols / 2) * this.cellSize, (r + rows / 2) * this.cellSize, "#00f0ff", 220);
          placed = true;
          break;
        }
      }
      if (placed) break;
    }

    if (!placed) {
      SOUND.playInvalid();
    }
    this.updateUIHeaders();
    this.saveData();
  }

  // Check collision for piece matrix
  canPlacePiece(matrix, startRow, startCol) {
    const rows = matrix.length;
    const cols = matrix[0].length;

    if (startRow < 0 || startCol < 0 || startRow + rows > 10 || startCol + cols > 10) {
      return false;
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (matrix[r][c]) {
          if (this.grid[startRow + r][startCol + c] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  }

  // Place piece on board and trigger clears
  placePiece(piece, startRow, startCol) {
    if (this.gameOverTimeout) {
      clearTimeout(this.gameOverTimeout);
      this.gameOverTimeout = null;
    }

    this.saveUndoState();

    const rows = piece.matrix.length;
    const cols = piece.matrix[0].length;
    let blockCount = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellVal = piece.matrix[r][c];
        if (cellVal) {
          const isObj = typeof cellVal === "object";
          this.grid[startRow + r][startCol + c] = {
            colorIndex: piece.colorIndex,
            scale: 1.0,
            pulse: 0,
            special: isObj ? cellVal.special : null,
            hits: isObj ? (cellVal.hits || 1) : 1
          };
          blockCount++;
        }
      }
    }

    piece.placed = true;
    this.score += blockCount;
    this.totalBlocksPlaced += blockCount;
    this.unlockAchievement("first_block");
    SOUND.playBlockPlace();

    // Check full rows and full columns
    const fullRows = [];
    const fullCols = [];

    for (let r = 0; r < 10; r++) {
      let complete = true;
      for (let c = 0; c < 10; c++) {
        if (this.grid[r][c] === null) {
          complete = false;
          break;
        }
      }
      if (complete) fullRows.push(r);
    }

    for (let c = 0; c < 10; c++) {
      let complete = true;
      for (let r = 0; r < 10; r++) {
        if (this.grid[r][c] === null) {
          complete = false;
          break;
        }
      }
      if (complete) fullCols.push(c);
    }

    const totalLines = fullRows.length + fullCols.length;

    if (totalLines > 0) {
      // Line clear combo logic
      const now = performance.now();
      if (now - this.lastClearTime < this.comboDecayTime) {
        this.currentCombo += (totalLines >= 2 ? totalLines : 1);
      } else {
        this.currentCombo = totalLines >= 2 ? totalLines : 1;
      }
      this.lastClearTime = now;
      this.comboTimer = 1.0;
      if (this.currentCombo > this.maxCombo) this.maxCombo = this.currentCombo;
      if (this.currentCombo > this.highestCombo) this.highestCombo = this.currentCombo;

      // Base score calculation
      let lineBaseScore = 120;
      if (totalLines === 2) lineBaseScore = 320;
      else if (totalLines === 3) lineBaseScore = 750;
      else if (totalLines >= 4) lineBaseScore = 1600;

      // Check Combo Fever Trigger
      if (this.currentCombo >= 3 || totalLines >= 3) {
        this.activateComboFever();
      }

      const boardRect = this.canvas.getBoundingClientRect();

      // Collect initial cleared cells and check intersections
      const clearedSet = new Set();
      const intersectionSet = new Set();

      fullRows.forEach(r => {
        for (let c = 0; c < 10; c++) {
          clearedSet.add(`${r},${c}`);
          if (fullCols.includes(c)) {
            intersectionSet.add(`${r},${c}`);
          }
        }
      });
      fullCols.forEach(c => {
        for (let r = 0; r < 10; r++) {
          clearedSet.add(`${r},${c}`);
        }
      });

      // SPECIAL BLOCKS & CHAIN REACTION CASCADE SYSTEM
      let specialMultiplier = 1;
      let chainReactionCount = 0;
      const cellsToProcess = Array.from(clearedSet);
      const processedSpecials = new Set();

      while (cellsToProcess.length > 0) {
        const pos = cellsToProcess.shift();
        const [r, c] = pos.split(",").map(Number);
        const cellData = this.grid[r][c];
        if (!cellData) continue;

        // Ice Block check:
        if (cellData.special === "ice" && cellData.hits > 1) {
          cellData.hits--;
          SOUND.playSpecialBlock("ice");
          this.ps.explodeIceBlock(boardRect.left + (c + 0.5) * this.cellSize, boardRect.top + (r + 0.5) * this.cellSize, this.cellSize);
          clearedSet.delete(pos); // Don't wipe it from grid yet!
          continue;
        }

        if (cellData.special && !processedSpecials.has(pos)) {
          processedSpecials.add(pos);
          chainReactionCount++;
          const spType = cellData.special;
          const cx = boardRect.left + (c + 0.5) * this.cellSize;
          const cy = boardRect.top + (r + 0.5) * this.cellSize;

          SOUND.playSpecialBlock(spType);

          if (spType === "bomb") {
            this.ps.explodeBomb(cx, cy, 320);
            this.ps.addShockwave(cx, cy, "#ff3300", 350);
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
                  const npos = `${nr},${nc}`;
                  if (this.grid[nr][nc] && !clearedSet.has(npos)) {
                    clearedSet.add(npos);
                    cellsToProcess.push(npos);
                  }
                }
              }
            }
          } else if (spType === "lightning") {
            this.ps.explodeLightning(cx, cy, boardRect.left, boardRect.top, 10 * this.cellSize);
            this.ps.addShockwave(cx, cy, "#ffe600", 300);
            for (let nc = 0; nc < 10; nc++) {
              const npos = `${r},${nc}`;
              if (this.grid[r][nc] && !clearedSet.has(npos)) {
                clearedSet.add(npos);
                cellsToProcess.push(npos);
              }
            }
            for (let nr = 0; nr < 10; nr++) {
              const npos = `${nr},${c}`;
              if (this.grid[nr][c] && !clearedSet.has(npos)) {
                clearedSet.add(npos);
                cellsToProcess.push(npos);
              }
            }
          } else if (spType === "rainbow") {
            this.ps.explodeRainbow(cx, cy, 350);
            const targetColor = cellData.colorIndex;
            for (let nr = 0; nr < 10; nr++) {
              for (let nc = 0; nc < 10; nc++) {
                if (this.grid[nr][nc] && this.grid[nr][nc].colorIndex === targetColor) {
                  const npos = `${nr},${nc}`;
                  if (!clearedSet.has(npos)) {
                    clearedSet.add(npos);
                    cellsToProcess.push(npos);
                  }
                }
              }
            }
          } else if (spType === "multiplier") {
            specialMultiplier *= 2;
            this.ps.addFloatingText(`2X MULTIPLIER!`, cx, cy - 25, "#ffd700", 30, true);
          } else if (spType === "wild") {
            this.score += 500;
            this.ps.addFloatingText(`+500 WILD BONUS!`, cx, cy - 25, "#39ff14", 28, true);
          }
        }
      }

      // Chain reaction handling
      if (chainReactionCount >= 2) {
        SOUND.playChainReaction(chainReactionCount);
        const chainBonus = chainReactionCount * 300;
        this.score += chainBonus;
        this.ps.addMultiClearBadge(`CHAIN REACTION x${chainReactionCount}!`, `+${chainBonus} PTS`, "#ff007f");
        if (chainReactionCount > this.longestChain) this.longestChain = chainReactionCount;
      }

      // Total earned score with Fever Mode and multipliers
      const feverMult = this.isFeverActive ? 2 : 1;
      const earnedScore = lineBaseScore * this.currentCombo * feverMult * specialMultiplier;
      this.score += earnedScore;
      this.linesCleared += totalLines;
      this.totalLinesCleared += totalLines;

      // Coins & XP
      const earnedCoins = totalLines * 12 * Math.min(5, this.currentCombo) * feverMult;
      const earnedXP = totalLines * 30 * Math.min(5, this.currentCombo) * feverMult;
      this.coins += earnedCoins;
      this.addXP(earnedXP);

      // Sound & Screen shake
      SOUND.playLineClear(totalLines, this.currentCombo);
      this.ps.addShake(totalLines >= 3 ? 4 : (totalLines === 2 ? 2 : 1));

      // Trigger Laser Lines across rows and columns
      fullRows.forEach(r => {
        const laserY = boardRect.top + (r + 0.5) * this.cellSize;
        this.ps.addLaserLine(true, laserY, this.cellSize, "#00f0ff");
      });
      fullCols.forEach(c => {
        const laserX = boardRect.left + (c + 0.5) * this.cellSize;
        this.ps.addLaserLine(false, laserX, this.cellSize, "#b026ff");
      });

      // Spawn particle explosions for all cleared cells
      clearedSet.forEach(pos => {
        const [r, c] = pos.split(",").map(Number);
        const cellData = this.grid[r][c];
        if (cellData) {
          const colorObj = this.currentTheme.colors[cellData.colorIndex % this.currentTheme.colors.length];
          const cx = boardRect.left + (c + 0.5) * this.cellSize;
          const cy = boardRect.top + (r + 0.5) * this.cellSize;
          const isIntersection = intersectionSet.has(pos);
          this.ps.explodeCell(cx, cy, this.cellSize, colorObj, isIntersection);
          this.grid[r][c] = null;
        }
      });

      // Shockwave at center of clears
      let avgX = boardRect.left + 5 * this.cellSize;
      let avgY = boardRect.top + 5 * this.cellSize;
      this.ps.addShockwave(avgX, avgY, totalLines >= 3 ? "#ff007f" : "#00f0ff", totalLines >= 3 ? 320 : 220);

      // Floating score text on full screen
      const centerCol = boardRect.left + (startCol + cols / 2) * this.cellSize;
      const centerRow = boardRect.top + (startRow + rows / 2) * this.cellSize;
      this.ps.addFloatingText(`+${earnedScore}`, centerCol, centerRow, this.isFeverActive ? "#ff007f" : "#00f0ff", 34);

      // Multi-Clear or Combo Badge
      if (totalLines >= 2 && chainReactionCount < 2) {
        const badgeTitle = totalLines === 2 ? "DOUBLE CLEAR!" : totalLines === 3 ? "TRIPLE CLEAR!" : "MEGA CLEAR!";
        const badgeSub = `+${earnedScore} PTS`;
        const badgeColor = totalLines >= 3 ? "#ff007f" : (totalLines === 2 ? "#ffe600" : "#00f0ff");
        this.ps.addMultiClearBadge(badgeTitle, badgeSub, badgeColor);
      } else if (this.currentCombo > 1 && chainReactionCount < 2) {
        this.ps.addFloatingText(`COMBO x${this.currentCombo}!`, centerCol, centerRow - 40, "#ff007f", 26, true);
        SOUND.playComboSound(this.currentCombo);
      }

      // Achievements & missions check
      this.unlockAchievement("first_clear");
      if (this.currentCombo >= 4) this.unlockAchievement("combo_master");
      if (this.linesCleared >= 50) this.unlockAchievement("line_destroyer");
      if (totalLines >= 3) this.unlockAchievement("super_clear");

      this.updateMissionProgress("m1", totalLines);
      if (this.currentCombo >= 2) this.updateMissionProgress("m2", 1);
      this.updateMissionProgress("m3", earnedScore);
      if (totalLines >= 3) this.updateMissionProgress("m5", 1);
    }

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
    }

    if (this.score >= 10000) {
      this.unlockAchievement("club_10k");
    }

    // If all tray pieces placed, spawn new set
    const remaining = this.trayPieces.filter(p => !p.placed);
    if (remaining.length === 0) {
      this.spawnNewPieces();
    } else {
      this.renderTrayPieces();
      this.checkGameOver();
    }

    this.updateUIHeaders();
    this.saveData();
  }

  addXP(amount) {
    this.xp += amount;
    const requiredXP = this.level * 400;
    if (this.xp >= requiredXP) {
      this.xp -= requiredXP;
      this.level++;
      SOUND.playLevelUp();
      this.ps.addConfetti(window.innerWidth / 2, window.innerHeight / 2, 80);
      if (this.level >= 10) this.unlockAchievement("block_legend");
    }
  }

  unlockAchievement(id) {
    const ach = this.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      this.gems += ach.rewardGems;
      SOUND.playAchievement();
      this.showAchievementToast(ach.title, ach.desc);
      this.saveData();
    }
  }

  showAchievementToast(title, desc) {
    const toast = document.getElementById("achievement-toast");
    const tTitle = document.getElementById("toast-title");
    const tDesc = document.getElementById("toast-desc");
    if (toast && tTitle && tDesc) {
      tTitle.innerText = "ACHIEVEMENT UNLOCKED! +" + (this.achievements.find(a => a.title === title)?.rewardGems || 5) + " 💎";
      tDesc.innerText = title;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3500);
    }
  }

  updateMissionProgress(id, amount) {
    const m = this.missions.find(mi => mi.id === id);
    if (m && !m.claimed) {
      m.current = Math.min(m.target, m.current + amount);
    }
  }

  checkGameOver() {
    // In Zen mode, players can always shuffle or keep playing
    if (this.currentMode === "zen") return;

    const remaining = this.trayPieces.filter(p => !p.placed);
    if (remaining.length === 0) return;

    let canFitAny = false;
    for (const piece of remaining) {
      if (this.pieceGen.canFit(this.grid, piece.matrix)) {
        canFitAny = true;
        break;
      }
    }

    if (this.gameOverTimeout) {
      clearTimeout(this.gameOverTimeout);
      this.gameOverTimeout = null;
    }

    if (!canFitAny) {
      const bRect = this.canvas.getBoundingClientRect();
      const cx = bRect.left + bRect.width / 2;
      const cy = bRect.top + bRect.height / 2;

      // Check if player has hammers or shuffle available to survive
      if (this.powerups.shuffle > 0 || this.powerups.hammer > 0 || this.powerups.undo > 0) {
        this.ps.addFloatingText("TACTICAL POWER-UP AVAILABLE!", cx, cy - 30, "#ffe600", 22, true);
      } else {
        this.ps.addFloatingText("NO MOVES REMAINING!", cx, cy - 30, "#ff007f", 24, true);
      }

      this.gameOverTimeout = setTimeout(() => {
        let stillCantFit = true;
        for (const p of this.trayPieces.filter(x => !x.placed)) {
          if (this.pieceGen.canFit(this.grid, p.matrix)) {
            stillCantFit = false;
            break;
          }
        }
        if (stillCantFit && !this.isGameOver) {
          this.triggerGameOver();
        }
      }, 1200);
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    SOUND.playGameOver();

    const newBest = this.score >= this.bestScore && this.score > 0;
    const bestFlag = document.getElementById("gameover-new-best");
    if (bestFlag) bestFlag.style.display = newBest ? "block" : "none";

    document.getElementById("gameover-score").innerText = this.score;
    document.getElementById("gameover-lines").innerText = this.linesCleared;
    document.getElementById("gameover-combo").innerText = this.maxCombo + "x";
    document.getElementById("gameover-xp").innerText = "+" + (this.linesCleared * 30);
    document.getElementById("gameover-coins").innerText = "+" + (this.linesCleared * 12);

    // Update user row on leaderboard
    const userRow = this.leaderboard.find(l => l.isUser);
    if (userRow && this.score > userRow.score) {
      userRow.score = this.score;
      userRow.level = this.level;
    }

    this.saveData();
    const modal = document.getElementById("modal-gameover");
    if (modal) modal.classList.add("active");
  }

  // Renders the 3 piece cards in the bottom tray DOM slots
  renderTrayPieces() {
    for (let i = 0; i < 3; i++) {
      const slot = document.getElementById(`slot-${i}`);
      if (!slot) continue;
      slot.innerHTML = "";

      const piece = this.trayPieces[i];
      if (!piece || piece.placed) {
        slot.style.opacity = "0.2";
        slot.style.filter = "none";
        continue;
      }

      // Check if this specific piece can fit anywhere on the board
      const canFit = this.pieceGen.canFit(this.grid, piece.matrix);
      slot.style.opacity = canFit ? "1.0" : "0.45";
      slot.style.filter = canFit ? "none" : "grayscale(50%) brightness(0.8)";

      // Render miniature canvas for the piece
      const miniCanvas = document.createElement("canvas");
      const rows = piece.matrix.length;
      const cols = piece.matrix[0].length;
      const miniCellSize = 18;

      miniCanvas.width = cols * miniCellSize * 2;
      miniCanvas.height = rows * miniCellSize * 2;
      miniCanvas.style.width = (cols * miniCellSize) + "px";
      miniCanvas.style.height = (rows * miniCellSize) + "px";

      const mCtx = miniCanvas.getContext("2d");
      mCtx.scale(2, 2);

      const colorObj = this.currentTheme.colors[piece.colorIndex % this.currentTheme.colors.length];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = piece.matrix[r][c];
          if (val) {
            this.draw3DBlock(mCtx, c * miniCellSize, r * miniCellSize, miniCellSize, colorObj, 1.0, false, val);
          }
        }
      }

      slot.appendChild(miniCanvas);
      miniCanvas.setAttribute("data-slot", i);
    }
  }

  // Draw 3D Futuristic Beveled Block with Special Block Enhancements
  draw3DBlock(ctx, x, y, size, colorObj, alpha = 1.0, isGhost = false, specialData = null) {
    ctx.save();
    ctx.globalAlpha = alpha;

    const pad = 1.8;
    const bx = x + pad;
    const by = y + pad;
    const bs = size - pad * 2;
    const radius = Math.max(3.5, bs * 0.18);

    // Extract special block info if any
    let specialType = null;
    let hits = 1;
    if (specialData) {
      if (typeof specialData === "object") {
        specialType = specialData.special || null;
        hits = specialData.hits !== undefined ? specialData.hits : 1;
      } else if (typeof specialData === "string") {
        specialType = specialData;
      }
    }

    if (isGhost) {
      ctx.strokeStyle = colorObj.light || colorObj.main;
      ctx.lineWidth = 2.5;
      ctx.setLineDash ? ctx.setLineDash([4, 3]) : null;
      ctx.fillStyle = colorObj.glow ? colorObj.glow.replace("0.8", "0.22") : "rgba(0, 240, 255, 0.22)";
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, bs, bs, radius) : ctx.rect(bx, by, bs, bs);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Soft Ambient Drop Shadow
    ctx.shadowColor = specialType === "bomb" ? "#ff3300" : (specialType === "lightning" ? "#ffe600" : (specialType === "rainbow" ? "#ff007f" : (colorObj.glow || "rgba(0, 240, 255, 0.6)")));
    ctx.shadowBlur = Math.min(18, bs * 0.38);
    ctx.shadowOffsetY = 2.5;

    // Outer Beveled 3D Gradient
    const grad = ctx.createLinearGradient(bx, by, bx + bs, by + bs);
    if (specialType === "bomb") {
      grad.addColorStop(0, "#ff7700");
      grad.addColorStop(0.5, "#ff2200");
      grad.addColorStop(1, "#880000");
    } else if (specialType === "lightning") {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.4, "#ffe600");
      grad.addColorStop(1, "#cc8800");
    } else if (specialType === "rainbow") {
      grad.addColorStop(0, "#00f0ff");
      grad.addColorStop(0.5, "#ff007f");
      grad.addColorStop(1, "#ffe600");
    } else if (specialType === "ice") {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.5, "#7df2ff");
      grad.addColorStop(1, "#0088cc");
    } else if (specialType === "multiplier") {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.5, "#ffd700");
      grad.addColorStop(1, "#b8860b");
    } else {
      grad.addColorStop(0, colorObj.light);
      grad.addColorStop(0.45, colorObj.main);
      grad.addColorStop(1, colorObj.dark);
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, bs, bs, radius) : ctx.rect(bx, by, bs, bs);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Central Jewel Facet
    const innerPad = bs * 0.16;
    const ix = bx + innerPad;
    const iy = by + innerPad;
    const iw = bs - innerPad * 2;
    const ih = bs - innerPad * 2;
    const innerRadius = Math.max(2.5, radius * 0.6);

    const facetGrad = ctx.createLinearGradient(ix, iy, ix + iw, iy + ih);
    facetGrad.addColorStop(0, "rgba(255, 255, 255, 0.28)");
    facetGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.05)");
    facetGrad.addColorStop(1, "rgba(0, 0, 0, 0.35)");

    ctx.fillStyle = facetGrad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(ix, iy, iw, ih, innerRadius) : ctx.rect(ix, iy, iw, ih);
    ctx.fill();

    // Top Diagonal Glass Sheen Highlight
    const shineH = ih * 0.42;
    const shineGrad = ctx.createLinearGradient(ix, iy, ix, iy + shineH);
    shineGrad.addColorStop(0, "rgba(255, 255, 255, 0.65)");
    shineGrad.addColorStop(1, "rgba(255, 255, 255, 0.08)");

    ctx.fillStyle = shineGrad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(ix, iy, iw, shineH, innerRadius * 0.8) : ctx.rect(ix, iy, iw, shineH);
    ctx.fill();

    // Emissive Edge Pinstripe
    ctx.strokeStyle = specialType ? "#ffffff" : colorObj.light;
    ctx.lineWidth = specialType ? 1.8 : 1;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, bs, bs, radius) : ctx.rect(bx, by, bs, bs);
    ctx.stroke();

    // Special Block Badge Icon Overlay
    if (specialType && size >= 16) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const iconSize = Math.max(10, Math.floor(bs * 0.52));
      ctx.font = `${iconSize}px sans-serif`;
      const cx = bx + bs / 2;
      const cy = by + bs / 2 + (size < 24 ? 0 : 1);

      let icon = "";
      if (specialType === "bomb") icon = "💣";
      else if (specialType === "lightning") icon = "⚡";
      else if (specialType === "rainbow") icon = "🌈";
      else if (specialType === "ice") icon = "❄️";
      else if (specialType === "multiplier") icon = "✖️";
      else if (specialType === "wild") icon = "⭐";

      if (icon) {
        ctx.fillStyle = "#ffffff";
        ctx.fillText(icon, cx, cy);
      }

      // If Ice block has 1 hit remaining, draw fracture cracks!
      if (specialType === "ice" && hits === 1) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(bx + bs * 0.2, by + bs * 0.2);
        ctx.lineTo(bx + bs * 0.5, by + bs * 0.5);
        ctx.lineTo(bx + bs * 0.4, by + bs * 0.8);
        ctx.moveTo(bx + bs * 0.5, by + bs * 0.5);
        ctx.lineTo(bx + bs * 0.8, by + bs * 0.35);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // Update UI Elements
  updateUIHeaders() {
    document.getElementById("game-score-val").innerText = this.score;
    document.getElementById("game-best-val").innerText = this.bestScore;
    document.getElementById("game-coins-val").innerText = this.coins;
    document.getElementById("home-coins-val").innerText = this.coins;
    document.getElementById("home-gems-val").innerText = this.gems;

    // Level tag
    const titleIdx = Math.min(this.levelTitles.length - 1, Math.floor((this.level - 1) / 3));
    const title = this.levelTitles[titleIdx];
    document.getElementById("home-level-tag").innerText = `LVL ${this.level} • ${title}`;

    // Power-ups count tags
    Object.keys(this.powerups).forEach(key => {
      const el = document.getElementById(`count-${key}`);
      if (el) el.innerText = this.powerups[key];
    });

    // Combo badge
    const comboBadge = document.getElementById("game-combo-badge");
    if (comboBadge) {
      if (this.currentCombo > 1) {
        comboBadge.style.display = "block";
        comboBadge.innerText = `${this.currentCombo}x COMBO`;
      } else {
        comboBadge.style.display = "none";
      }
    }
  }

  // Main Render Loop
  gameLoop(currentTime) {
    const dt = Math.min(2, (currentTime - this.lastTime) / 16.66);
    this.lastTime = currentTime;

    // Decay combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= (0.016 * dt) / (this.comboDecayTime / 1000);
      const meterFill = document.getElementById("combo-meter-bar");
      if (meterFill) meterFill.style.width = Math.max(0, this.comboTimer * 100) + "%";
      if (this.comboTimer <= 0) {
        this.currentCombo = 1;
        this.updateUIHeaders();
      }
    }

    // Fever Mode Timer
    if (this.isFeverActive) {
      this.feverTimeRemaining -= 0.016 * dt;
      if (this.feverTimeRemaining <= 0) {
        this.isFeverActive = false;
        document.getElementById("app-container")?.classList.remove("fever-active");
        const feverBanner = document.getElementById("game-fever-banner");
        if (feverBanner) feverBanner.style.display = "none";
      }
    }

    // Clear Canvas
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    this.ctx.clearRect(0, 0, w, h);

    // Render Grid Background & Ambient particles with Dynamic Reactivity
    this.ps.renderBg(this.ctx, w, h, {
      score: this.score,
      combo: this.currentCombo,
      level: this.level,
      isFever: this.isFeverActive
    });

    // Draw 10x10 Grid Cells
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const x = c * this.cellSize;
        const y = r * this.cellSize;

        // Empty Cell Slot
        this.ctx.save();
        this.ctx.fillStyle = this.currentTheme.cellEmpty;
        this.ctx.strokeStyle = this.currentTheme.gridBorder;
        this.ctx.lineWidth = 1;
        const p = 2;
        const rad = Math.max(3, this.cellSize * 0.15);
        this.ctx.beginPath();
        this.ctx.roundRect ? this.ctx.roundRect(x + p, y + p, this.cellSize - p * 2, this.cellSize - p * 2, rad) : this.ctx.rect(x + p, y + p, this.cellSize - p * 2, this.cellSize - p * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();

        // Occupied Cell
        const cell = this.grid[r][c];
        if (cell) {
          const colorObj = this.currentTheme.colors[cell.colorIndex % this.currentTheme.colors.length];
          this.draw3DBlock(this.ctx, x, y, this.cellSize, colorObj, 1.0, false, cell);
        }
      }
    }

    // Draw Ghost Placement Preview
    if (this.isDragging && this.draggingPiece && this.hoverRow !== -1 && this.hoverCol !== -1) {
      const rows = this.draggingPiece.matrix.length;
      const cols = this.draggingPiece.matrix[0].length;
      const colorObj = this.isValidHover
        ? this.currentTheme.colors[this.draggingPiece.colorIndex % this.currentTheme.colors.length]
        : { main: "#ff0055", light: "#ff3366", dark: "#990033", glow: "rgba(255, 0, 85, 0.8)" };

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = this.draggingPiece.matrix[r][c];
          if (val) {
            const gx = (this.hoverCol + c) * this.cellSize;
            const gy = (this.hoverRow + r) * this.cellSize;
            this.draw3DBlock(this.ctx, gx, gy, this.cellSize, colorObj, 0.7, true, val);
          }
        }
      }
    }

    // Render Full-Screen Effects & Dragged Piece on fxCanvas
    if (this.fxCtx && this.fxCanvas) {
      const fxW = this.fxCanvas.width / (window.devicePixelRatio || 1);
      const fxH = this.fxCanvas.height / (window.devicePixelRatio || 1);
      this.fxCtx.clearRect(0, 0, fxW, fxH);

      // Draw Dragged Piece lifted cleanly above finger
      if (this.isDragging && this.draggingPiece) {
        const rows = this.draggingPiece.matrix.length;
        const cols = this.draggingPiece.matrix[0].length;
        const pieceW = cols * this.cellSize;
        const pieceH = rows * this.cellSize;

        // Visual position: screenClientX / screenClientY in window coordinates
        const startX = this.screenClientX - pieceW / 2;
        const startY = this.screenClientY - pieceH / 2 - this.dragOffsetY;

        const colorObj = this.currentTheme.colors[this.draggingPiece.colorIndex % this.currentTheme.colors.length];

        this.fxCtx.save();
        this.fxCtx.shadowColor = colorObj.glow || "rgba(0, 240, 255, 0.8)";
        this.fxCtx.shadowBlur = 22;
        this.fxCtx.shadowOffsetY = 12;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const val = this.draggingPiece.matrix[r][c];
            if (val) {
              this.draw3DBlock(this.fxCtx, startX + c * this.cellSize, startY + r * this.cellSize, this.cellSize, colorObj, 1.0, false, val);
            }
          }
        }
        this.fxCtx.restore();
      }

      this.ps.update(dt);
      this.ps.render(this.fxCtx);
    } else {
      this.ps.update(dt);
      this.ps.render(this.ctx);
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  // Pointer & Touch Handlers
  setupEventListeners() {
    // Mode cards selector on Home
    document.querySelectorAll(".mode-card").forEach(card => {
      card.addEventListener("click", () => {
        document.querySelectorAll(".mode-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        this.currentMode = card.getAttribute("data-mode");
        SOUND.playButtonClick();
      });
    });

    // Play Button
    document.getElementById("btn-play-game").addEventListener("click", () => {
      this.startNewGame(this.currentMode);
    });

    // Top buttons
    document.getElementById("btn-game-back").addEventListener("click", () => {
      this.switchScreen("screen-home");
      SOUND.playButtonClick();
    });

    document.getElementById("btn-game-pause").addEventListener("click", () => {
      this.isPaused = true;
      document.getElementById("modal-pause").classList.add("active");
      SOUND.playButtonClick();
    });

    // Pause Modal Buttons
    document.getElementById("btn-pause-resume").addEventListener("click", () => {
      this.isPaused = false;
      document.getElementById("modal-pause").classList.remove("active");
      SOUND.playButtonClick();
    });

    document.getElementById("btn-pause-restart").addEventListener("click", () => {
      document.getElementById("modal-pause").classList.remove("active");
      this.startNewGame(this.currentMode);
    });

    document.getElementById("btn-pause-home").addEventListener("click", () => {
      document.getElementById("modal-pause").classList.remove("active");
      this.switchScreen("screen-home");
    });

    document.getElementById("btn-pause-settings").addEventListener("click", () => {
      document.getElementById("modal-settings").classList.add("active");
      SOUND.playButtonClick();
    });

    // Game Over Buttons
    document.getElementById("btn-gameover-replay").addEventListener("click", () => {
      document.getElementById("modal-gameover").classList.remove("active");
      this.startNewGame(this.currentMode);
    });

    document.getElementById("btn-gameover-home").addEventListener("click", () => {
      document.getElementById("modal-gameover").classList.remove("active");
      this.switchScreen("screen-home");
    });

    document.getElementById("btn-gameover-share").addEventListener("click", () => {
      const text = `I scored ${this.score.toLocaleString()} points in BLOCKVERSE: NEON RUSH! ⚡ Can you beat me?`;
      if (window.AndroidBridge && window.AndroidBridge.share) {
        window.AndroidBridge.share("BLOCKVERSE High Score", text);
      } else if (navigator.share) {
        navigator.share({ title: "BLOCKVERSE High Score", text: text }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(text);
        alert("Score copied to clipboard! Share it with friends!");
      }
      SOUND.playButtonClick();
    });

    // Power-ups click
    document.querySelectorAll(".powerup-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.getAttribute("data-power");
        SOUND.playButtonClick();

        if (type === "shuffle") {
          this.performShuffle();
        } else if (type === "undo") {
          this.performUndo();
        } else if (type === "magnet") {
          this.performMagnet();
        } else if (type === "hammer" || type === "lightning" || type === "colorbomb") {
          if (this.powerups[type] <= 0) {
            SOUND.playInvalid();
            return;
          }
          if (this.activePowerup === type) {
            this.activePowerup = null;
            btn.classList.remove("active");
          } else {
            document.querySelectorAll(".powerup-btn").forEach(b => b.classList.remove("active"));
            this.activePowerup = type;
            btn.classList.add("active");
          }
        }
      });
    });

    // Board cell tap helper for tactical power-ups (Hammer, Lightning, Color Bomb)
    const handleCellAction = (clientX, clientY) => {
      if (!this.activePowerup) return;
      const rect = this.canvas.getBoundingClientRect();
      const clickCol = Math.floor((clientX - rect.left) / this.cellSize);
      const clickRow = Math.floor((clientY - rect.top) / this.cellSize);

      if (clickCol < 0 || clickCol >= 10 || clickRow < 0 || clickRow >= 10) return;

      const boardRect = this.canvas.getBoundingClientRect();

      if (this.activePowerup === "hammer") {
        if (this.grid[clickRow][clickCol] !== null) {
          this.powerups.hammer--;
          const cell = this.grid[clickRow][clickCol];
          const colorObj = this.currentTheme.colors[cell.colorIndex % this.currentTheme.colors.length];
          const cx = boardRect.left + (clickCol + 0.5) * this.cellSize;
          const cy = boardRect.top + (clickRow + 0.5) * this.cellSize;
          this.ps.explodeCell(cx, cy, this.cellSize, colorObj, true);
          this.grid[clickRow][clickCol] = null;
          this.score += 25;
          SOUND.playPowerup();
          this.activePowerup = null;
          document.querySelectorAll(".powerup-btn").forEach(b => b.classList.remove("active"));
          this.updateMissionProgress("m4", 1);
          this.updateUIHeaders();
          this.saveData();
          this.renderTrayPieces();
          this.checkGameOver();
        }
      } else if (this.activePowerup === "lightning") {
        this.powerups.lightning--;
        let destroyed = 0;
        for (let c = 0; c < 10; c++) {
          if (this.grid[clickRow][c] !== null) {
            const cell = this.grid[clickRow][c];
            const colorObj = this.currentTheme.colors[cell.colorIndex % this.currentTheme.colors.length];
            const cx = boardRect.left + (c + 0.5) * this.cellSize;
            const cy = boardRect.top + (clickRow + 0.5) * this.cellSize;
            this.ps.explodeCell(cx, cy, this.cellSize, colorObj);
            this.grid[clickRow][c] = null;
            destroyed++;
          }
        }
        for (let r = 0; r < 10; r++) {
          if (this.grid[r][clickCol] !== null) {
            const cell = this.grid[r][clickCol];
            const colorObj = this.currentTheme.colors[cell.colorIndex % this.currentTheme.colors.length];
            const cx = boardRect.left + (clickCol + 0.5) * this.cellSize;
            const cy = boardRect.top + (r + 0.5) * this.cellSize;
            this.ps.explodeCell(cx, cy, this.cellSize, colorObj);
            this.grid[r][clickCol] = null;
            destroyed++;
          }
        }
        const laserY = boardRect.top + (clickRow + 0.5) * this.cellSize;
        const laserX = boardRect.left + (clickCol + 0.5) * this.cellSize;
        this.ps.addLaserLine(true, laserY, this.cellSize, "#00f0ff");
        this.ps.addLaserLine(false, laserX, this.cellSize, "#b026ff");
        this.ps.addShockwave(laserX, laserY, "#00f0ff", 280);
        this.score += Math.max(100, destroyed * 20);
        SOUND.playPowerup();
        this.activePowerup = null;
        document.querySelectorAll(".powerup-btn").forEach(b => b.classList.remove("active"));
        this.updateMissionProgress("m4", 1);
        this.updateUIHeaders();
        this.saveData();
        this.renderTrayPieces();
        this.checkGameOver();
      } else if (this.activePowerup === "colorbomb") {
        const targetCell = this.grid[clickRow][clickCol];
        if (targetCell !== null) {
          this.powerups.colorbomb--;
          const targetColorIdx = targetCell.colorIndex;
          let destroyed = 0;
          for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
              if (this.grid[r][c] && this.grid[r][c].colorIndex === targetColorIdx) {
                const colorObj = this.currentTheme.colors[targetColorIdx % this.currentTheme.colors.length];
                const cx = boardRect.left + (c + 0.5) * this.cellSize;
                const cy = boardRect.top + (r + 0.5) * this.cellSize;
                this.ps.explodeCell(cx, cy, this.cellSize, colorObj);
                this.grid[r][c] = null;
                destroyed++;
              }
            }
          }
          const cx = boardRect.left + (clickCol + 0.5) * this.cellSize;
          const cy = boardRect.top + (clickRow + 0.5) * this.cellSize;
          this.ps.addShockwave(cx, cy, "#ff007f", 300);
          this.score += Math.max(120, destroyed * 25);
          SOUND.playPowerup();
          this.activePowerup = null;
          document.querySelectorAll(".powerup-btn").forEach(b => b.classList.remove("active"));
          this.updateMissionProgress("m4", 1);
          this.updateUIHeaders();
          this.saveData();
          this.renderTrayPieces();
          this.checkGameOver();
        }
      }
    };

    let tapStartX = 0;
    let tapStartY = 0;
    this.canvas.addEventListener("touchstart", (e) => {
      if (e.touches && e.touches[0]) {
        tapStartX = e.touches[0].clientX;
        tapStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.canvas.addEventListener("touchend", (e) => {
      if (!this.activePowerup) return;
      const touch = e.changedTouches ? e.changedTouches[0] : null;
      if (!touch) return;
      if (Math.hypot(touch.clientX - tapStartX, touch.clientY - tapStartY) < 18) {
        handleCellAction(touch.clientX, touch.clientY);
      }
    });

    this.canvas.addEventListener("click", (e) => {
      if (!this.activePowerup) return;
      handleCellAction(e.clientX, e.clientY);
    });

    // Pieces Tray Dragging Initiation
    let isTouchActive = false;

    const onPointerDown = (e) => {
      if (e.type.startsWith("touch")) {
        isTouchActive = true;
      } else if (isTouchActive) {
        return;
      }

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      // Find if clicked inside a tray slot
      for (let i = 0; i < 3; i++) {
        const slot = document.getElementById(`slot-${i}`);
        if (!slot) continue;
        const rect = slot.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
          const piece = this.trayPieces[i];
          if (piece && !piece.placed) {
            this.isDragging = true;
            this.draggingPiece = piece;
            this.dragSlotIndex = i;
            this.screenClientX = clientX;
            this.screenClientY = clientY;

            const bRect = this.canvas.getBoundingClientRect();
            this.pointerX = clientX - bRect.left;
            this.pointerY = clientY - bRect.top;

            slot.style.opacity = "0.2";
            SOUND.playBlockPickup();
            e.preventDefault();
            break;
          }
        }
      }
    };

    const onPointerMove = (e) => {
      if (!this.isDragging || !this.draggingPiece) return;
      if (!e.type.startsWith("touch") && isTouchActive) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      this.screenClientX = clientX;
      this.screenClientY = clientY;

      const bRect = this.canvas.getBoundingClientRect();
      this.pointerX = clientX - bRect.left;
      this.pointerY = clientY - bRect.top;

      // Calculate corresponding board cell for top-left of piece
      const rows = this.draggingPiece.matrix.length;
      const cols = this.draggingPiece.matrix[0].length;
      const pieceW = cols * this.cellSize;
      const pieceH = rows * this.cellSize;

      const visualTopLeftX = this.pointerX - pieceW / 2;
      const visualTopLeftY = this.pointerY - pieceH / 2 - this.dragOffsetY;

      // Trail effect
      this.ps.addTrailParticle(clientX, clientY - this.dragOffsetY, this.equippedTrail);

      // Snap to nearest grid coordinate
      const snappedCol = Math.round(visualTopLeftX / this.cellSize);
      const snappedRow = Math.round(visualTopLeftY / this.cellSize);

      if (snappedCol >= 0 && snappedCol + cols <= 10 && snappedRow >= 0 && snappedRow + rows <= 10) {
        const prevCol = this.hoverCol;
        const prevRow = this.hoverRow;
        this.hoverCol = snappedCol;
        this.hoverRow = snappedRow;
        this.isValidHover = this.canPlacePiece(this.draggingPiece.matrix, snappedRow, snappedCol);
        if (this.isValidHover && (prevCol !== snappedCol || prevRow !== snappedRow)) {
          SOUND.playSnapFeedback();
        }
      } else {
        this.hoverCol = -1;
        this.hoverRow = -1;
        this.isValidHover = false;
      }

      e.preventDefault();
    };

    const onPointerUp = (e) => {
      if (!this.isDragging || !this.draggingPiece) {
        if (e.type.startsWith("touch")) setTimeout(() => { isTouchActive = false; }, 300);
        return;
      }
      if (!e.type.startsWith("touch") && isTouchActive) return;

      if (this.isValidHover && this.hoverRow !== -1 && this.hoverCol !== -1) {
        this.placePiece(this.draggingPiece, this.hoverRow, this.hoverCol);
      } else {
        // Return piece back to tray
        this.renderTrayPieces();
        if (this.hoverRow !== -1 && !this.isValidHover) {
          SOUND.playInvalid();
        }
      }

      this.isDragging = false;
      this.draggingPiece = null;
      this.dragSlotIndex = -1;
      this.hoverCol = -1;
      this.hoverRow = -1;
      this.isValidHover = false;

      if (e.type.startsWith("touch")) {
        setTimeout(() => { isTouchActive = false; }, 300);
      }
    };

    window.addEventListener("touchstart", onPointerDown, { passive: false });
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);
    window.addEventListener("touchcancel", onPointerUp);

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    // Modal navigation
    this.setupModalEvents();
  }

  setupModalEvents() {
    // Open modal buttons
    const bindModal = (btnId, modalId, onOpen) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener("click", () => {
          if (onOpen) onOpen();
          document.getElementById(modalId)?.classList.add("active");
          SOUND.playButtonClick();
        });
      }
    };

    bindModal("btn-home-settings", "modal-settings");
    bindModal("btn-themes", "modal-collection", () => this.renderCollectionModal("skins"));
    bindModal("btn-missions", "modal-missions", () => this.renderMissionsModal());
    bindModal("btn-achievements", "modal-achievements", () => this.renderAchievementsModal());
    bindModal("btn-shop", "modal-shop", () => this.renderShopModal());
    bindModal("btn-leaderboard", "modal-leaderboard", () => this.renderLeaderboardModal());
    bindModal("btn-daily-challenge", "modal-daily-reward", () => this.renderDailyRewardModal());
    bindModal("btn-profile-stats", "modal-profile", () => this.renderProfileModal());
    bindModal("home-avatar-btn", "modal-profile", () => this.renderProfileModal());

    // Daily Claim Button
    document.getElementById("btn-claim-daily-reward")?.addEventListener("click", () => {
      this.claimDailyReward();
    });

    // Collection Locker Tabs
    document.querySelectorAll(".collection-tab-btn").forEach(tabBtn => {
      tabBtn.addEventListener("click", () => {
        const cat = tabBtn.getAttribute("data-tab");
        SOUND.playButtonClick();
        this.renderCollectionModal(cat);
      });
    });

    // Profile Tutorial Shortcut
    document.getElementById("btn-open-tutorial-profile")?.addEventListener("click", () => {
      document.getElementById("modal-profile")?.classList.remove("active");
      document.getElementById("modal-tutorial")?.classList.add("active");
      SOUND.playButtonClick();
    });

    // Close buttons
    document.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => {
        const mid = btn.getAttribute("data-close");
        if (mid) document.getElementById(mid)?.classList.remove("active");
        SOUND.playButtonClick();
      });
    });

    // Developer Option
    document.getElementById("btn-developer-option")?.addEventListener("click", () => {
      document.getElementById("modal-developer")?.classList.add("active");
      SOUND.playButtonClick();
    });

    // Tutorial buttons
    document.getElementById("btn-show-tutorial-settings")?.addEventListener("click", () => {
      document.getElementById("modal-settings")?.classList.remove("active");
      document.getElementById("modal-tutorial")?.classList.add("active");
      SOUND.playButtonClick();
    });

    document.getElementById("btn-tutorial-ok")?.addEventListener("click", () => {
      document.getElementById("modal-tutorial")?.classList.remove("active");
      SOUND.playButtonClick();
    });

    // Settings toggles
    document.getElementById("toggle-sfx")?.addEventListener("change", () => SOUND.toggleSfx());
    document.getElementById("toggle-music")?.addEventListener("change", () => SOUND.toggleMusic());
    document.getElementById("toggle-vibe")?.addEventListener("change", () => SOUND.toggleVibration());
    document.getElementById("toggle-shake")?.addEventListener("change", (e) => {
      this.screenShakeEnabled = e.target.checked;
      this.ps.shakeEnabled = this.screenShakeEnabled;
      this.saveData();
    });

    // Language selector
    document.getElementById("select-language")?.addEventListener("change", (e) => {
      this.currentLang = e.target.value;
      this.applyLanguage(this.currentLang);
      this.saveData();
    });

    // Reset data
    document.getElementById("btn-reset-data")?.addEventListener("click", () => {
      if (confirm(TRANSLATIONS[this.currentLang]?.reset_confirm || "Reset progress?")) {
        localStorage.removeItem("BLOCKVERSE_SAVE_V1");
        location.reload();
      }
    });

    // Start Daily Challenge
    document.getElementById("btn-start-daily")?.addEventListener("click", () => {
      document.getElementById("modal-daily")?.classList.remove("active");
      this.startNewGame("daily");
    });
  }

  applyLanguage(lang) {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
    document.getElementById("txt-play").innerText = t.play;
    document.getElementById("txt-mode-classic").innerText = t.mode_classic;
    document.getElementById("txt-mode-timerush").innerText = t.mode_timerush;
    document.getElementById("txt-mode-zen").innerText = t.mode_zen;
    document.getElementById("txt-score-label").innerText = t.score;
    document.getElementById("txt-best-label").innerText = t.best;
    document.getElementById("txt-paused-title").innerText = t.paused;
    document.getElementById("btn-pause-resume").innerText = t.resume;
    document.getElementById("btn-pause-restart").innerText = t.restart;
    document.getElementById("btn-pause-home").innerText = t.home;
    document.getElementById("btn-gameover-replay").innerText = t.play_again;
    document.getElementById("btn-gameover-home").innerText = t.home;
    document.getElementById("btn-gameover-share").innerText = t.share_score;
    const txtShake = document.getElementById("txt-setting-shake");
    if (txtShake && t.screen_shake) txtShake.innerText = t.screen_shake;
    const txtVibe = document.getElementById("txt-setting-vibe");
    if (txtVibe && t.vibration) txtVibe.innerText = t.vibration;
    const txtMusic = document.getElementById("txt-setting-music");
    if (txtMusic && t.music) txtMusic.innerText = t.music;
    const txtSfx = document.getElementById("txt-setting-sfx");
    if (txtSfx && t.sound_fx) txtSfx.innerText = t.sound_fx;
    const txtDev = document.getElementById("txt-setting-developer");
    if (txtDev && t.developer_option) {
      txtDev.innerHTML = `<span>👨‍💻</span> <span>${t.developer_option}</span>`;
    }
    const txtDevModal = document.getElementById("txt-developer-modal-title");
    if (txtDevModal && t.developer_title) {
      txtDevModal.innerText = t.developer_title;
    }
  }

  renderThemesModal() {
    const container = document.getElementById("themes-container");
    if (!container) return;
    container.innerHTML = "";

    Object.values(THEMES).forEach(theme => {
      const card = document.createElement("div");
      card.className = "theme-card" + (this.currentTheme.id === theme.id ? " active" : "");

      let paletteHTML = `<div class="theme-palette-preview">`;
      theme.colors.forEach(c => paletteHTML += `<div style="background:${c.main}"></div>`);
      paletteHTML += `</div>`;

      let btnLabel = theme.unlocked ? (this.currentTheme.id === theme.id ? "EQUIPPED" : "USE") : `🪙 ${theme.price}`;

      card.innerHTML = `
        <div style="font-weight:900; font-size:14px; color:#fff;">${theme.name}</div>
        ${paletteHTML}
        <button class="${theme.unlocked ? 'btn-secondary-neon' : 'btn-primary-neon'}" style="padding:6px; font-size:12px; margin-top:4px;">${btnLabel}</button>
      `;

      card.querySelector("button").addEventListener("click", () => {
        if (theme.unlocked) {
          this.currentTheme = theme;
          SOUND.playButtonClick();
          this.renderThemesModal();
          this.renderTrayPieces();
          this.saveData();
        } else {
          if (this.coins >= theme.price) {
            this.coins -= theme.price;
            theme.unlocked = true;
            this.currentTheme = theme;
            SOUND.playPowerup();
            this.renderThemesModal();
            this.renderTrayPieces();
            this.updateUIHeaders();
            this.saveData();
          } else {
            SOUND.playInvalid();
          }
        }
      });

      container.appendChild(card);
    });
  }

  renderMissionsModal() {
    const list = document.getElementById("missions-list");
    if (!list) return;
    list.innerHTML = "";

    this.missions.forEach(m => {
      const item = document.createElement("div");
      item.className = "mission-item";
      const pct = Math.min(100, Math.floor((m.current / m.target) * 100));

      item.innerHTML = `
        <div class="mission-top">
          <span style="font-weight:800; font-size:13px; color:#fff;">${m.text}</span>
          <span style="font-size:12px; font-weight:900; color:#ffd700;">+${m.reward} 🪙</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar" style="width:${pct}%"></div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
          <span style="font-size:11px; color:#8b9bb4;">${m.current} / ${m.target}</span>
          <button class="${pct >= 100 && !m.claimed ? 'btn-primary-neon' : 'btn-secondary-neon'}" style="padding:4px 12px; font-size:11px;" ${pct < 100 || m.claimed ? 'disabled' : ''}>
            ${m.claimed ? 'CLAIMED' : (pct >= 100 ? 'CLAIM' : 'IN PROGRESS')}
          </button>
        </div>
      `;

      if (pct >= 100 && !m.claimed) {
        item.querySelector("button").addEventListener("click", () => {
          m.claimed = true;
          this.coins += m.reward;
          SOUND.playCoinReward();
          this.renderMissionsModal();
          this.updateUIHeaders();
          this.saveData();
        });
      }

      list.appendChild(item);
    });
  }

  renderAchievementsModal() {
    const list = document.getElementById("achievements-list");
    if (!list) return;
    list.innerHTML = "";

    this.achievements.forEach(a => {
      const item = document.createElement("div");
      item.className = "settings-row";
      item.style.borderColor = a.unlocked ? "#ffd700" : "rgba(255,255,255,0.08)";

      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:24px;">${a.unlocked ? '🏆' : '🔒'}</span>
          <div>
            <div style="font-weight:900; font-size:13px; color:${a.unlocked ? '#ffd700' : '#8b9bb4'};">${a.title}</div>
            <div style="font-size:11px; color:#8b9bb4;">${a.desc}</div>
          </div>
        </div>
        <div style="font-size:12px; font-weight:900; color:#ff007f;">+${a.rewardGems} 💎</div>
      `;

      list.appendChild(item);
    });
  }

  renderShopModal() {
    const list = document.getElementById("shop-items-list");
    if (!list) return;
    list.innerHTML = "";

    const shopItems = [
      { key: "hammer", name: "Hammer x3", desc: "Smash any single stubborn block", price: 150, currency: "coins", icon: "🔨", count: 3 },
      { key: "lightning", name: "Lightning x2", desc: "Vaporize an entire row or column", price: 250, currency: "coins", icon: "⚡", count: 2 },
      { key: "colorbomb", name: "Color Bomb x2", desc: "Obliterate all blocks of one color", price: 300, currency: "coins", icon: "💣", count: 2 },
      { key: "shuffle", name: "Shuffle x3", desc: "Re-roll 3 brand new random pieces", price: 120, currency: "coins", icon: "🔄", count: 3 },
      { key: "undo", name: "Undo x3", desc: "Revert your last placed piece", price: 100, currency: "coins", icon: "↩️", count: 3 },
      { key: "magnet", name: "Magnet x2", desc: "Auto-fit a piece into the best slot", price: 5, currency: "gems", icon: "🧲", count: 2 }
    ];

    shopItems.forEach(item => {
      const row = document.createElement("div");
      row.className = "settings-row";

      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:24px;">${item.icon}</span>
          <div>
            <div style="font-weight:900; font-size:13px; color:#fff;">${item.name}</div>
            <div style="font-size:11px; color:#8b9bb4;">${item.desc}</div>
          </div>
        </div>
        <button class="btn-primary-neon" style="padding:6px 14px; font-size:12px; width:auto;">
          ${item.currency === 'coins' ? `🪙 ${item.price}` : `💎 ${item.price}`}
        </button>
      `;

      row.querySelector("button").addEventListener("click", () => {
        if (item.currency === "coins") {
          if (this.coins >= item.price) {
            this.coins -= item.price;
            this.powerups[item.key] += item.count;
            SOUND.playCoinReward();
            this.updateUIHeaders();
            this.saveData();
          } else {
            SOUND.playInvalid();
          }
        } else {
          if (this.gems >= item.price) {
            this.gems -= item.price;
            this.powerups[item.key] += item.count;
            SOUND.playCoinReward();
            this.updateUIHeaders();
            this.saveData();
          } else {
            SOUND.playInvalid();
          }
        }
      });

      list.appendChild(row);
    });
  }

  renderLeaderboardModal() {
    const list = document.getElementById("leaderboard-list");
    if (!list) return;
    list.innerHTML = "";

    // Sort leaderboard by score descending
    this.leaderboard.sort((a, b) => b.score - a.score);

    this.leaderboard.forEach((user, idx) => {
      const row = document.createElement("div");
      row.className = "settings-row";
      if (user.isUser) {
        row.style.borderColor = "#00f0ff";
        row.style.background = "rgba(0, 240, 255, 0.12)";
      }

      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:14px; font-weight:900; color:${idx < 3 ? '#ffd700' : '#8b9bb4'}; width:20px;">#${idx + 1}</span>
          <span style="font-size:20px;">${user.avatar}</span>
          <div>
            <div style="font-weight:900; font-size:13px; color:#fff;">${user.name}</div>
            <div style="font-size:10px; color:#00f0ff;">LVL ${user.level}</div>
          </div>
        </div>
        <div style="font-size:16px; font-weight:900; color:#00f0ff;">${user.score.toLocaleString()}</div>
      `;

      list.appendChild(row);
    });
  }

  renderProfileModal() {
    const avatarEl = document.getElementById("profile-avatar-display");
    const homeAvatar = document.getElementById("home-avatar-btn");
    if (avatarEl) avatarEl.innerText = this.userAvatar;
    if (homeAvatar) homeAvatar.innerText = this.userAvatar;

    const rankIdx = Math.min(this.levelTitles.length - 1, Math.floor((this.level - 1) / 3));
    const rankTitle = this.levelTitles[rankIdx];
    const rankEl = document.getElementById("profile-player-rank");
    if (rankEl) rankEl.innerText = `LVL ${this.level} • ${rankTitle}`;

    // Career Stats
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = typeof val === "number" ? val.toLocaleString() : val;
    };
    setTxt("profile-stat-best", this.bestScore);
    setTxt("profile-stat-lines", this.totalLinesCleared);
    setTxt("profile-stat-combo", `${this.highestCombo}x`);
    setTxt("profile-stat-chain", `${this.longestChain}x`);
    setTxt("profile-stat-games", this.totalGamesPlayed);
    setTxt("profile-stat-blocks", this.totalBlocksPlaced);

    // XP Progress
    const xpNeeded = this.level * 200;
    const pct = Math.min(100, Math.floor((this.xp / xpNeeded) * 100));
    const xpFill = document.getElementById("profile-xp-fill");
    if (xpFill) xpFill.style.width = `${pct}%`;
    const xpTxt = document.getElementById("profile-xp-text");
    if (xpTxt) xpTxt.innerText = `${this.xp} / ${xpNeeded} XP`;

    // Avatars
    document.querySelectorAll(".avatar-opt-btn").forEach(btn => {
      const av = btn.getAttribute("data-avatar");
      if (av === this.userAvatar) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
      btn.onclick = () => {
        this.userAvatar = av;
        SOUND.playButtonClick();
        this.renderProfileModal();
        this.saveData();
      };
    });
  }

  renderDailyRewardModal() {
    const streakEl = document.getElementById("daily-streak-num");
    if (streakEl) streakEl.innerText = `${this.dailyStreak} DAYS`;

    const grid = document.getElementById("daily-reward-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const todayStr = new Date().toDateString();
    const canClaim = this.lastDailyRewardDate !== todayStr;

    DAILY_7DAY_REWARDS.forEach(reward => {
      const card = document.createElement("div");
      const isPast = reward.day < this.dailyRewardDay;
      const isCurrent = reward.day === this.dailyRewardDay;

      card.className = "daily-day-card" + (isCurrent ? " current" : "") + (isPast ? " claimed" : "");

      card.innerHTML = `
        <div class="daily-day-label">DAY ${reward.day}</div>
        <div class="daily-reward-icon">${reward.icon}</div>
        <div class="daily-reward-name">${reward.name}</div>
        <div class="daily-reward-desc">${reward.desc}</div>
        ${isPast ? '<div style="color:#00f0ff; font-size:10px; font-weight:900; margin-top:4px;">CLAIMED ✓</div>' : (isCurrent && canClaim ? '<div style="color:#ffe600; font-size:10px; font-weight:900; margin-top:4px;">READY!</div>' : '')}
      `;
      grid.appendChild(card);
    });

    const claimBtn = document.getElementById("btn-claim-daily-reward");
    const hintEl = document.getElementById("daily-claim-hint");
    if (claimBtn) {
      claimBtn.disabled = !canClaim;
      claimBtn.style.opacity = canClaim ? "1" : "0.5";
      claimBtn.innerText = canClaim ? `CLAIM DAY ${this.dailyRewardDay} REWARD` : "ALREADY CLAIMED TODAY";
    }
    if (hintEl) {
      hintEl.innerText = canClaim ? "Log in every day to keep your streak and unlock exclusive Gold Blocks!" : "Come back tomorrow for your next daily reward!";
    }
  }

  claimDailyReward() {
    const todayStr = new Date().toDateString();
    if (this.lastDailyRewardDate === todayStr) {
      SOUND.playInvalid();
      return;
    }

    const currentReward = DAILY_7DAY_REWARDS.find(r => r.day === this.dailyRewardDay) || DAILY_7DAY_REWARDS[0];

    // Grant rewards
    if (currentReward.coins) this.coins += currentReward.coins;
    if (currentReward.gems) this.gems += currentReward.gems;
    if (currentReward.powerups) {
      Object.keys(currentReward.powerups).forEach(pk => {
        this.powerups[pk] = (this.powerups[pk] || 0) + currentReward.powerups[pk];
      });
    }
    if (currentReward.skin) {
      const skinItem = COLLECTIONS.skins.find(s => s.id === currentReward.skin);
      if (skinItem) skinItem.unlocked = true;
    }

    SOUND.playDailyReward();
    this.ps.addConfetti(window.innerWidth / 2, window.innerHeight / 2, 70);

    this.lastDailyRewardDate = todayStr;
    this.dailyStreak++;
    this.dailyRewardDay = (this.dailyRewardDay % 7) + 1;

    this.updateUIHeaders();
    this.saveData();
    this.renderDailyRewardModal();
  }

  renderCollectionModal(category = "skins") {
    this.activeCollectionTab = category;

    // Update Tab Buttons
    document.querySelectorAll(".collection-tab-btn").forEach(btn => {
      if (btn.getAttribute("data-tab") === category) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    const grid = document.getElementById("collection-items-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const items = COLLECTIONS[category] || [];

    items.forEach(item => {
      const card = document.createElement("div");
      const isEquipped =
        (category === "skins" && this.equippedSkin === item.id) ||
        (category === "boards" && this.equippedBoard === item.id) ||
        (category === "particles" && this.equippedParticle === item.id) ||
        (category === "trails" && this.equippedTrail === item.id);

      card.className = "collection-item-card" + (isEquipped ? " active" : "");

      let previewContent = "";
      if (category === "skins" && item.palette) {
        previewContent = `<div class="theme-palette-preview">` +
          item.palette.map(col => `<div style="background:${col}"></div>`).join("") +
          `</div>`;
      } else {
        previewContent = `<div style="font-size:32px; text-shadow:0 0 14px #00f0ff;">${item.preview || '✨'}</div>`;
      }

      let btnLabel = isEquipped ? "EQUIPPED" : (item.unlocked ? "EQUIP" : (item.currency === "gems" ? `💎 ${item.price}` : `🪙 ${item.price}`));

      card.innerHTML = `
        <div class="collection-item-header">
          <div class="collection-item-title">${item.name}</div>
          <div class="collection-item-desc">${item.desc}</div>
        </div>
        <div class="collection-item-preview">
          ${previewContent}
        </div>
        <button class="${isEquipped ? 'btn-secondary-neon' : (item.unlocked ? 'btn-primary-neon' : 'btn-accent-pink')}" style="padding:6px; font-size:11px; margin-top:4px;">
          ${btnLabel}
        </button>
      `;

      card.querySelector("button").onclick = () => {
        if (isEquipped) return;

        if (item.unlocked) {
          if (category === "skins") {
            this.equippedSkin = item.id;
            if (THEMES[item.id]) this.currentTheme = THEMES[item.id];
          } else if (category === "boards") {
            this.equippedBoard = item.id;
          } else if (category === "particles") {
            this.equippedParticle = item.id;
          } else if (category === "trails") {
            this.equippedTrail = item.id;
          }
          SOUND.playButtonClick();
          this.saveData();
          this.renderCollectionModal(category);
          this.renderTrayPieces();
        } else {
          // Purchase item
          if (item.currency === "gems") {
            if (this.gems >= item.price) {
              this.gems -= item.price;
              item.unlocked = true;
              SOUND.playCoinReward();
              this.updateUIHeaders();
              this.saveData();
              this.renderCollectionModal(category);
            } else {
              SOUND.playInvalid();
            }
          } else {
            if (this.coins >= item.price) {
              this.coins -= item.price;
              item.unlocked = true;
              SOUND.playCoinReward();
              this.updateUIHeaders();
              this.saveData();
              this.renderCollectionModal(category);
            } else {
              SOUND.playInvalid();
            }
          }
        }
      };

      grid.appendChild(card);
    });
  }
}

// Instantiate Game on DOMContentLoaded
window.addEventListener("DOMContentLoaded", () => {
  window.GAME = new BlockverseGame();
});
