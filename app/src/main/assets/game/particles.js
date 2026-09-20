// BLOCKVERSE: NEON RUSH - High Performance Particle & FX Engine

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.lasers = [];
    this.bgParticles = [];
    this.shakeIntensity = 0;
    this.shakeDecay = 0.85;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeEnabled = true;
    this.quality = "high"; // high, medium, low
    this.initBgParticles();
  }

  setQuality(q) {
    this.quality = q;
  }

  getQualityFactor() {
    if (this.quality === "low") return 0.5;
    if (this.quality === "medium") return 0.8;
    return 1.0;
  }

  initBgParticles() {
    this.bgParticles = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      this.bgParticles.push({
        x: Math.random() * (window.innerWidth || 400),
        y: Math.random() * (window.innerHeight || 800),
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.2,
        size: Math.random() * 2.5 + 1,
        color: Math.random() > 0.5 ? "rgba(0, 240, 255," : "rgba(176, 38, 255,",
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseVal: Math.random() * Math.PI
      });
    }
  }

  addShake(amount) {
    if (!this.shakeEnabled) return;
    // Cap at a subtle, gentle rumble (max 5px) instead of violent jumping
    this.shakeIntensity = Math.min(5, this.shakeIntensity + amount * 0.2);
  }

  // Laser beam sweep along an entire cleared row or column
  addLaserLine(isRow, index, cellSize, color = "#00f0ff") {
    this.lasers.push({
      isRow: isRow,
      index: index,
      cellSize: cellSize,
      color: color,
      progress: 0,
      alpha: 1.0,
      width: cellSize * 0.85,
      decay: 0.038
    });
  }

  // Touch / Drag trail particle
  addTrailParticle(x, y, style = "laser_pulse", color = "#00f0ff") {
    const factor = this.getQualityFactor();
    if (Math.random() > factor) return;

    if (style === "rainbow_stream") {
      const rainbowColors = ["#00f0ff", "#39ff14", "#ffe600", "#ff7700", "#ff007f", "#b026ff"];
      color = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
    } else if (style === "fire_magma") {
      color = Math.random() > 0.5 ? "#ff3300" : "#ffaa00";
    }

    this.particles.push({
      type: style === "stardust" ? "star" : "spark",
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 12,
      vx: (Math.random() - 0.5) * 2.5,
      vy: (Math.random() - 0.5) * 2.5 + 1.2,
      prevX: x,
      prevY: y,
      size: Math.random() * 4 + 2,
      color: color,
      life: 1.0,
      decay: style === "stardust" ? 0.03 : 0.05
    });
  }

  // Bomb 3x3 Explosion Burst
  addBombExplosion(cx, cy, cellSize) {
    this.addShake(6);
    this.addShockwave(cx, cy, "#ff3300", cellSize * 4.5);
    this.addShockwave(cx, cy, "#ffe600", cellSize * 2.5);

    const factor = this.getQualityFactor();
    const count = Math.floor(35 * factor);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      const color = Math.random() > 0.4 ? (Math.random() > 0.5 ? "#ff2200" : "#ff7700") : "#ffe600";

      this.particles.push({
        type: "spark",
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        prevX: cx,
        prevY: cy,
        size: Math.random() * 5 + 2,
        color: color,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }

  // Ice Crystal Shatter Burst
  addIceShatter(cx, cy, cellSize) {
    this.addShake(3);
    this.addShockwave(cx, cy, "#7df2ff", cellSize * 2);

    const factor = this.getQualityFactor();
    const count = Math.floor(20 * factor);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        type: "fragment",
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        gravity: 0.22,
        size: Math.random() * (cellSize * 0.35) + 3,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.4,
        color: "rgba(180, 240, 255, 0.85)",
        lightColor: "#ffffff",
        darkColor: "#55ccff",
        glowColor: "rgba(0, 229, 255, 0.9)",
        life: 1.0,
        decay: Math.random() * 0.028 + 0.02
      });
    }
  }

  // Lightning Arc Discharge between two points
  addLightningArc(x1, y1, x2, y2, color = "#00f0ff") {
    this.addShake(2);
    const count = 12;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const px = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 20;
      const py = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20;
      this.particles.push({
        type: "spark",
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        prevX: px,
        prevY: py,
        size: Math.random() * 3 + 2,
        color: color,
        life: 1.0,
        decay: 0.06
      });
    }
  }

  // Rainbow Prism Starburst
  addRainbowPrism(cx, cy, cellSize) {
    this.addShake(15);
    const colors = ["#ff0055", "#ff7700", "#ffe600", "#39ff14", "#00f0ff", "#b026ff"];
    colors.forEach((c, idx) => {
      this.addShockwave(cx, cy, c, cellSize * (1.8 + idx * 0.3));
    });

    const count = 30;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      const color = colors[i % colors.length];
      this.particles.push({
        type: "spark",
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        prevX: cx,
        prevY: cy,
        size: Math.random() * 4 + 2,
        color: color,
        life: 1.0,
        decay: 0.025
      });
    }
  }

  // Explode a block cell into 3D shattered fragments and sparks
  explodeCell(cx, cy, cellSize, colorObj, isIntersection = false) {
    const factor = this.getQualityFactor();
    const fragCount = Math.floor((isIntersection ? 12 : 7) * factor);

    // 3D beveled block fragments
    for (let i = 0; i < fragCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 7 + 4) * (isIntersection ? 1.3 : 1.0);
      const size = (cellSize / 3) * (0.6 + Math.random() * 0.6);

      this.particles.push({
        type: "fragment",
        x: cx + (Math.random() - 0.5) * cellSize * 0.5,
        y: cy + (Math.random() - 0.5) * cellSize * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.8,
        gravity: 0.26,
        size: size,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3,
        color: colorObj.main,
        lightColor: colorObj.light,
        darkColor: colorObj.dark || colorObj.main,
        glowColor: colorObj.glow,
        life: 1.0,
        decay: Math.random() * 0.024 + 0.018
      });
    }

    // High velocity neon laser sparks with motion arcs
    const sparkCount = Math.floor((isIntersection ? 18 : 10) * factor);
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 5;
      this.particles.push({
        type: "spark",
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        prevX: cx,
        prevY: cy,
        size: Math.random() * 3 + 1.5,
        color: colorObj.light || "#ffffff",
        life: 1.0,
        decay: Math.random() * 0.045 + 0.03
      });
    }
  }

  // Expanding luminous neon shockwave
  addShockwave(x, y, color = "#00f0ff", maxRadius = 180) {
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 8,
      maxRadius: maxRadius,
      color: color,
      alpha: 1.0,
      decay: 0.035,
      lineWidth: 6
    });
  }

  // Floating score text with scale and rise
  addFloatingText(text, x, y, color = "#00f0ff", size = 26, isCombo = false) {
    this.floatingTexts.push({
      text: text,
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: isCombo ? -3.5 : -2.8,
      color: color,
      size: size,
      scale: 1.8,
      targetScale: 1.0,
      alpha: 1.0,
      decay: isCombo ? 0.016 : 0.024,
      isCombo: isCombo
    });
  }

  // Large holographic combo/multi-clear banner
  addMultiClearBadge(title, subtitle, x, y, color = "#00f0ff") {
    this.floatingTexts.push({
      text: title,
      subtext: subtitle,
      x: x,
      y: y,
      vx: 0,
      vy: -1.2,
      color: color,
      size: 32,
      scale: 2.2,
      targetScale: 1.0,
      alpha: 1.0,
      decay: 0.015,
      isBadge: true
    });
  }

  // Confetti shower for major achievements or new records
  addConfetti(x, y, count = 70) {
    const factor = this.getQualityFactor();
    const total = Math.floor(count * factor);
    const colors = ["#00f0ff", "#b026ff", "#39ff14", "#ff7700", "#ff007f", "#ffe600", "#ffffff"];

    for (let i = 0; i < total; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 14 + 5;
      this.particles.push({
        type: "confetti",
        x: x || 200,
        y: y || 200,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 7,
        gravity: 0.22,
        w: Math.random() * 9 + 6,
        h: Math.random() * 6 + 3,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.35,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: Math.random() * 0.015 + 0.011
      });
    }
  }

  update(dt = 1) {
    // Screen shake
    if (this.shakeIntensity > 0.1 && this.shakeEnabled) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.shakeIntensity = 0;
      this.shakeX = 0;
      this.shakeY = 0;
    }

    // Laser beams along cleared lines
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.progress += 0.12 * dt;
      l.alpha -= l.decay * dt;
      if (l.alpha <= 0) {
        this.lasers.splice(i, 1);
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (p.prevX !== undefined) {
        p.prevX = p.x;
        p.prevY = p.y;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;
      if (p.rotation !== undefined && p.vRot) p.rotation += p.vRot * dt;
      p.life -= p.decay * dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.18 * dt + 3;
      sw.alpha -= sw.decay * dt;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Floating text & Badges
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.x += ft.vx * dt;
      ft.y += ft.vy * dt;
      ft.vy *= 0.95;
      if (ft.scale > ft.targetScale) {
        ft.scale -= 0.08 * dt;
      }
      ft.alpha -= ft.decay * dt;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Background ambient particles
    const w = window.innerWidth || 400;
    const h = window.innerHeight || 800;
    for (let p of this.bgParticles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.pulseVal += p.pulseSpeed * dt;
      if (p.y < -10) p.y = h + 10;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
    }
  }

  renderBg(ctx, width, height, opts = {}) {
    const score = opts.score || 0;
    const combo = opts.combo || 1;
    const isFever = opts.isFever || false;
    const level = opts.level || 1;
    const now = performance.now() * 0.001;

    // Calm Stable Perspective Grid Lines
    ctx.save();
    const centerX = width / 2;
    const numLines = 8;
    ctx.strokeStyle = isFever ? "rgba(255, 0, 128, 0.14)" : "rgba(0, 240, 255, 0.08)";
    ctx.lineWidth = 1;

    for (let i = -numLines; i <= numLines; i++) {
      const topX = centerX + (i * width) / (numLines * 2.2);
      const botX = centerX + (i * width * 1.3) / numLines;
      ctx.beginPath();
      ctx.moveTo(topX, 0);
      ctx.lineTo(botX, height);
      ctx.stroke();
    }

    // Stable Horizontal Perspective Lines
    const step = height / 10;
    for (let y = step; y < height; y += step) {
      const progress = y / height;
      ctx.globalAlpha = Math.min(0.4, progress * 0.5);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // Fever Mode Perimeter Aura Pulse (Gentle, warm glow without strobe)
    if (isFever) {
      ctx.save();
      const feverPulse = Math.sin(now * 3) * 0.5 + 0.5;
      const borderGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width * 0.75);
      borderGrad.addColorStop(0, "rgba(255, 0, 128, 0)");
      borderGrad.addColorStop(1, `rgba(255, 0, 128, ${0.12 + feverPulse * 0.06})`);
      ctx.fillStyle = borderGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // Ambient floating particles
    for (let p of this.bgParticles) {
      const currentAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulseVal));
      ctx.fillStyle = isFever ? `rgba(255, 128, 200, ${currentAlpha})` : p.color + currentAlpha + ")";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (isFever ? 1.4 : 1.0), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);

    // Render Laser Beams along rows/columns
    for (let l of this.lasers) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, l.alpha);
      const beamW = l.cellSize * 10;
      const beamH = l.cellSize;

      if (l.isRow) {
        const y = l.index * l.cellSize;
        const grad = ctx.createLinearGradient(0, y, 0, y + beamH);
        grad.addColorStop(0, "rgba(255, 255, 255, 0)");
        grad.addColorStop(0.5, l.color);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = grad;
        ctx.shadowColor = l.color;
        ctx.shadowBlur = 20;
        ctx.fillRect(0, y + (beamH - l.width) / 2, beamW, l.width);

        // Core white laser beam
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, y + beamH / 2 - 2, beamW, 4);
      } else {
        const x = l.index * l.cellSize;
        const grad = ctx.createLinearGradient(x, 0, x + beamH, 0);
        grad.addColorStop(0, "rgba(255, 255, 255, 0)");
        grad.addColorStop(0.5, l.color);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = grad;
        ctx.shadowColor = l.color;
        ctx.shadowBlur = 20;
        ctx.fillRect(x + (beamH - l.width) / 2, 0, l.width, beamW);

        // Core white laser beam
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + beamH / 2 - 2, 0, 4, beamW);
      }
      ctx.restore();
    }

    // Shockwaves
    for (let sw of this.shockwaves) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.lineWidth;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Particles
    for (let p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);

      if (p.type === "fragment") {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.shadowColor = p.glowColor || p.color;
        ctx.shadowBlur = 12;

        const s = p.size;
        // Beveled 3D gradient shard
        const fGrad = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
        fGrad.addColorStop(0, p.lightColor || "#ffffff");
        fGrad.addColorStop(0.5, p.color);
        fGrad.addColorStop(1, p.darkColor || p.color);

        ctx.fillStyle = fGrad;
        ctx.fillRect(-s / 2, -s / 2, s, s);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1;
        ctx.strokeRect(-s / 2, -s / 2, s, s);

      } else if (p.type === "spark") {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(p.prevX || p.x, p.prevY || p.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

      } else if (p.type === "confetti") {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }

      ctx.restore();
    }

    // Floating text & Badges
    for (let ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);

      if (ft.isBadge) {
        // Holographic cyber banner box
        const boxW = 240;
        const boxH = 54;
        ctx.fillStyle = "rgba(4, 8, 24, 0.9)";
        ctx.strokeStyle = ft.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 24;

        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 14) : ctx.rect(-boxW / 2, -boxH / 2, boxW, boxH);
        ctx.fill();
        ctx.stroke();

        ctx.font = "900 18px 'Orbitron', 'Rajdhani', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(ft.text, 0, -8);

        if (ft.subtext) {
          ctx.font = "800 11px 'Orbitron', 'Rajdhani', sans-serif";
          ctx.fillStyle = ft.color;
          ctx.fillText(ft.subtext, 0, 12);
        }
      } else {
        ctx.font = `900 ${ft.size}px 'Orbitron', 'Rajdhani', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(ft.text, 0, 0);

        ctx.lineWidth = 2;
        ctx.strokeStyle = ft.color;
        ctx.strokeText(ft.text, 0, 0);
      }

      ctx.restore();
    }

    ctx.restore();
  }
}
